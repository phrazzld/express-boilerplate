// src/helpers.js

const log = require('@root/config').loggers.dev()
const User = require('@models/user').model

const isLoggedIn = req => {
  return req.user != null
}

const getUserEmail = req => {
  return isLoggedIn(req) ? req.user.email : null
}

const getUserId = req => {
  return isLoggedIn(req) ? req.user.id : null
}

const forceAuth = (req, res, next) => {
  if (req.user != null) {
    return next()
  }
  return res.status(401).redirect('/error/401')
}

module.exports = {
  isLoggedIn,
  getUserEmail,
  getUserId,
  forceAuth
}
