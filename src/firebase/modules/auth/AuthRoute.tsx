import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { auth } from '../../firebase';
interface IAuthRouteProps {
  children: React.ReactNode;
  // any other props that come into the component
}

const AuthRoute: React.FunctionComponent<IAuthRouteProps> = props => {
  const { children } = props;

  // auth.currentUser provides the firebase.User object if authenticated. 
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!auth.currentUser) {
    return <Redirect to="/" />;
  }
  return (
    <div>{children}</div>
  );
};

export default AuthRoute;