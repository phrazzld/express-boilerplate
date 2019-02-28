// test/routes.error.js

require('module-alias/register')
const request = require('supertest')
const app = require('@root/app')
const proctor = require('@test/proctor')
const User = require('@models/user').model
const expect = require('chai').expect

const userCreds = { email: 'temp@user.com', password: 'temp' }
const authenticatedUser = request.agent(app)

describe('/', function () {
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
          .get('/error/401')
          .expect(200, done)
      })
    })
    describe('Authenticated', function () {
      it('should 200', function (done) {
        authenticatedUser
          .get('/error/404')
          .expect(200, done)
      })
    })
  })
  describe('POST', function () {
    describe('Unauthenticated', function () {
      it('should 404', function (done) {
        request(app)
          .post('/error/422')
          .expect(404, done)
      })
    })
    describe('Authenticated', function () {
      it('should 404', function (done) {
        authenticatedUser
          .post('/error/500')
          .expect(404, done)
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
