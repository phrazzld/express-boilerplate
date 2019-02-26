// test/routes.logout.js

require('module-alias/register')
const request = require('supertest')
const app = require('@root/app')
const proctor = require('@test/proctor')
const User = require('@models/user').model
const expect = require('chai').expect

const userCreds = { email: 'been@here.com', password: 'passw0rd' }
const authenticatedUser = request.agent(app)

describe('/profile', function () {
  // Setup test environment with an authenticated user account
  before(async function () {
    const user = new User({ email: userCreds.email })
    await user.setPassword(userCreds.password)
    await user.save()
    await authenticatedUser.post('/login').send(userCreds)
  })

  // Tests
  describe('GET', function () {
    describe('Authenticated', function () {
      it('should 302 to /', function (done) {
        authenticatedUser
          .get('/logout')
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/')
            done()
          })
      })
    })
    describe('Unauthenticated', function () {
      it('should 302 to /', function (done) {
        request(app)
          .get('/logout')
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/')
            done()
          })
      })
    })
  })
  describe('POST', function () {
    describe('Authenticated', function () {
      it('should 404', function (done) {
        authenticatedUser
          .post('/logout')
          .expect(404, done)
      })
    })
    describe('Unauthenticated', function () {
      it('should 404', function (done) {
        authenticatedUser
          .post('/logout')
          .expect(404, done)
      })
    })
  })

  // Cleanup
  after(async function () {
    await authenticatedUser.get('/logout')
    await User.remove({ email: userCreds.email })
  })
})
