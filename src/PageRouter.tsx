import * as React from 'react';
import { BrowserRouter as Router, Switch, Route, RouteComponentProps } from 'react-router-dom';
import { auth } from './firebase/firebase';
import routes from './pages/routes';
import AuthRoute from './firebase/modules/auth/AuthRoute';

import Loading from './components/Loading';

export interface PageRouterProps { }

const PageRouter: React.FunctionComponent<PageRouterProps> = props => {
  const [loading, setLoading] = React.useState<boolean>(true);

  // Monitor and Update user state.
  React.useEffect(() => {
    auth.onAuthStateChanged(user => {
      if (user) {
        console.log('User detected.');
      } else {
        console.log('No user detected');
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <Switch>
        {routes.map((route, index) =>
          <Route
            key={index}
            path={route.path}
            exact={route.exact}
            render={(routeProps: RouteComponentProps) => {
              if (route.protected) return <AuthRoute ><route.component {...routeProps} /></AuthRoute>;
              return <route.component  {...routeProps} />;
            }}
          />)}
      </Switch>
    </Router>
  );
};

export default PageRouter;