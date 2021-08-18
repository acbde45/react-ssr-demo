import Home from './components/Home';
import About from './components/About';

export const routes = [
  {
    path: '/',
    component: Home,
    exact: true,
    key: 'home',
    getInitialProps: Home.getInitialProps,
  },
  {
    path: '/about',
    component: About,
    exact: true,
    key: 'about',
    getInitialProps: About.getInitialProps,
  },
];
