// src/controllers/user.js

const helpers = require('@root/helpers')
const log = require('@root/config').loggers.dev()
const passport = require('passport')
const User = require('@models/user').model

const getLogin = (req, res) => {
  log.info('GET /login')
  res.render('login', {
    title: 'Login',
    isLoggedIn: helpers.isLoggedIn(req)
  })
}

const postLogin = (req, res) => {
  log.info('POST /login')
  res.redirect('/profile')
}

const getSignup = (req, res) => {
  log.info('GET /signup')
  res.render('signup', {
    title: 'Signup',
    isLoggedIn: helpers.isLoggedIn(req)
  })
}

const postSignup = async (req, res) => {
  log.info('POST /signup')
  const { body: {
    email,
    password,
    'password-confirmation': passwordConfirmation
  } } = req
  if (!email || !password) {
    return res.status(422).send({ message: 'Invalid email or password' })
  }
  if (password !== passwordConfirmation) {
    return res.status(422).send({ message: 'Password confirmation does not match' })
  }
  try {
    const user = new User({ email: email })
    await user.setPassword(password)
    await user.save()
    passport.authenticate('local')(req, res, function () {
      res.redirect('/profile')
    })
  } catch (err) {
    log.fatal(err)
    res.status(500).send(err)
  }
}

const getLogout = (req, res) => {
  log.info('GET /logout')
  req.logout()
  res.redirect('/')
}

const getProfile = (req, res) => {
  log.info('GET /profile')
  res.render('profile', {
    title: 'Profile',
    email: helpers.getUserEmail(req),
    isLoggedIn: helpers.isLoggedIn(req)
  })
}

const getProfileEdit = (req, res) => {
  log.info('GET /profile/edit')
  res.render('edit-profile', {
    title: 'Edit Profile',
    email: helpers.getUserEmail(req),
    isLoggedIn: helpers.isLoggedIn(req)
  })
}

const postProfileEdit = async (req, res) => {
  log.info('PUT /profile/edit')
  const { body: {
    email,
    password,
    'password-confirmation': passwordConfirmation
  } } = req
  try {
    const user = await User.findOne({ _id: helpers.getUserId(req) })
    if (password !== passwordConfirmation) return res.status(422).redirect('/profile/edit')
    if (email) user.email = email
    if (password) await user.setPassword(password)
    await user.save()
    res.redirect('/profile')
  } catch (err) {
    log.fatal(err)
    res.status(500).send(err)
  }
}

const postProfileDelete = async (req, res) => {
  log.info('DELETE /profile/edit')
  try {
    await User.deleteOne({ _id: helpers.getUserId(req) })
    res.redirect('/')
  } catch (err) {
    log.fatal(err)
    res.status(500).send(err)
  }
}

module.exports = {
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  getLogout,
  getProfile,
  getProfileEdit,
  postProfileEdit,
  postProfileDelete
}
