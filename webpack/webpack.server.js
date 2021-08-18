const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const base = require('./webpack.base');
const WebpackSSRStatsPlugin = require('./webpack-ssr-stats-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = merge(base, {
  name: 'server',
  target: 'node',
  entry: {
    server: './src/entry-server.js',
  },
  output: {
    library: {
      type: 'commonjs2',
      export: 'default',
    },
  },
  plugins: [
    isProd && new WebpackSSRStatsPlugin({
      name: 'server',
    }),
  ],
  externals: [nodeExternals()],
});
