// src/routes/index.js

const router = require('express').Router()
const helpers = require('@root/helpers')
const passport = require('passport')
const userController = require('@controllers/user')
const pageController = require('@controllers/page')

router.get('/', pageController.getHome)

router.get('/login', userController.getLogin)
router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  userController.postLogin
)
router.get('/signup', userController.getSignup)
router.post('/signup', userController.postSignup)
router.get('/logout', userController.getLogout)
router.get('/profile', helpers.forceAuth, userController.getProfile)
router.get('/profile/edit', helpers.forceAuth, userController.getProfileEdit)
router.post('/profile/edit', helpers.forceAuth, userController.postProfileEdit)
router.post('/profile/delete', helpers.forceAuth, userController.postProfileDelete)

module.exports = router
