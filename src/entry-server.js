import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import { matchRoutes } from 'react-router-config';
import { getServerStore } from './store';
import App from './components/App';
import { routes } from './routes';

export default function serverRender(options) {
  const { clientStats } = options;
  const clientBundlePaths = clientStats.assets.filter(asset => /\.js$/.test(asset.name)).map(asset => asset.name);

  return (req, res, next) => {
    const css = new Set();
    const insertCss = (...styles) =>
      styles.forEach((style) => css.add(style._getCss()));

    const store = getServerStore();
    const match = matchRoutes(routes, req.path);
    const promises = [];

    match.forEach((item) => {
      if (item.route.getInitialProps) {
        const promise = new Promise((resolve, reject) => {
          item.route.getInitialProps(store).then(resolve).catch(resolve);
        });
        promises.push(promise);
      }
    });

    Promise.all(promises).then(() => {
      const html = renderWithMarkup({
        appString: renderToString(
          <StyleContext.Provider value={{ insertCss }}>
            <Provider store={store}>
              <StaticRouter location={req.path}>
                <App />
              </StaticRouter>
            </Provider>
          </StyleContext.Provider>
        ),
        css,
        preloadedState: store.getState(),
        clientBundlePaths,
      });

      res.status(200).send(html);
    });
  };
}

function renderWithMarkup(options) {
  const { appString, css, preloadedState, clientBundlePaths } = options;
  const allJSMarkup = clientBundlePaths.reduce((prev, path) => {
    return prev + `<script src="${path}"></script>`
  }, '');

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
  ${allJSMarkup}
</body>
</html>`;

  return template;
}
