const { merge } = require('webpack-merge');
const base = require('./webpack.base');

module.exports = merge(base, {
  name: 'client',
  target: 'web',
  devtool: 'source-map',
  entry: {
    index: './src/entry-client.js',
  },
});
