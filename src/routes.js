import Home from './components/Home';
import About from './components/About';

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
