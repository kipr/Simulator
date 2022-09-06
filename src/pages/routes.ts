import IRoute from "./interfaces/route.interface";
import Dashboard from "./Dashboard";
import { Root } from '../components/Root';
import Tutorials from "./Tutorials";

const routes: IRoute[] = [
  {
    path: '/',
    exact: true,
    component: Dashboard,
    name: 'Home Page',
    protected: true
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
  },
  {
    path: '/tutorials',
    exact: true,
    component: Tutorials,
    name: 'Tutorials',
    protected: true
  },

];
export default routes;