import { configureStore } from '@reduxjs/toolkit';

import counterReducer from './reducers/counter';
import listReducer from './reducers/list';

export const getClientStore = () => {
  const preloadedState = global?.window?.context ? window.context.state : {};

  return configureStore({
    preloadedState,
    reducer: {
      counter: counterReducer,
      list: listReducer,
    },
  });
};

export const getServerStore = () =>
  configureStore({
    reducer: {
      counter: counterReducer,
      list: listReducer,
    },
  });
