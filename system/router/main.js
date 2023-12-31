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
    layout: "layout/index"
  })
})

router.get("/profile", isAuthenticated, (req, res) => {
  res.render("profile", {
    title: config.web.title,
    footer: config.web.footer,
    user: req.user,
    apikey: req.user.apikey,
    messages: req.flash()
  })
})

router.get("/feature/download", (req, res) => {
  res.render("feature/download", {
    title: config.web.title,
    footer: config.web.footer,
    tags: config.web.tags,
    user: req.user,
    apikey: req.user.apikey,
    messages: req.flash()
  })
})

router.get("/feature/ai", (req, res) => {
  res.render("feature/ai", {
    title: config.web.title,
    footer: config.web.footer,
    tags: config.web.tags,
    user: req.user,
    apikey: req.user.apikey,
    messages: req.flash()
  })
})

router.get("/feature/stalker", (req, res) => {
  res.render("feature/stalker", {
    title: config.web.title,
    footer: config.web.footer,
    tags: config.web.tags,
    user: req.user,
    apikey: req.user.apikey,
    messages: req.flash()
  })
})

router.get("/feature/anime", (req, res) => {
  res.render("feature/anime", {
    title: config.web.title,
    footer: config.web.footer,
    tags: config.web.tags,
    user: req.user,
    apikey: req.user.apikey,
    messages: req.flash()
  })
})

router.get("/feature/search", (req, res) => {
  res.render("feature/search", {
    title: config.web.title,
    footer: config.web.footer,
    tags: config.web.tags,
    user: req.user,
    apikey: req.user.apikey,
    messages: req.flash()
  })
})

module.exports = router