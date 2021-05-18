// development config
const { merge } = require('webpack-merge');

const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  mode: 'development',
  output: {
    filename: 'js/[name].[contenthash].min.js',
  },
  devtool: 'eval-cheap-module-source-map',
  stats: {
    builtAt: true
  }
});