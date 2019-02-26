// test/routes.profile.js

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
      it('should 200', function (done) {
        authenticatedUser
          .get('/profile')
          .expect(200, done)
      })
    })
    describe('Unauthenticated', function () {
      it('should 302 to /401', function (done) {
        request(app)
          .get('/profile')
          .send(userCreds)
          .end(function (err, res) {
            proctor.expectRedirect(err, res, '/error/401')
            done()
          })
      })
    })
  })
  describe('POST', function () {
    it('should 404', function (done) {
      authenticatedUser
        .post('/profile')
        .send(userCreds)
        .end(function (err, res) {
          proctor.check(err)
          expect(res.statusCode).to.equal(404)
          done()
        })
    })
  })

  // Cleanup
  after(async function () {
    await authenticatedUser.get('/logout')
    await User.remove({ email: userCreds.email })
  })
})
