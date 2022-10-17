import { Unsubscribe } from 'firebase/auth';
import * as React from 'react';
import { auth } from './firebase/firebase';

import { Route, Switch } from 'react-router';
import Loading from './components/Loading';
import Dashboard from './pages/Dashboard';
import Tutorials from './pages/Tutorials';
import Root from './components/Root';

export interface AppProps {

}

interface AppState {
  loading: boolean;
}

type Props = AppProps;
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
      } else {
        console.log('No user detected');
      }
      this.setState({ loading: false });
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
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/tutorials" exact component={Tutorials} />
        <Route path="/scene/:sceneId" component={Root} />
      </Switch>
    );
  }
}

export default App;