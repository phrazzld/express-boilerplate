// test/config.js

require('module-alias/register')
const config = require('@root/config')

describe('Config', function () {
  it('should set mongoUrl to something reasonable')
  it('should set port to a number')
  it('should have bunyan loggers defined for dev, prod, and test')
  it('should have isProd set based on NODE_ENV')
})
