// configs/webpack/prod.js
const { resolve } = require('path');
const { merge } = require('webpack-merge');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ts = require('typescript');
const dts = require('unplugin-dts/webpack');
const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  mode: 'production',
  plugins: [
    {
      apply(compiler) {
        // unplugin-dts logs its combined diagnostics before calling afterDiagnostic.
        compiler.hooks.infrastructureLog.tap('SimulatorDeclarations', (origin, type) => {
          if (origin === 'unplugin:dts' && type === 'error') return true;
        });

        let runtime;
        dts({
          entryRoot: commonConfig.context,
          outDirs: resolve(commonConfig.output.path, 'types'),
          // Leading "./" anchors the glob to the compiler context; a bare "**/*" also matches node_modules.
          include: ['./**/*'],
          afterBootstrap(context) {
            runtime = context;
          },
          afterDiagnostic() {
            const program = runtime.getProgram();
            const host = runtime.getHost();
            const errors = [
              ...program.getOptionsDiagnostics(),
              ...program.getSyntacticDiagnostics(),
              ...program.getDeclarationDiagnostics(),
            ].filter(({ category }) => category === ts.DiagnosticCategory.Error);

            if (errors.length) {
              throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, host));
            }
          },
        }).apply(compiler);
      },
    },
  ],

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
      new ImageMinimizerPlugin({
        test: /\.(jpe?g|png)$/i,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              jpeg: { quality: 82, progressive: true },
              png: { compressionLevel: 9 },
            },
          },
        },
      }),
    ],
  },
});
