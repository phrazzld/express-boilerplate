// user.js

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  hash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
}

UserSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
  return this.hash === hash
}

module.exports = {
  model: mongoose.model('User', UserSchema),
  schema: UserSchema
}
