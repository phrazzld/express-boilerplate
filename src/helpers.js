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

const isAuthenticated = (req, res, next) => {
  if (req.user != null) {
    return next()
  }
  return res.status(401).redirect('/login')
}

module.exports = {
  isLoggedIn,
  getUserEmail,
  getUserId,
  isAuthenticated
}
