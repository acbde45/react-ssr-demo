import React, { Fragment } from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { Link, Switch, Route } from 'react-router-dom';

import Home from '../Home';
import About from '../About';

import s from './index.css';

function App() {
  return (
    <Fragment>
      <nav className={s.nav}>
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/home">
          <Home />
        </Route>
      </Switch>
    </Fragment>
  );
}

export default withStyles(s)(App);
