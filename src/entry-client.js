import React from 'react';
import ReactDOM from 'react-dom';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from './components/App';
import { getClientStore } from './store';

const insertCss = (...styles) => {
  const removeCss = styles.map((style) => style._insertCss());
  return () => removeCss.forEach((dispose) => dispose());
};

if (global?.window?.document) {
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
}
