const path = require('path');
const nodeExternal = require('webpack-node-externals');
const { merge } = require('webpack-merge');

const base = {
  mode: 'production',
  // bail: true,
  devtool: 'source-map',
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
      }
    ],
  }
};

const client = merge(base, {
  name: 'client',
  target: 'web',
  entry: {
    index: './src/index.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ],
  }
});

const server = merge(base, {
  name: 'server',
  target: 'node',
  entry: {
    server: './server.js',
  },
  externals: [nodeExternal()],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'isomorphic-style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  }
});

module.exports = [client, server];
