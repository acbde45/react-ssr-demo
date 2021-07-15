import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import Logo from './logo.svg';
import s from './index.css';

function App() {
  return (
    <div className={s.App}>
      <header className={s.AppHeader}>
        <Logo className={s.AppLogo} />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className={s.AppLink}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default withStyles(s)(App);
