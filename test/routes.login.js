// test/routes.login.js

require('module-alias/register')
const request = require('supertest')
const app = require('@root/app')
const proctor = require('@test/proctor')
const User = require('@models/user').model
const expect = require('chai').expect

const userCreds = { email: 'been@here.com', password: 'passw0rd' }
const authenticatedUser = request.agent(app)

describe('/login', function () {
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

  // Tests
  describe('GET', function () {
    describe('Unauthenticated', function () {
      it('should 200', function (done) {
        request(app)
          .get('/login')
          .expect(200, done)
      })
    })
    describe('Authenticated', function () {
      it('should 302 to /profile', function (done) {
        authenticatedUser
          .get('/login')
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/profile')
            done()
          })
      })
    })
  })
  describe('POST', function () {
    describe('Unauthenticated', function () {
      it('valid user credentials should 302 to /profile', function (done) {
        request(app)
          .post('/login')
          .send(userCreds)
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/profile')
            done()
          })
      })
      it('invalid user credentials should 302 to /login', function (done) {
        request(app)
          .post('/login')
          .send({ email: userCreds.email, password: 'badpass' })
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/login')
            done()
          })
      })
    })
    describe('Authenticated', function () {
      it('should 302 to /profile', function (done) {
        authenticatedUser
          .post('/login')
          .send(userCreds)
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
