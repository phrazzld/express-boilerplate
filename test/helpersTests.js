// test/helpersTest.js

require('module-alias/register')
const helpers = require('@root/helpers')
const expect = require('chai').expect

const userId = '123'
const userEmail = 'test@mctest.com'
const loggedInRequest = {
  user: { id: userId, email: userEmail }
}
const anonymousRequest = {
  stuff: { n: 'things' }
}
const res = {
  type: 'response',
  status: function (n) {
    console.log(`status code ${n}`)
    return {
      status: n,
      redirect: function (page) {
        console.log(`redirecting to ${page}`)
        return { status: n, redirectedTo: page }
      }
    }
  }
}
const next = () => {
  console.log('next() called')
  return true
}

describe('isLoggedIn', function () {
  it('should return true if req.user is defined', function () {
    let result = helpers.isLoggedIn(loggedInRequest)
    expect(result).to.be.true
  })

  it('should return false if req.user is undefined', function () {
    let result = helpers.isLoggedIn(anonymousRequest)
    expect(result).to.be.false
  })
})

describe('getUserEmail', function () {
  it('should return req.user.email when the user is logged in', function () {
    let result = helpers.getUserEmail(loggedInRequest)
    expect(result).to.equal(userEmail)
  })

  it('should return null when the user is not logged in', function () {
    let result = helpers.getUserEmail(anonymousRequest)
    expect(result).to.be.null
  })
})

describe('getUserId', function () {
  it('should return req.user.id when the user is logged in', function () {
    let result = helpers.getUserId(loggedInRequest)
    expect(result).to.equal(userId)
  })

  it('should return null when the user is not logged in', function () {
    let result = helpers.getUserEmail(anonymousRequest)
    expect(result).to.be.null
  })
})

describe('isAuthenticated', function () {
  it('should return next() when user is logged in', function () {
    let result = helpers.isAuthenticated(loggedInRequest, res, next)
    expect(result).to.be.true
  })

  it('should return a redirect to login when user is not logged in', function () {
    let result = helpers.isAuthenticated(anonymousRequest, res, next)
    expect(result.status).to.equal(401)
    expect(result.redirectedTo).to.equal('/login')
  })
})
