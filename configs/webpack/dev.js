// development config
const { merge } = require('webpack-merge');

const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
  stats: {
    builtAt: true
  },
});