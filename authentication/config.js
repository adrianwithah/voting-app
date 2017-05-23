var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var db = require("./../db");

exports.getPassport = function() {
	passport.use(new LocalStrategy({
		usernameField: "username",
		passwordField: "password"
	},	
	function(username, password, callback) {
		db.findByUsername(username, function(err, userDoc) {
			if (err) {
				return callback(err);
			}
			if (!userDoc) {
				return callback(null, false);
			}
			if (userDoc.password !== password) {
				return callback(null, false);
			}
			return callback(null, {_id: userDoc._id,username: userDoc.username});
		});
	}));
	
	passport.serializeUser(function(userDoc, callback) {
		callback(null, userDoc._id);
	});

	passport.deserializeUser(function(id, callback) {
		db.findById(id, function(err, userDoc) {
			callback(err, {_id: userDoc._id,username: userDoc.username});
		});
	});
	return passport;
};

exports.userLoggedIn = function(request) {
	return (!!request.user);
}
