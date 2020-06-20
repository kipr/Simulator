// development config
const merge = require('webpack-merge');
const { join } = require('path');

const commonConfig = require('./common');
const { cwd } = require('process');

module.exports = merge(commonConfig, {
  mode: 'development',
  entry: {
    app: './index.tsx',
    worker: './worker.ts'
  },
  output: {
    filename: 'js/[name].min.js',
    path: join(cwd(), 'dist'),
  },
  devtool: 'cheap-module-eval-source-map',
  plugins: [],
});