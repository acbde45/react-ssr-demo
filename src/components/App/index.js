import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './index.css';

function App() {
  return (
    <div className={s.greeting}>Hello world!</div>
  );
}

export default withStyles(s)(App);
