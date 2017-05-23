var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var databaseUrl = process.env.DATABASE_URL;

exports.isValidObjectId = function(id) {
	return id.match(new RegExp("^[0-9a-fA-F]{24}$")) === null;
}
exports.findByUsername = function(username,callback) {
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) {
			console.log("Unable to connect mongoDB server", err);
			return callback(err);
		}
		db.collection("votingUsers").findOne({"username": username}, function(err, userDoc) {
			db.close();
			if (err) {
				return callback(err);
			}
			return callback(null, userDoc);
		});
	});
};

exports.findById = function(id, callback) {
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) {
			console.log("Unable to connect mongoDB server", err);
			return callback(err);
		}
		db.collection("votingUsers").findOne({"_id": mongodb.ObjectId(id)}, function(err, userDoc) {
			db.close();
			if (err) {
				return callback(err);
			}
			return callback(null, userDoc);
		});
	});
};

exports.insertNewUser = function(username,password,callback) {
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) {
			console.log("Unable to connect mongoDB server", err);
			return callback(err);
		}
		db.collection("votingUsers").update(
		{
			"username": username
		},
		{
			$setOnInsert: {
				"username": username,
				"password": password
			}
		},
		{
			"upsert": true
		},function(err, writeResult) {
			db.close();
			if (err) {
				return callback(err);
			}
			return callback(null,writeResult.result.upserted !== undefined);
		});
	});
}

exports.findPollById = function(id, callback) {
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) {
			console.log("Unable to connect mongoDB server", err);
			return callback(err);
		}
		db.collection("votingPolls").findOne({"_id": mongodb.ObjectId(id)}, function(err, pollDoc) {
			db.close();
			if (err) {
				return callback(err);
			}
			return callback(null, pollDoc);
		});
	});
};

exports.insertNewPoll = function(pollTitle,options,owner,callback) {
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) {
			console.log("Unable to connect mongoDB server", err);
			return callback(err);
		}
		db.collection("votingPolls").insertOne({
			"pollTitle": pollTitle,
			"options": options.map(function(optionTitle) {
				return {"optionTitle": optionTitle, "optionVoteCount": 0};
			}),
			"owner": owner
		},function(err, writeResult) {
			db.close();
			if (err) {
				return callback(err);
			}
			return callback(null,writeResult.insertedId);
		});
	});
};

exports.getAllPolls = function(callback) {
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) {
			console.log("Unable to connect mongoDB server", err);
			return callback(err);
		}
		db.collection("votingPolls").find().toArray(function(err, pollDocs) {
			db.close();
			if (err) {
				return callback(err);
			}
			return callback(null, pollDocs);
		});
	});
}

exports.findPollsByOwner = function(owner, callback) {
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) {
			console.log("Unable to connect mongoDB server", err);
			return callback(err);
		}
		db.collection("votingPolls").find({"owner.username": owner}).toArray(function(err, pollDocs) {
			db.close();
			if (err) {
				return callback(err);
			}
			return callback(null, pollDocs);
		});
	});
}

exports.updatePoll = function(pollId,selectedPollOption,isNewPollOption,callback) {
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) {
			console.log("Unable to connect mongoDB server", err);
			return callback(err);
		}
		if (isNewPollOption) {
			db.collection("votingPolls").update({"_id":mongodb.ObjectId(pollId),"options.optionTitle":{$ne: selectedPollOption}},{$push: {"options": {"optionTitle": selectedPollOption,"optionVoteCount": 1}}},
			function(err, updateResult) {
				if (err) {
					return callback(err);
				}
				return callback(null,updateResult.result.nModified === 1);				
			});
			return;
		}
		db.collection("votingPolls").update(
		{"_id":mongodb.ObjectId(pollId),"options.optionTitle": selectedPollOption},
		{$inc : {"options.$.optionVoteCount": 1}},
		function(err, writeResult) {
			if (err) {
				return callback(err);
			}
			return callback(null,true);
		});
	});
}
exports.deletePoll = function(pollId, callback) {
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) {
			console.log("Unable to connect mongoDB server", err);
			return callback(err);
		}
		db.collection("votingPolls").deleteOne({"_id": mongodb.ObjectId(pollId)},function(err, deleteResult) {
			db.close();
			if (err) {
				return callback(err);
			}
			return callback(null);
		});
	});
}