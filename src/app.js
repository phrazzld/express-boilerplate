// src/app.js

const express = require('express')
const app = express()
const helmet = require('helmet')
app.use(helmet())
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)
const config = require('@root/config')
const log = config.loggers.dev()
const routes = require('@routes/index')
const auth = require('@root/auth')

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

module.exports = app
