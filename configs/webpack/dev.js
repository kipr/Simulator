// development config
const { merge } = require('webpack-merge');

const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  stats: {
    builtAt: true
  },
});