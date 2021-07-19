const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const base = require('./webpack.base');

module.exports = merge(base, {
  name: 'server',
  target: 'node',
  entry: {
    server: './src/entry-server.js',
  },
  externals: [nodeExternals()],
});
