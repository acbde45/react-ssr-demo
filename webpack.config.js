const path = require('path');
const nodeExternal = require('webpack-node-externals');
const { merge } = require('webpack-merge');

const base = {
  mode: 'development',
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'isomorphic-style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              esModule: false,
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: 'svg-react-loader',
      }
    ],
  }
};

const client = merge(base, {
  name: 'client',
  target: 'web',
  devtool: 'source-map',
  entry: {
    index: './src/client.js',
  },
});

const server = merge(base, {
  name: 'server',
  target: 'node',
  entry: {
    server: './src/server.js',
  },
  externals: [nodeExternal()],
});

module.exports = [client, server];
