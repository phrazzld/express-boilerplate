// src/config.js

const bunyan = require('bunyan')

module.exports = {
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/express-boilerplate',
  port: process.env.PORT || 8080,
  loggers: {
    dev: () => bunyan.createLogger({ name: 'dev', level: 'debug' }),
    prod: () => bunyan.createLogger({ name: 'prod', level: 'info' }),
    test: () => bunyan.createLogger({ name: 'test', level: 'fatal' })
  },
  isProd: process.env.NODE_ENV || false
}
