/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import IRoute from "./interfaces/route.interface";
import Dashboard from "./Dashboard";
import { Root } from '../components/Root';
import HomePage from "./HomePage";

const routes: IRoute[] = [
  {
    path: '/',
    exact: true,
    component: HomePage,
    name: 'Home Page',
    protected: false
  },
  {
    path: '/signup',
    exact: false,
    component: HomePage,
    index: 1,
    name: 'Home Page',
    protected: false
  },
  {
    path: '/dashboard',
    exact: true,
    component: Dashboard,
    name: 'Dashboard',
    protected: true
  },
  {
    path: '/sim',
    exact: true,
    component: Root,
    name: 'Simulator',
    protected: true
  }

];
export default routes;