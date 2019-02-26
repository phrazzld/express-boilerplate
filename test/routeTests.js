// test/routeTests.js

require('module-alias/register')
const request = require('supertest')
const log = require('@root/config').loggers.test()
const app = require('@root/app')
const expect = require('chai').expect
const User = require('@models/user').model
const proctor = require('@test/proctor')

const unrestrictedRoutes = [ '/', '/login', '/signup' ]
const restrictedRoutes = [ '/profile', '/profile/edit' ]
const userCreds = {
  email: 'test@test.com',
  password: 'passw0rd',
  'password-confirmation': 'passw0rd'
}
const existingUser = { email: 'been@here.com', password: 'passw0rd' }
const authenticatedUser = request.agent(app)

const handleError = err => {
  if (err) {
    log.fatal(err)
    expect(err).to.be.null
  }
}

describe('Route testing', function () {
  before(async function () {
    const user = new User({ email: existingUser.email })
    await user.setPassword(existingUser.password)
    await user.save()
    await authenticatedUser
      .post('/login')
      .send(existingUser)
      .end(function (err, res) {
        handleError(err)
        expect(res.statusCode).to.equal(302)
      })
  })
  unrestrictedRoutes.forEach(function (route) {
    describe(`GET ${route}`, function () {
      it('headers should be set safely', function (done) {
        request(app)
          .get(route)
          .expect('x-dns-prefetch-control', 'off')
          .expect('x-frame-options', 'SAMEORIGIN')
          .expect('strict-transport-security', 'max-age=15552000; includeSubDomains')
          .expect('x-download-options', 'noopen')
          .expect('x-content-type-options', 'nosniff')
          .expect('x-xss-protection', '1; mode=block')
          .expect('content-security-policy', 'default-src \'self\'')
          .expect('x-permitted-cross-domain-policies', 'none')
          .expect('feature-policy', /vibrate 'none'/)
          .expect('feature-policy', /payment 'none'/)
          .expect('feature-policy', /sync-xhr 'none'/)
          .expect('feature-policy', /notifications 'none'/)
          .expect('feature-policy', /microphone 'none'/)
          .expect('feature-policy', /camera 'none'/)
          .expect('feature-policy', /geolocation 'none'/)
          .expect('content-type', /text\/html/)
          .end(function (err, res) {
            if (err) return done(err)
            expect(res.headers['x-powered-by']).to.be.undefined
            done()
          })
      })
      it('should respond with 200', function (done) {
        request(app)
          .get(route)
          .expect(200, done)
      })
    })
  })
  restrictedRoutes.forEach(function (route) {
    describe(`GET ${route}`, function () {
      it('should 302 to /login', function (done) {
        request(app)
          .get(route)
          .expect(302)
          .end(function (err, res) {
            handleError(err)
            expect(res.text).to.include('Found. Redirecting to /login')
            done()
          })
      })
    })
  })
  describe('/profile with a logged in user', function () {
    it('should 200', function (done) {
      authenticatedUser
        .get('/profile')
        .expect(200, done)
    })
  })
  describe('POST', function () {
    describe('/signup', function () {
      it('should 302 when sent valid credentials', function (done) {
        request(app)
          .post('/signup')
          .send(userCreds)
          .end(function (err, res) {
            handleError(err)
            expect(res.text).to.include('Found. Redirecting to /profile')
            done()
          })
      })
      it('should 422 if password and confirmation do not match', function (done) {
        let badCreds = userCreds
        badCreds['password-confirmation'] = 'wrong'
        request(app)
          .post('/signup')
          .send(badCreds)
          .expect(422, done)
      })
      it('should 422 if email field is empty', function (done) {
        let badCreds = userCreds
        badCreds.email = null  // undefined? empty string?
        request(app)
          .post('/signup')
          .send(badCreds)
          .expect(422, done)
      })
      it('should 422 if password field is empty', function (done) {
        let badCreds = userCreds
        badCreds.password = null
        request(app)
          .post('/signup')
          .send(badCreds)
          .expect(422, done)
      })
      it('should 422 if sent an invalid email', function (done) {
        let badCreds = userCreds
        badCreds.email = 'whoatyahoo.com'
        request(app)
          .post('/signup')
          .send(badCreds)
          .expect(422, done)
      })
      it('should 500 if signing up an existing user', function (done) {
        let badCreds = existingUser
        badCreds['password-confirmation'] = existingUser.password
        request(app)
          .post('/signup')
          .send(badCreds)
          .expect(500, done)
      })
    })
    describe('/login', function () {
      it('should 302 to /profile when sent valid credentials', function (done) {
        request(app)
          .post('/login')
          .send(existingUser)
          .end(function (err, res) {
            handleError(err)
            expect(res.text).to.include('Found. Redirecting to /profile')
            done()
          })
      })
      it('should 302 to /login when sent invalid credentials', function (done) {
        let badCreds = existingUser
        badCreds.password = 'nope'
        request(app)
          .post('/login')
          .send(badCreds)
          .end(function (err, res) {
            handleError(err)
            expect(res.text).to.include('Found. Redirecting to /login')
            done()
          })
      })
    })
    describe('/profile/edit', function () {
      it('should 302 to /profile with email updated if sent valid credentials',
        function (done) {
          authenticatedUser
            .post('/profile/edit')
            .send({
              email: 'changeup@jack.com',
              password: 'passw0rd',
              'password-confirmation': 'passw0rd'
            })
            .end(function (err, res) {
              handleError(err)
              expect(res.statusCode).to.equal(302)
              expect(res.text).to.include('Found. Redirecting to /profile')
              done()
            })
        })
    })
    describe('/profile/delete', function () {
      it('should 302 to / if sent as authenticated user', function (done) {
        authenticatedUser
          .post('/profile/delete')
          .end(function (err, res) {
            handleError(err)
            expect(res.text).to.equal('Found. Redirecting to /')
            done()
          })
      })
      it('should 302 to /login if sent as unauthenticated user', function (done) {
        request(app)
          .post('/profile/delete')
          .end(function (err, res) {
            handleError(err)
            expect(res.text).to.equal('Found. Redirecting to /login')
            done()
          })
      })
    })
  })

  // Cleanup
  after(async function () {
    try {
      await User.deleteMany({})
    } catch (err) {
      proctor.check(err)
    }
  })
})
