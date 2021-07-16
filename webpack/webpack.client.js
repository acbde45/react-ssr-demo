const { merge } = require('webpack-merge');
const base = require('./webpack.base');

const isProd = process.env.NODE_ENV === 'production';

module.exports = merge(base, {
  name: 'client',
  target: 'web',
  bail: isProd,
  devtool: 'source-map',
  entry: {
    index: './src/entry-client.js',
  },
});
