// test/routes.signup.js

require('module-alias/register')
const request = require('supertest')
const app = require('@root/app')
const proctor = require('@test/proctor')
const User = require('@models/user').model
const expect = require('chai').expect

const userCreds = { email: 'been@here.com', password: 'passw0rd' }
const authenticatedUser = request.agent(app)

describe('/signup', function () {
  // Set up authenticated user
  before(async function () {
    try {
      const user = new User({ email: userCreds.email })
      await user.setPassword(userCreds.password)
      await user.save()
      await authenticatedUser.post('/login').send(userCreds)
    } catch (err) {
      proctor.check(err)
    }
  })

  describe('GET', function () {
    describe('Authenticated', function () {
      it('should 302 to /profile', function (done) {
        authenticatedUser
          .get('/signup')
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/profile')
            done()
          })
      })
    })
    describe('Unauthenticated', function () {
      it('should 200', function (done) {
        request(app)
          .get('/signup')
          .expect(200, done)
      })
    })
  })
  describe('POST', function () {
    describe('Authenticated', function () {
      it('should 302 to /500', function (done) {
        authenticatedUser
          .post('/signup')
          .send({
            email: userCreds.email,
            password: userCreds.password,
            'password-confirmation': userCreds.password
          })
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/error/500')
            done()
          })
      })
    })
    describe('Unauthenticated', function () {
      const signupCreds = {
        email: 'howdy@partner.com',
        password: 'yeehaw',
        'password-confirmation': 'yeehaw'
      }
      it('should 422 when sent an empty email field', function (done) {
        request(app)
          .post('/signup')
          .send({
            password: signupCreds.password,
            'password-confirmation': signupCreds.password
          })
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/error/422')
            done()
          })
      })
      it('should 422 when sent an empty password field', function (done) {
        request(app)
          .post('/signup')
          .send({ email: signupCreds.email })
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/error/422')
            done()
          })
      })
      it('should 422 when password and confirmation do not match', function (done) {
        request(app)
          .post('/signup')
          .send({
            email: signupCreds.email,
            password: signupCreds.password,
            'password-confirmation': 'badpass'
          })
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/error/422')
            done()
          })
      })
      it('should 302 to /500 when sending credentials already associated with a user',
        function (done) {
          request(app)
            .post('/signup')
            .send({
              email: userCreds.email,
              password: userCreds.password,
              'password-confirmation': userCreds.password
            })
            .end(function (err, res) {
              proctor.expectRedirect(err, res, '/error/500')
              done()
            })
        })
      it('should 302 to /profile when sent valid signup credentials',
        function (done) {
          request(app)
            .post('/signup')
            .send(signupCreds)
            .end(function (err, res) {
              proctor.expectRedirect(err, res, '/profile')
              done()
            })
        })
    })
  })

  // Cleanup
  after(async function () {
    try {
      await User.remove({ email: userCreds.email })
      await authenticatedUser.get('/logout')
    } catch (err) {
      proctor.check(err)
    }
  })
})
