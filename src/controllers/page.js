// src/controllers/page.js

const log = require('@root/config').loggers.dev()
const helpers = require('@root/helpers')

const getHome = (req, res) => {
  log.info('GET /')
  res.render('home', {
    title: 'Express Boilerplate',
    isLoggedIn: helpers.isLoggedIn(req)
  })
}

const getError = (req, res) => {
  const statusCode = req.params.statusCode
  log.info(`GET /error/${statusCode}`)
  res.render('error', {
    title: `${statusCode} error`,
    statusCode: statusCode
  })
}

module.exports = {
  getHome,
  getError
}
