const express = require('express');
const clearConsole = require('react-dev-utils/clearConsole');
const webpack = require('webpack');
const clientWebpackConfig = require('../webpack/webpack.client');
const serverWebpackConfig = require('../webpack/webpack.server');

const clientCompiler = webpack(clientWebpackConfig);
const serverCompiler = webpack(serverWebpackConfig);

let hasCompiled = false;

clientCompiler.run((err, stats) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  serverCompiler.run((err, stats) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    hasCompiled = true;
  });
});

const isTTY = process.stdin.isTTY;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('public'));
app.use(express.static('dist'));

app.get('*', (req, res) => {
  if (hasCompiled) {
    const serverRender = require('../dist/server');
    serverRender(req, (err, html) => {
      if (err) return;
      res.status(200).send(html);
    });
  } else {
    res.status(404).end();
  }
});

app.listen(PORT, (err) => {
  if (err) {
    process.exit(0);
  }
  if (isTTY) {
    // clearConsole();
  }
  console.log(`Server is running on port: ${PORT}`);
});
