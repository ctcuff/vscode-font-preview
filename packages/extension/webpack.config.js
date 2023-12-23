const path = require('path')
const { DefinePlugin } = require('webpack')
const ESLintPlugin = require('eslint-webpack-plugin')

/**
 * @param {Record<string, string>} env
 * @returns {{import('webpack').Configuration}}
 */
const config = env => ({
  plugins: [
    new DefinePlugin({ 'process.env.DEBUG': JSON.stringify(env.debug) }),
    new ESLintPlugin({
      context: './',
      emitError: true,
      emitWarning: true,
      failOnError: true
    })
  ],
  target: 'node',
  // This leaves the source code as close as possible to the
  // original (when packaging we set this to 'production')
  mode: 'none',
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    path: path.resolve(__dirname, '..', '..', 'dist'),
    // Note that the the web directory builds to the same directory as
    // the extension so we need to make sure that the entry points for
    // both don't conflict with each other
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  devtool: 'nosources-source-map',
  externals: {
    // The vscode-module is created on-the-fly and must be excluded.
    // Modules added here also need to be added in the .vsceignore file
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'html-loader'
      }
    ]
  }
})

module.exports = config
