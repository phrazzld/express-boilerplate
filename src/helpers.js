// src/helpers.js

const log = require('@root/config').loggers.dev()
const User = require('@models/user').model

const isLoggedIn = req => {
  return req.user == null ? false : true
}

const getUserEmail = req => {
  return isLoggedIn(req) ? req.user.email : null
}

const getUserId = req => {
  return isLoggedIn(req) ? req.user.id : null
}

const resetDatabase = () => {
  User.deleteMany({})
    .then((result) => {
      log.info(result)
    })
    .catch((err) => {
      log.fatal(err)
    })
}

module.exports = {
  isLoggedIn,
  getUserEmail,
  getUserId,
  resetDatabase
}
