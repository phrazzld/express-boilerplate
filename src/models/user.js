// src/models/user.js

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const saltRounds = 10
const validator = require('validator')
const uniqueValidator = require('mongoose-unique-validator')
const log = require('@root/config').loggers.dev()

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: (value) => {
      return validator.isEmail(value)
    }
  },
  hash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

UserSchema.methods.setPassword = function (password) {
  let user = this
  return new Promise(function (resolve, reject) {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) {
        log.fatal(err)
        reject(err)
      }
      user.hash = hash
      resolve(user)
    })
  })
}

UserSchema.methods.validatePassword = function (password) {
  let user = this
  return new Promise(function (resolve, reject) {
    bcrypt.compare(password, user.hash, function (err, res) {
      if (err) {
        log.fatal(err)
        reject(err)
      }
      resolve(res)
    })
  })
}

UserSchema.plugin(uniqueValidator)

module.exports = {
  model: mongoose.model('User', UserSchema),
  schema: UserSchema
}
