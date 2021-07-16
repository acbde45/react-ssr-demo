import React, { Fragment } from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { Link } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { routes } from '../../routes';
import s from './index.css';

function App() {
  return (
    <Fragment>
      <nav className={s.nav}>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      {renderRoutes(routes)}
    </Fragment>
  );
}

export default withStyles(s)(App);
