// test/routeTests.js

require('module-alias/register')
const request = require('supertest')
const log = require('@root/config').loggers.test()
const app = require('@root/app')
const expect = require('chai').expect

describe('GET /', function () {
  it('should set headers for security', function (done) {
    request(app)
      .get('/')
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
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        console.log(res.headers)
        expect(res.headers['x-powered-by']).to.be.undefined
        done()
      })
  })
})
