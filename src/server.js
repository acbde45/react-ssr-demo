const fs = require('fs');
const path = require('path');
const express = require('express');
const clearConsole = require('react-dev-utils/clearConsole');
const React = require('react');
const { renderToString } = require('react-dom/server');
const StyleContext = require('isomorphic-style-loader/StyleContext')
const App = require('./components/App').default;

const isTTY = process.stdin.isTTY;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('dist'));

app.get('*', (req, res) => {
  const css = new Set();
  const insertCss = (...styles) => styles.forEach(style =>  css.add(style._getCss()));
  
  const html = renderWithMarkup(renderToString(
    <StyleContext.Provider value={{ insertCss }}>
      <App />
    </StyleContext.Provider>
  ), css);
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

function renderWithMarkup(appString, css) {
  const template = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf-8');
  const nextTemplate = template
    .replace('<app></app>', appString)
    .replace('<css></css>', `<style>${[...css].join('')}</style>`);

  return nextTemplate;
}

