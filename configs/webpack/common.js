// shared config (dev and prod)
const { resolve, join } = require("path");
const { readFileSync } = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const NpmDtsPlugin = require("npm-dts-webpack-plugin");
const { DefinePlugin, IgnorePlugin } = require("webpack");
const process = require("process");

const commitHash = require("child_process")
  .execSync("git rev-parse --short=8 HEAD")
  .toString()
  .trim();

let dependencies = {};
try {
  dependencies = JSON.parse(
    readFileSync(
      resolve(__dirname, "..", "..", "dependencies", "dependencies.json")
    )
  );
} catch (e) {
  console.log("Failed to read dependencies.json");
}

const modules = ["node_modules"];
if (dependencies.cpython) modules.push(resolve(dependencies.cpython));

let libkiprCDocumentation = undefined;
let libkiprCCCommonDocumentation = undefined;
if (dependencies.libkipr_c_documentation) {
  libkiprCDocumentation = JSON.parse(
    readFileSync(resolve(dependencies.libkipr_c_documentation))
  );
}
if (dependencies.libkipr_c_common_documentation) {
  libkiprCCCommonDocumentation = JSON.parse(
    readFileSync(resolve(dependencies.libkipr_c_common_documentation))
  );
}

let i18n = {};
try {
  i18n = JSON.parse(
    readFileSync(resolve(__dirname, "..", "..", "i18n", "i18n.json"))
  );
} catch (e) {
  console.log("Failed to read i18n.json");
  console.log(`Please run 'yarn run build-i18n'`);
  process.exit(1);
}

module.exports = {
  entry: {
    app: "./index.tsx",
    login: "./components/Login/index.tsx",
    plugin: "./lms/plugin/index.tsx",
    parentalConsent: "./components/ParentalConsent/index.tsx",
    "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
    "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker.js",
  },
  output: {
    filename: (pathData) => {
      if (pathData.chunk.name === "editor.worker")
        return "editor.worker.bundle.js";
      if (pathData.chunk.name === "ts.worker") return "ts.worker.bundle.js";
      return "js/[name].[contenthash].min.js";
    },
    path: resolve(__dirname, "../../dist"),
    publicPath: "/",
    clean: true,
  },
  watchOptions: {
    ignored: /node_modules\/(?!ivygate)/,
  },

  externals: ["child_process", "fs", "path", "crypto"],
  snapshot: {
    managedPaths: [], // ensures node_modules/ivygate symlink is watched
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    fallback: {
      fs: false,
      path: false,
    },
    alias: {
      state: resolve(__dirname, "../../src/state"),
      "@i18n": resolve(__dirname, "../../src/util/i18n"),
      "@ivygate": resolve(__dirname, "../../node_modules/ivygate"),
    },
    symlinks: false,
    modules, //: [resolve(__dirname, '../../src'), 'node_modules']
  },
  watchOptions: {
    followSymlinks: true,
  },
  context: resolve(__dirname, "../../src"),
  module: {
    rules: [
      // Apply class static block transform to monaco-editor ESM sources inside node_modules
      // because we normally exclude node_modules from Babel handling.
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: ["@babel/plugin-transform-class-static-block"],
            },
          },
        ],
      },
      {
        test: /\.js$/,
        use: ["babel-loader", "source-map-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: ["@babel/plugin-syntax-import-meta"],
            },
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              allowTsInNodeModules: true,
            },
          },
        ],
        // ✅ This allows both IvyGate and Itch from node_modules
        exclude: /node_modules\/(?!ivygate|itch)/,
        include: [
          resolve(__dirname, "../../src"),
          resolve(__dirname, "../../ivygate/src"),
          resolve(__dirname, "../../node_modules/ivygate/src"),
          resolve(__dirname, "../../node_modules/itch/src"),
        ],
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg|PNG)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "img/[hash].[ext]",
            },
          },
          {
            loader: "image-webpack-loader",
            options: {
              // optimization options
              mozjpeg: { progressive: true },
              optipng: { optimizationLevel: 7 },
              gifsicle: { interlaced: false },
              pngquant: { quality: [0.65, 0.9], speed: 4 },
              // disable optimization while debugging
              disable: process.env.NODE_ENV === "development",
            },
          },
        ],
      },

      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: "url-loader",
        options: {
          limit: 100000,
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html.ejs",
      excludeChunks: ["login", "plugin", "parentalConsent"],
    }),
    new HtmlWebpackPlugin({
      template: "components/Login/login.html.ejs",
      filename: "login.html",
      chunks: ["login"],
    }),
    new HtmlWebpackPlugin({
      template: "lms/plugin/plugin.html.ejs",
      filename: "plugin.html",
      chunks: ["plugin"],
    }),
    new HtmlWebpackPlugin({
      template: "components/ParentalConsent/parental-consent.html.ejs",
      filename: "parental-consent.html",
      chunks: ["parentalConsent"],
    }),
    new DefinePlugin({
      SIMULATOR_VERSION: JSON.stringify(require("../../package.json").version),
      SIMULATOR_GIT_HASH: JSON.stringify(commitHash),
      SIMULATOR_HAS_CPYTHON: JSON.stringify(dependencies.cpython !== undefined),
      SIMULATOR_LIBKIPR_C_DOCUMENTATION: JSON.stringify(libkiprCDocumentation),
      SIMULATOR_I18N: JSON.stringify(i18n),

      // needed because ivygate relies on them being defined
      IDE_LIBKIPR_C_DOCUMENTATION: JSON.stringify(libkiprCDocumentation),
      IDE_LIBKIPR_C_COMMON_DOCUMENTATION: JSON.stringify(
        libkiprCCCommonDocumentation
      ),
      IDE_I18N: JSON.stringify(i18n),
    }),
    new NpmDtsPlugin({
      root: resolve(__dirname, "../../"),
      logLevel: "error",
      force: true,
      output: resolve(__dirname, "../../dist/simulator.d.ts"),
    }),
  ],
  performance: {
    hints: false,
  },
};
