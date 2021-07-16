import { configureStore } from '@reduxjs/toolkit';

import counterReducer from './reducers/counter';
import listReducer from './reducers/list';

export default configureStore({
  reducer: {
    counter: counterReducer,
    list: listReducer,
  },
});
