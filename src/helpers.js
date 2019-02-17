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

const resetDatabase = async () => {
  try {
    const result = await User.deleteMany({})
    log.info(result)
  } catch (err) {
    log.fatal(err)
  }
}

module.exports = {
  isLoggedIn,
  getUserEmail,
  getUserId,
  resetDatabase
}
