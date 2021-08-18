const { merge } = require('webpack-merge');
const base = require('./webpack.base');
const WebpackSSRStatsPlugin = require('./webpack-ssr-stats-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = merge(base, {
  name: 'client',
  target: 'web',
  output: {
    filename: isProd ? '[name].[fullhash:8].js' : '[name].js',
  },
  entry: {
    index: './src/entry-client.js',
  },
  plugins: [
    isProd && new WebpackSSRStatsPlugin({
      name: 'client',
    }),
  ],
});
