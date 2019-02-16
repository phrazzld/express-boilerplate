// src/auth.js

const log = require('@root/config').loggers.dev()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('@models/user').model

passport.use(new LocalStrategy({
  usernameField: 'email'
}, (email, password, done) => {
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return done(null, false, { message: `Can't find user with email ${email}` })
      }
      const validPassword = user.validatePassword(password)
      if (!validPassword) {
        return done(null, false, { message: `Invalid password` })
      }
      return done(null, user)
    })
    .catch(err => {
      log.fatal(err)
      return done(err)
    })
}))

passport.serializeUser((user, done) => {
  return done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      return done(null, user)
    })
    .catch(err => {
      log.fatal(err)
      return done(err)
    })
})

module.exports = {
  initialize: passport.initialize(),
  session: passport.session(),
  setUser: (req, res, next) => {
    res.locals.user = req.user
    return next()
  }
}
