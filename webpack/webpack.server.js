const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const base = require('./webpack.base');

const isProd = process.env.NODE_ENV === 'production';

module.exports = merge(base, {
  name: 'server',
  target: 'node',
  bail: isProd,
  entry: {
    server: './src/entry-server.js',
  },
  externals: [nodeExternals()],
});
