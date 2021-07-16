import express from 'express';
import clearConsole from 'react-dev-utils/clearConsole';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import { matchRoutes } from "react-router-config";
import { getServerStore } from './store';
import App from './components/App';
import { routes } from './routes';

const isTTY = process.stdin.isTTY;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('dist'));
app.use(express.static('public'));

app.get('*', (req, res) => {
  const css = new Set();
  const insertCss = (...styles) => styles.forEach(style =>  css.add(style._getCss()));

  const store = getServerStore();
  const match = matchRoutes(routes, req.path);
  const promises = [];

  match.forEach((item) => {
    if (item.route.loadData) {
      const promise = new Promise((resolve, reject) => {
        item.route.loadData(store).then(resolve).catch(resolve);
      });
      promises.push(promise);
    }
  });

  Promise.all(promises).then(() => {
    const html = renderWithMarkup(renderToString(
      <StyleContext.Provider value={{ insertCss }}>
        <Provider store={store}>
          <StaticRouter location={req.path}>
            <App />
          </StaticRouter>
        </Provider>
      </StyleContext.Provider>
    ), css, store.getState());

    res.status(200).send(html);
  });
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

function renderWithMarkup(appString, css, preloadedState) {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>${[...css].join('')}</style>
  <script>
    window.context = {
      state: ${JSON.stringify(preloadedState)}
    }
  </script>
</head>
<body>
  <div id="root">${appString}</div>
  <script src="/index.js"></script>
</body>
</html>`;

  return template;
}

