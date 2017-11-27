'use strict'
const isProduction = process.env.NODE_ENV === 'production'
module.exports = isProduction
  ? require('./build/webpack.config.prod')
  : require('./build/webpack.config.dev')
