const path = require('path')

/**@type {import('webpack').Configuration}*/
module.exports = {
  target: 'node',
  // This leaves the source code as close as possible to the
  // original (when packaging we set this to 'production')
  mode: 'none',
  entry: path.resolve(__dirname, 'src', 'extension.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
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
}
