// test/routes.delete-profile.js

require('module-alias/register')
const request = require('supertest')
const log = require('@root/config').loggers.test()
const app = require('@root/app')
const proctor = require('@test/proctor')
const User = require('@models/user').model
const expect = require('chai').expect

const userCreds = { email: 'temp@user.com', password: 'temp' }
const authenticatedUser = request.agent(app)

describe('/profile/delete', function () {
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
      it('should 404', function (done) {
        request(app)
          .get('/profile/delete')
          .end(function (err, res) {
            proctor.check(err)
            expect(res.statusCode).to.equal(404)
            done()
          })
      })
    })
    describe('Authenticated', function () {
      it('should 404', function (done) {
        authenticatedUser
          .get('/profile/delete')
          .end(function (err, res) {
            proctor.check(err)
            expect(res.statusCode).to.equal(404)
            done()
          })
      })
    })
  })
  describe('POST', function () {
    describe('Unauthenticated', function () {
      it('should 302 to /401', function (done) {
        request(app)
          .post('/profile/delete')
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/error/401')
            done()
          })
      })
    })
    describe('Authenticated', function () {
      describe('Authorized', function () {
        it('should 302 to /', function (done) {
          authenticatedUser
            .post('/profile/delete')
            .end(function (err, res) {
              proctor.expectRedirect(err, res, '/')
              done()
            })
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
