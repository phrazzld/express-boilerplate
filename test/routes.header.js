// test/routes.headers.js

require('module-alias/register')
const request = require('supertest')
const app = require('@root/app')
const expect = require('chai').expect
const proctor = require('@test/proctor')

describe('Headers', function () {
  it('should be properly set', function (done) {
    request(app)
      .get('/')
      .expect('x-dns-prefetch-control', 'off')
      .expect('x-frame-options', 'SAMEORIGIN')
      .expect('strict-transport-security', 'max-age=15552000; includeSubDomains')
      .expect('x-download-options', 'noopen')
      .expect('x-content-type-options', 'nosniff')
      .expect('x-xss-protection', '1; mode=block')
      .expect('content-security-policy', /default-src \'self\'/)
      .expect('x-permitted-cross-domain-policies', 'none')
      .expect('feature-policy', /payment 'none'/)
      .expect('feature-policy', /sync-xhr 'none'/)
      .expect('feature-policy', /microphone 'none'/)
      .expect('feature-policy', /camera 'none'/)
      .expect('feature-policy', /geolocation 'none'/)
      .expect('content-type', /text\/html/)
      .end(function (err, res) {
        proctor.check(err)
        expect(res.headers['x-powered-by']).to.be.undefined
        done()
      })
  })
})
