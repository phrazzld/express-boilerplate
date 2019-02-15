// src/auth.js

const log = require('@root/config').loggers.dev()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('@models/user').model

passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email }).exec()
    const validPassword = await user.validatePassword(password)
    if (!user || !validPassword) {
      return done(null, false, { message: 'Invalid username or password' })
    }
    return done(null, user)
  } catch (err) {
    log.fatal(err)
    return done(err)
  }
}))

passport.serializeUser((user, done) => {
  return done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec()
    return done(null, user)
  } catch (err) {
    log.fatal(err)
    return done(err)
  }
})

module.exports = {
  initialize: passport.initialize(),
  session: passport.session(),
  setUser: (req, res, next) => {
    res.locals.user = req.user
    return next()
  }
}
