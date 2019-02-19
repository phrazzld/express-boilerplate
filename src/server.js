// src/server.js

require('module-alias/register')
const config = require('@root/config')
const log = config.loggers.dev()
const app = require('@root/app')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

// Set up database connection
mongoose.connect(config.mongoUrl, { server: { reconnectTries: Number.MAX_VALUE } })
mongoose.connection
  .once('open', () => {
    log.info('Mongoose successfully connected to Mongo')
  })
  .on('error', err => {
    log.fatal(err)
  })

app.listen(config.port, function (err) {
  if (err) {
    log.fatal(err)
  } else {
    log.info(`Port ${config.port} operational`)
  }
})
