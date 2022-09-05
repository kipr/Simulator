import * as React from 'react';
import { auth } from '../../firebase';

interface IAuthRouteProps {
  children: React.ReactNode;
  // any other props that come into the component
}

const AuthRoute: React.FunctionComponent<IAuthRouteProps> = props => {
  const { children } = props;

  // auth.currentUser provides the firebase.User object if authenticated. 
  if (!auth.currentUser) {
    window.location.href = '/login';
    return null;
  }
  
  return (
    <div>{children}</div>
  );
};

export default AuthRoute;