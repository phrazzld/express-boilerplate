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

module.exports = {
  getHome
}
