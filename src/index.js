// src/index.js

require('module-alias/register')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path')
const MongoStore = require('connect-mongo')(session)
const config = require('@root/config')
const log = config.loggers.dev()
const routes = require('@routes/index')
const auth = require('@root/auth')
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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || 'disgusting foot secret',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}))

app.use(auth.initialize)
app.use(auth.session)
app.use(auth.setUser)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use('/', routes)

app.listen(config.port, function (err) {
  if (err) {
    log.fatal(err)
  } else {
    log.info(`Port ${config.port} operational`)
  }
})
