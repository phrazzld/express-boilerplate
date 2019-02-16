// test/connection.js
//
// Without requirements or design,
// programming is the art of adding bugs to an empty text file.

require('module-alias/register')

const mongoose = require('mongoose')
const config = require('@root/config')
const log = config.loggers.test()

mongoose.Promise = global.Promise

before(function (done) {
  mongoose.connect(config.mongoUrl)
  mongoose.connection
    .once('open', function () {
      done()
    })
    .on('error', function (err) {
      log.fatal(err)
    })
})

afterEach(function (done) {
  mongoose.connection.collections.users.drop(function () {
    done()
  })
})

after(function (done) {
  mongoose.connection.close()
  done()
})
