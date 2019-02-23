// src/routes/index.js

const router = require('express').Router()
const log = require('@root/config').loggers.dev()
const passport = require('passport')
const helpers = require('@root/helpers')
const User = require('@models/user').model

router.get('/', (req, res) => {
  log.info('GET /')
  res.render('home', {
    title: 'Express Boilerplate',
    isLoggedIn: helpers.isLoggedIn(req)
  })
})

router.get('/login', (req, res) => {
  log.info('GET /login')
  res.render('login', {
    title: 'Login',
    isLoggedIn: helpers.isLoggedIn(req)
  })
})

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {
  log.info('POST to /login')
  return res.redirect('/profile')
})

router.get('/signup', (req, res) => {
  log.info('GET /signup')
  res.render('signup', {
    title: 'Signup',
    isLoggedIn: helpers.isLoggedIn(req)
  })
})

router.post('/signup', async (req, res) => {
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
    const finalUser = await user.save()
    passport.authenticate('local')(req, res, function () {
      res.redirect('/profile')
    })
  } catch (err) {
    log.fatal(err)
    res.status(500).send(err)
  }
})

router.get('/logout', helpers.isAuthenticated, (req, res) => {
  log.info('GET /logout')
  req.logout()
  res.redirect('/')
})

router.get('/profile', helpers.isAuthenticated, (req, res) => {
  log.info('GET /profile')
  res.render('profile', {
    title: 'Profile',
    email: helpers.getUserEmail(req),
    isLoggedIn: helpers.isLoggedIn(req)
  })
})

router.get('/profile/edit', helpers.isAuthenticated, (req, res) => {
  log.info('GET /profile/edit')
  res.render('edit-profile', {
    title: 'Edit Profile',
    email: helpers.getUserEmail(req),
    isLoggedIn: helpers.isLoggedIn(req)
  })
})

router.post('/profile/edit', helpers.isAuthenticated, async (req, res) => {
  log.info('PUT /profile/edit')
  const { body: {
    email,
    password,
    'password-confirmation': passwordConfirmation
  } } = req
  try {
    const user = await User.findOne({ _id: helpers.getUserId(req) })
    if (!user.validatePassword(password)) return res.status(422).redirect('/profile/edit')
    if (password !== passwordConfirmation) return res.status(422).redirect('/profile/edit')
    if (email) user.email = email
    if (password) await user.setPassword(password)
    await user.save()
    res.redirect('/profile')
  } catch (err) {
    log.fatal(err)
    res.status(500).send(err)
  }
})

router.post('/profile/delete', helpers.isAuthenticated, async (req, res) => {
  log.info('DELETE /profile/edit')
  try {
    await User.deleteOne({ _id: helpers.getUserId(req) })
    res.redirect('/')
  } catch (err) {
    log.fatal(err)
    res.status(500).send(err)
  }
})

module.exports = router
