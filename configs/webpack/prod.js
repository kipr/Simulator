// production config
const merge = require('webpack-merge');
const {resolve} = require('path');

const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  mode: 'production',
  entry: {
    app: './index.tsx',
    worker: './worker.ts'
  },
  output: {
    filename: 'js/[name].min.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: '/',
  },
  plugins: [],
  node: {
    fs: 'empty',
  },
});