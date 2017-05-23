var express = require("express");
var app = express();
var path = require("path");
var authenticator = require("./authentication");
var passport = authenticator.getPassport();
var multer = require("multer");
var upload = multer();
var db =  require("./db");

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"views")));
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/",function(request, response) {
	db.getAllPolls(function(err, pollDocs) {
		if (err) {
			console.log(err);
			return;
		}
		if (authenticator.userLoggedIn(request)) {
			response.render("homepage",{public: false,username: request.user.username,polls: pollDocs});
			return;
		}
		response.render("homepage",{public: true,polls: pollDocs});
	});
});
app.get("/login", function(request, response) {
	if (authenticator.userLoggedIn(request)) {
		response.redirect("/");
		return;
	}
	response.render("login",{error: false});
});
app.post("/login",function(request,response) {
	passport.authenticate("local",function(err, user, info) {
		if (err) {
			console.log(err);
			return;
		}
		if (!user) {
			response.render("login",{error: true});
			return;
		}
		request.logIn(user, function(err) {
			if (err) {
				console.log(err);
				return;
			}
			response.redirect("/");
			return;
		});
	})(request,response);
});
app.post("/logout", function(request, response) {
	request.logout();
	response.redirect("/");
});
app.get("/signup", function(request, response) {
	if (authenticator.userLoggedIn(request)) {
		response.redirect("/");
		return;
	}
	console.log(request.headers);
	response.render("signup",{error: false});	
});
app.post("/signup",upload.fields([{"name":"username","name":"password"}]),function(request, response) {
	db.insertNewUser(request.body["username"],request.body["password"],function(err,updateSuccessful) {
		if (err) {
			console.log(err);
			return;
		}
		if (!updateSuccessful) {
			console.log("UPDATE UNSUCCESSFUL!");
			response.render("signup",{error: true});
			return;
		}
		response.redirect("/login");
	});
});
app.get("/mypolls", function(request, response) {
	if (!authenticator.userLoggedIn(request)) {
		response.redirect("/login");
		return;
	}
	db.findPollsByOwner(request.user.username, function(err, pollDocs) {
		if (err) {
			console.log(err);
			return;
		}
		response.render("user-mypolls",{username:request.user.username,polls: pollDocs});
	});
});
app.get("/newpoll", function(request, response) {
	if (!authenticator.userLoggedIn(request)) {
		response.redirect("/login");
		return;
	}
	response.render("user-newpoll",{username: request.user.username});
});
app.get("/poll/:POLL_ID", function(request, response) {
	if (db.isValidObjectId(request.params.POLL_ID)) {
		response.redirect("/");
		return;
	}
	db.findPollById(request.params.POLL_ID, function(err, pollDoc) {
		if (err) {
			console.log(err);
			return;
		}
		if (pollDoc === null) {
			response.redirect("/");
		}
		if (authenticator.userLoggedIn(request)) {
			response.render("pollpage",{"pollDetails":pollDoc,"public":false,"username":request.user.username});
			return;
		}
		response.render("pollpage",{"pollDetails":pollDoc,"public":true});
	});
});
app.post("/vote/:POLL_ID", function(request, response) {
	var rawFormData = request.body["poll-option"];
	var isNewPollOption = (rawFormData.slice(0,3) === "new");
	//value of radio buttons will be prefixed with "old" or "new", depending on type of option.
	db.updatePoll(request.params.POLL_ID,rawFormData.slice(4),isNewPollOption,function(err,updateSuccessful) {
		if (err) {
			console.log(err);
			return;
		}
		response.redirect("/poll/" + request.params.POLL_ID);
	});
});
app.post("/delete/:POLL_ID", upload.single("poll-id"), function(request, response) {
	db.deletePoll(request.body["poll-id"], function(err,deleteSuccessful) {
		if (err) {
			console.log(err);
			return;
		}
	});
});
app.post("/newpoll",upload.fields([{"name":"poll-title","maxCount":"1"},{"name":"poll-option"}]),function(request, response) {
	db.insertNewPoll(request.body["poll-title"],request.body["poll-option"],request.user,function(err, pollId) {
		if (err) {
			console.log(err);
			return;
		}
		response.redirect("/poll/" + pollId);
	});
});
app.listen(process.env.PORT || 5000);