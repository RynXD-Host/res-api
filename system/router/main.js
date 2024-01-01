const config = require("../../config.js")

const passport = require('passport');
const express = require("express");
const router = express.Router();

const _path = process.cwd()

function isAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Silahkan Masuk Untun Memulai Session.');
  res.redirect('/auth/login');
}

router.get("/", (req, res) => {
  res.render("home", {
    title: config.web.title,
    footer: config.web.footer,
  })
})

router.get("/docs", (req, res) => {
  res.render("example", {
    title: config.web.title,
    footer: config.web.footer,
    tags: config.web.tags
  })
})

router.get("/dashboard", isAuthenticated, (req, res) => {
  res.render('index', {
    config,
    user: req.user,
    apikey: req.user.apikey,
  })
})

router.get("/users/profile", isAuthenticated, (req, res) => {
  res.render("profile", {
    title: config.web.title,
    footer: config.web.footer,
    user: req.user,
    apikey: req.user.apikey,
    messages: req.flash()
  })
})

router.get("/feature/:action", isAuthenticated, (req, res) => {
	const action = req.params.action;
	
	try {
	  let feature; 
	  switch (action) {
		case "download":
		  feature = "download";
		  break
		case "ai": 
		  feature = "ai";
		  break
		case "anime":
		  feature = "anime";
		  break
		case "stalker":
		  feature = "stalker";
		  break  
		case "search":
		  feature = "search";
		  break  
		default:
		  feature = ""
	  }
	  
	  res.render("feature/" + action, {
	  	config: config,
	  	user: req.user,
	  	apikey: req.user.apikey,
	  	messages: req.flash()
	  })
	} catch (e) {
		console.error(e)
	}
})

module.exports = router