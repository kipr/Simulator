// shared config (dev and prod)
const { resolve, join } = require('path');
const { readFileSync } = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NpmDtsPlugin = require('npm-dts-webpack-plugin')
const { DefinePlugin, IgnorePlugin } = require('webpack');
const process = require('process');

const commitHash = require('child_process').execSync('git rev-parse --short=8 HEAD').toString().trim();

let dependencies = {};
try {
  dependencies = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'dependencies', 'dependencies.json')));
} catch (e) {
  console.log('Failed to read dependencies.json');
}

const modules = ['node_modules'];
if (dependencies.cpython) modules.push(resolve(dependencies.cpython));
if (dependencies.ammo) modules.push(resolve(dependencies.ammo));

let libkiprCDocumentation = undefined;
if (dependencies.libkipr_c_documentation) {
  libkiprCDocumentation = JSON.parse(readFileSync(resolve(dependencies.libkipr_c_documentation)));
}

let i18n = {};
try {
  i18n = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'i18n', 'i18n.json')));
} catch (e) {
  console.log('Failed to read i18n.json');
  console.log(`Please run 'yarn run build-i18n'`);
  process.exit(1);
}


module.exports = {
  entry: {
    app: './index.tsx',
    login: './login/index.tsx',
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker.js',
  },
  output: {
    filename: (pathData) => {
      if (pathData.chunk.name === 'editor.worker') return 'editor.worker.bundle.js';
      if (pathData.chunk.name === 'ts.worker') return 'ts.worker.bundle.js';
      return 'js/[name].[contenthash].min.js';
    },
    path: resolve(__dirname, '../../dist'),
    publicPath: '/',
    clean: true,
  },
  externals: [
    'child_process',
    'fs',
    'path',
    'crypto',
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      fs: false,
      path: false,
    },
    alias: {
      '@i18n': resolve(__dirname, '../../src/i18n'),
    },
    symlinks: false,
    modules
  },
  context: resolve(__dirname, '../../src'),
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader', 'source-map-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['@babel/plugin-syntax-import-meta']
            }
          },
          {
            loader: 'ts-loader',
            options: {
              allowTsInNodeModules: true,
            }
          }
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          }
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg|PNG)$/i,
        use: [
          'file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false',
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: 'url-loader',
        options: {
          limit: 100000,
        },
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'index.html.ejs', excludeChunks: ['login'] }),
    new HtmlWebpackPlugin({ template: 'login/login.html.ejs', filename: 'login.html', chunks: ['login'] }),
    new DefinePlugin({
      SIMULATOR_VERSION: JSON.stringify(require('../../package.json').version),
      SIMULATOR_GIT_HASH: JSON.stringify(commitHash),
      SIMULATOR_HAS_CPYTHON: JSON.stringify(dependencies.cpython !== undefined),
      SIMULATOR_HAS_AMMO: JSON.stringify(dependencies.ammo !== undefined),
      SIMULATOR_LIBKIPR_C_DOCUMENTATION: JSON.stringify(libkiprCDocumentation),
      SIMULATOR_I18N: JSON.stringify(i18n),
    }),
    new NpmDtsPlugin({
      root: resolve(__dirname, '../../'),
      logLevel: 'error',
      force: true,
      output: resolve(__dirname, '../../dist/simulator.d.ts'),
    })
  ],
  performance: {
    hints: false,
  },
};