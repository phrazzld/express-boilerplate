// test/test.js

require('module-alias/register')
const should = require('chai').should()
const expect = require('chai').expect
const User = require('@models/user').model
const log = require('@root/config').loggers.test()
const mongoose = require('mongoose')

const pass = 'passw0rd'

describe('User model', function () {
  afterEach(function (done) {
    mongoose.connection.collections.users.drop(function () { done() })
  })

  describe('saving new documents', function () {
    it('should fail if setPassword has not been called', function (done) {
      const bob = new User({ email: 'bob@gmail.com' })
      bob.save()
        .then(function (user) {
          log.fatal('user should not exist')
          expect(user).to.be.null
        })
        .catch(function (err) {
          expect(err).to.exist
          err.should.be.an.instanceOf(Error)
          let validationFailureMessage = 'User validation failed: hash: Path `hash` is required.'
          err.message.should.equal(validationFailureMessage)
          done()
        })
    })

    it('should fail if an invalid email is passed', function (done) {
      const jim = new User({ email: 'jimgmail.com' })
      jim.setPassword(pass)
        .then(function (result) {
          jim.save()
            .then(function (user) {
              log.fatal('user should not exist')
              expect(user).to.be.null
            })
            .catch(function (err) {
              expect(err).to.exist
              err.should.be.an.instanceOf(Error)
              let invalidEmailMessage = 'email: Validator failed for path `email`'
              err.message.should.include(invalidEmailMessage)
              done()
            })
        })
        .catch(function (err) {
          log.fatal(err)
          expect(err).to.be.null
        })
    })

    it('should fail if a user with that email already exists', function (done) {
      const bob = new User({ email: 'bob@gmail.com' })
      const bobby = new User({ email: 'bob@gmail.com' })
      bob.setPassword(pass)
        .then(function (result) {
          bob.save()
            .then(function (bobUser) {
              expect(bobUser).to.exist
              bobby.setPassword(pass)
                .then(function (result) {
                  bobby.save()
                    .then(function (bobbyUser) {
                      log.fatal('bobby should not save')
                      expect(bobbyUser).to.be.null
                    })
                    .catch(function (err) {
                      expect(err).to.exist
                      err.should.be.an.instanceOf(Error)
                      let existingEmailMessage = 'User validation failed: email: Error, expected `email` to be unique'
                      err.message.should.include(existingEmailMessage)
                      done()
                    })
                })
                .catch(function (err) {
                  console.log('bobby.setPassword failed')
                  log.fatal(err)
                  expect(err).to.be.null
                })
            })
            .catch(function (err) {
              console.log('bob.save failed')
              log.fatal(err)
              expect(err).to.be.null
            })
        })
        .catch(function (err) {
          console.log('bob.setPassword failed')
          log.fatal(err)
          expect(err).to.be.null
        })
    })

    it('should succeed if setPassword has been called', function (done) {
      const bob = new User({ email: 'bob@gmail.com' })
      bob.setPassword(pass)
        .then(function (result) {
          bob.save()
            .then(function (user) {
              expect(user).to.not.have.any.keys('password')
              expect(user.email).to.be.a('string')
              expect(user.email).to.equal('bob@gmail.com')
              expect(user.password).to.be.undefined
              done()
            })
            .catch(function (err) {
              console.log('bob.save failed')
              log.fatal(err)
              expect(err).to.be.null
            })
        })
        .catch(function (err) {
          console.log('bob.setPassword failed')
          log.fatal(err)
          expect(err).to.be.null
        })
    })

  })

  describe('methods', function () {
    describe('setPassword', function () {
      it('should not save the password plaintext to the user document', function (done) {
        const bob = new User({ email: 'bob@gmail.com' })
        bob.setPassword(pass)
          .then(function (result) {
            bob.save()
              .then(function (user) {
                expect(user).to.not.have.any.keys('password')
                Object.keys(user._doc).forEach(function (key) {
                  key.should.not.equal('password')
                  user[key].should.not.equal(pass)
                })
                done()
              })
              .catch(function (err) {
                console.log('bob.save failed')
                log.fatal(err)
                expect(err).to.be.null
              })
          })
          .catch(function (err) {
            console.log('bob.setPassword failed')
            log.fatal(err)
            expect(err).to.be.null
          })
      })

      it('should save a hash to the user document', function (done) {
        const bob = new User({ email: 'bob@gmail.com' })
        bob.setPassword(pass)
          .then(function (result) {
            bob.save()
              .then(function (user) {
                expect(user.hash).to.be.a('string')
                done()
              })
              .catch(function (err) {
                console.log('bob.save failed')
                log.fatal(err)
                expect(err).to.be.null
              })
          })
          .catch(function (err) {
            console.log('bob.setPassword failed')
            log.fatal(err)
            expect(err).to.be.null
          })
      })
    })

    describe('validatePassword', function () {
      it('should return false if given an incorrect password', function (done) {
        const bob = new User({ email: 'bob@gmail.com' })
        bob.setPassword(pass)
          .then(function (result) {
            bob.save()
              .then(function (user) {
                user.validatePassword('incorrect')
                  .then(function (match) {
                    expect(match).to.be.false
                    done()
                  })
                  .catch(function (err) {
                    console.log('user.validatePassword failed')
                    log.fatal(err)
                    expect(err).to.be.null
                  })
              })
              .catch(function (err) {
                console.log('bob.save failed')
                log.fatal(err)
                expect(err).to.be.null
              })
          })
          .catch(function (err) {
            console.log('bob.setPassword failed')
            log.fatal(err)
            expect(err).to.be.null
          })
      })

      it('should return true if passed the correct password', function (done) {
        const bob = new User({ email: 'bob@gmail.com' })
        bob.setPassword(pass)
          .then(function (result) {
            bob.save()
              .then(function (user) {
                user.validatePassword(pass)
                  .then(function (match) {
                    expect(match).to.be.true
                    done()
                  })
                  .catch(function (err) {
                    console.log('user.validatePassword failed')
                    log.fatal(err)
                    expect(err).to.be.null
                  })
              })
              .catch(function (err) {
                console.log('bob.save failed')
                log.fatal(err)
                expect(err).to.be.null
              })
          })
          .catch(function (err) {
            console.log('bob.setPassword failed')
            log.fatal(err)
            expect(err).to.be.null
          })
      })
    })
  })
})
