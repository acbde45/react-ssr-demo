const path = require('path');
const express = require('express');
const { green } = require('chalk');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('public'));
app.use(express.static('dist'));


if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackHotServerMiddleware = require('./webpack-hot-server-middleware');
  const clientWebpackConfig = require('../webpack/webpack.client');
  const serverWebpackConfig = require('../webpack/webpack.server'); 
  const compiler = webpack([clientWebpackConfig, serverWebpackConfig]);
  app.use(webpackDevMiddleware(compiler, {
    serverSideRender: true
  }));
  app.use(webpackHotMiddleware(compiler.compilers.find(compiler => compiler.name === 'client')));
  app.use(webpackHotServerMiddleware(compiler));
} else {
  const CLIENT_ASSETS_DIR = path.join(__dirname, '../dist');
  const CLIENT_STATS_PATH = path.join(CLIENT_ASSETS_DIR, 'stats.json');
  const SERVER_RENDERER_PATH = path.join(__dirname, '../dist/server.js');
  const serverRenderer = require(SERVER_RENDERER_PATH);
  const stats = require(CLIENT_STATS_PATH);
  app.use(express.static(CLIENT_ASSETS_DIR));
  app.use(serverRenderer(stats));
}

app.listen(PORT, (err) => {
  if (err) {
    process.exit(0);
  }

  console.log(green(`App is running on port ${PORT}`));
});
