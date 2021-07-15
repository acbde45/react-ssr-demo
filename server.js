const express = require('express');
const clearConsole = require('react-dev-utils/clearConsole');
const { renderToString } = require('react-dom/server');

const isTTY = process.stdin.isTTY;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('dist'));

app.get('*', (req, res) => {
  const html = renderWithMarkup(renderToString(require('./src/index-server')));
  res.status(200).send(html);
});

app.listen(PORT, (err) => {
  if (err) {
    process.exit(0);
  }
  if (isTTY) {
    clearConsole();
  }
  console.log(`Server is running on port: ${PORT}`);
});

function renderWithMarkup(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id="root">${content}</div>
  <script src="/index.js"></script>
</body>
</html>`;
}

