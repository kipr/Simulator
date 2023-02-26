import { Unsubscribe } from 'firebase/auth';
import * as React from 'react';
import { auth } from './firebase/firebase';

import { Route, Switch } from 'react-router';
import Loading from './components/Loading';
import Dashboard from './pages/Dashboard';
import Tutorials from './pages/Tutorials';
import Root from './components/Root';
import { connect } from 'react-redux';
import ChallengeRoot from './components/ChallengeRoot';
import DocumentationWindow from './components/documentation/DocumentationWindow';
import { State as ReduxState } from './state';
import { DARK } from './components/theme';

export interface AppPublicProps {

}

interface AppPrivateProps {
  login: () => void;
}

interface AppState {
  loading: boolean;
}

type Props = AppPublicProps & AppPrivateProps;
type State = AppState;

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true
    };
  }

  private onAuthStateChangedSubscription_: Unsubscribe;

  componentDidMount() {
    this.onAuthStateChangedSubscription_ = auth.onAuthStateChanged(user => {
      if (user) {
        console.log('User detected.');
        this.setState({ loading: false });
      } else {
        console.log('No user detected');
        this.props.login();
      }
    });
  }

  componentWillUnmount(): void {
    this.onAuthStateChangedSubscription_();
    this.onAuthStateChangedSubscription_ = null;
  }

  render() {
    const { props, state } = this;

    const { loading } = state;

    if (loading) return <Loading />;

    return (
      <>
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/tutorials" exact component={Tutorials} />
          <Route path="/scene/:sceneId" component={Root} />
          <Route path="/challenge/:challengeId" component={ChallengeRoot} />
        </Switch>
        <DocumentationWindow theme={DARK} />
      </>
    );
  }
}

export default connect((state: ReduxState) => {
  return {
    
  };
}, dispatch => ({
  login: () => {
    console.log('Redirecting to login page', window.location.pathname);
    window.location.href = `/login${window.location.pathname === '/login' ? '' : `?from=${window.location.pathname}`}`;
  }
}))(App) as React.ComponentType<AppPublicProps>;