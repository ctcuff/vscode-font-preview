const path = require('path')

/**@type {import('webpack').Configuration}*/
const config = {
  entry: {
    index: './src/index.tsx'
  },
  output: {
    path: path.resolve(__dirname, '../web-dist'),
    filename: '[name].js'
  },
  watchOptions: {
    ignored: './web/**'
  },
  devtool: 'nosources-source-map',
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        include: path.resolve(__dirname, '../web'),
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader']
      },
      {
        test: /\.(css|scss)$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      }
    ]
  }
}

module.exports = config
