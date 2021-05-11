// development config
const { merge } = require('webpack-merge');
const { join } = require('path');

const commonConfig = require('./common');
const { cwd } = require('process');

module.exports = merge(commonConfig, {
  mode: 'development',
  output: {
    filename: 'js/[name].min.js',
    path: join(cwd(), 'dist'),
  },
  devtool: 'eval-cheap-module-source-map',
  stats: {
    builtAt: true
  }
});