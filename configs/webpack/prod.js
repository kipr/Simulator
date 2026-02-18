// configs/webpack/prod.js
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  mode: 'production',

  optimization: {
    // 1) Split Monaco into a dedicated chunk so we can exclude it from Terser
    splitChunks: {
      cacheGroups: {
        monaco: {
          test: /[\\/]node_modules[\\/]monaco-editor[\\/]/,
          name: 'monaco',
          chunks: 'all',
          enforce: true,
        },
      },
    },

    // 2) Keep minification for everything else
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // Exclude the emitted monaco chunk from minification.
        // Works for names like: monaco.<hash>.js, monaco~app.<hash>.js, etc.
        exclude: [/monaco.*\.(js|mjs)$/],
      }),
    ],
  },
});
