# react-ssr-demo
一个简单react服务端渲染demo

## 如何开发
````
npm install
npm run dev
````

## webpack配置

### 通用的webpack配置
客户端和服务端的webpack配置都是基于通用配置拓展而来。

````javascript
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  bail: isProd,
  output: {
    publicPath: '/',
    path: path.join(__dirname, '../dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'isomorphic-style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              esModule: false,
            }
          }
        ]
      }
    ],
  }
}
````

需要注意的两个地方：
* 使用isomorphic-style-loader同构服务端和客户端的css。
* bail在生产环境构建时需要开启，只要出错就停止打包。

### 客户端webpack配置

````javascript
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
````

需要注意的是：
* target设置为web，表示在浏览器端使用，如果引用了node相关模块，会报错。

### 服务端webpack配置

````javascript
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const base = require('./webpack.base');

module.exports = merge(base, {
  name: 'server',
  target: 'node',
  entry: {
    server: './src/entry-server.js',
  },
  externals: [nodeExternals()],
});
````

需要注意的是：
* target设置为node，externals里需要排除node环境中内置的包。

## 启动和构建配置

````bash
"scripts": {
  "dev": "cross-env NODE_ENV=development npm-run-all --parallel dev:**",
  "dev:start": "nodemon dist/server.js",
  "dev:build:client": "webpack --config webpack/webpack.client.js --watch",
  "dev:build:server": "webpack --config webpack/webpack.server.js --watch",
  "build": "cross-env NODE_ENV=production npm-run-all --parallel build:**",
  "build:client": "webpack --config webpack/webpack.client.js",
  "build:server": "webpack --config webpack/webpack.server.js"
},
````

需要注意的是：
* 通过cross-env在process.env里设置常量NODE_ENV，表示当前是开发环境还是生产环境。
* npm-run-all 批量执行命令，dev:**匹配所有`dev:`开头的命令，--parallel表示并发执行。
* 开发环境使用webpack --watch监听的方式监听入口文件。

## 入口文件
分客户端和服务端，服务端只能把组件渲染成字符串，需要在客户端同构，添加事件。

### 客户端入口
````javascript
import React from 'react';
import ReactDOM from 'react-dom';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from './components/App';
import { getClientStore } from './store';


const insertCss = (...styles) => {
    const removeCss = styles.map(style => style._insertCss());
    return () => removeCss.forEach(dispose => dispose());
}

ReactDOM.hydrate(
  <StyleContext.Provider value={{ insertCss }}>
    <Provider store={getClientStore()}>
      <Router>
        <App />
      </Router>
    </Provider>
  </StyleContext.Provider>,
  document.getElementById('root')
);
````

需要注意的是：
* ReactDOM.hydrate在浏览器执行的时候，会检查生成的dom，如果一致，会为这些dom添加事件，进行同构。

### 服务端入口

````javascript
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
````

需要注意的是：
* 设置dist和public作为静态文件的目录，客户端入口文件会打包成dist/index.js，在index.html里引用。
* 通过react-dom/server里的renderToString方法，将组件渲染成字符串，需要用babel转换，因此，启动服务端的脚本是dist/server.js。
* renderToString方法渲染出来的dom需要放在id为root的div下，因此用字符串插值的方法插入的html模版里。

## 路由
路由使用react-router-dom，但是客户端和服务端使用的Router不同。客户端使用的是BrowserRouter，服务端用的是StaticRouter，需要传入req.path。

````javascript
import { renderRoutes } from 'react-router-config';
...
export const routes = [
  {
    path: '/',
    component: Home,
    exact: true,
    key: 'home',
    loadData: Home.loadData,
  },
  {
    path: '/about',
    component: About,
    exact: true,
    key: 'about',
    loadData: About.loadData,
  },
];
...
{renderRoutes(routes)}
...
````

loadData方法用来在服务端获取数据，保存在redux的store里，在entry-server.js可以看到，服务端获取的数据，通过
````javascript
window.context = {
  state: ${JSON.stringify(preloadedState)}
}
````
的方式挂载到了window.context属性上，这样在客户端就可以取到，然后同构到客户端的redux的store里，这样客户端数据就不用再调接口获取了。

````javascript
import { matchRoutes } from 'react-router-config';
...
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
````

matchRoutes通过path匹配到对应路由，然后递归的调用loadData方法，并且把它们的结果放到promises数组里，使用Promise.all保证这些数据都在服务端获取完之后，再渲染页面。

````javascript
export const getClientStore = () => {
  const preloadedState = window.context ? window.context.state : {};

  return configureStore({
    preloadedState,
    reducer: {
      counter: counterReducer,
      list: listReducer,
    },
  });
};

export const getServerStore = () => configureStore({
  reducer: {
    counter: counterReducer,
    list: listReducer,
  },
});
````


