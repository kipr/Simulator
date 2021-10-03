import IRoute from "./interfaces/route.interface";
import Dashboard from "./Dashboard";
import { Root } from '../components/Root';
import HomePage from "./HomePage";

const routes: IRoute[] = [
  {
    path: '/',
    exact: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    component: HomePage,
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