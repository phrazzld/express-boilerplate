// test/test.js

require('module-alias/register')
const should = require('chai').should()
const expect = require('chai').expect
const User = require('@models/user').model
const log = require('@root/config').loggers.test()
const mongoose = require('mongoose')
const proctor = require('@test/proctor')

const pass = 'passw0rd'

describe('User model', function () {
  before(async function () {
    await User.deleteMany({})
  })
  afterEach(async function () {
    await User.deleteMany({})
  })
  describe('saving new documents', function () {
    it('should fail if setPassword has not been called', async function () {
      const bob = new User({ email: 'bob@gmail.com' })
      try {
        await bob.save()
      } catch (err) {
        expect(err).to.exist
        err.should.be.an.instanceOf(Error)
        let validationFailureMessage = 'User validation failed: hash: Path `hash` is required.'
        err.message.should.equal(validationFailureMessage)
      }
    })
    it('should fail if an invalid email is passed', async function () {
      const jim = new User({ email: 'jimgmail.com' })
      try {
        await jim.setPassword(pass)
        const postSaveUser = await jim.save()
        expect(postSaveUser).to.be.null
      } catch (err) {
        expect(err).to.exist
        err.should.be.an.instanceOf(Error)
        let invalidEmailMessage = 'email: Validator failed for path `email`'
        err.message.should.include(invalidEmailMessage)
      }
    })
    it('should fail if a user with that email already exists', async function () {
      const bob = new User({ email: 'bob@gmail.com' })
      const bobby = new User({ email: 'bob@gmail.com' })
      try {
        await bob.setPassword(pass)
        await bob.save()
        await bobby.setPassword(pass)
        const postSaveBobby = await bobby.save()
        expect(postSaveBobby).to.be.null
      } catch (err) {
        expect(err).to.exist
        err.should.be.an.instanceOf(Error)
        let existingEmailMessage = 'User validation failed: email: Error, expected `email` to be unique'
        err.message.should.include(existingEmailMessage)
      }
    })
    it('should succeed if setPassword has been called', async function () {
      const bob = new User({ email: 'bob@gmail.com' })
      try {
        await bob.setPassword(pass)
        const savedBob = await bob.save()
        expect(savedBob).to.not.have.any.keys('password')
        expect(savedBob.email).to.be.a('string')
        expect(savedBob.email).to.equal('bob@gmail.com')
        expect(savedBob.password).to.be.undefined
      } catch (err) {
        proctor.check(err)
      }
    })
  })
  describe('methods', function () {
    describe('setPassword', function () {
      it('should not save the password plaintext to the user document', async function () {
        const bob = new User({ email: 'bob@gmail.com' })
        try {
          await bob.setPassword(pass)
          const savedBob = await bob.save()
          expect(savedBob).to.not.have.any.keys('password')
          Object.keys(savedBob._doc).forEach(function (key) {
            key.should.not.equal('password')
            savedBob[key].should.not.equal(pass)
          })
        } catch (err) {
          proctor.check(err)
        }
      })
      it('should save a hash to the user document', async function () {
        const bob = new User({ email: 'bob@gmail.com' })
        try {
          await bob.setPassword(pass)
          const savedBob = await bob.save()
          expect(savedBob.hash).to.be.a('string')
        } catch (err) {
          proctor.check(err)
        }
      })
    })
    describe('validatePassword', function () {
      it('should return false if given an incorrect password', async function () {
        const bob = new User({ email: 'bob@gmail.com' })
        try {
          await bob.setPassword(pass)
          const savedBob = await bob.save()
          const validPassword = await savedBob.validatePassword('incorrect')
          expect(validPassword).to.be.false
        } catch (err) {
          proctor.check(err)
        }
      })
      it('should return true if passed the correct password', async function () {
        const bob = new User({ email: 'bob@gmail.com' })
        try {
          await bob.setPassword(pass)
          await bob.save()
          const validPassword = await bob.validatePassword(pass)
          expect(validPassword).to.be.true
        } catch (err) {
          proctor.check(err)
        }
      })
    })
  })
})
