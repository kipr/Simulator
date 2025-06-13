import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { Unsubscribe } from 'firebase/auth';
import { connect } from 'react-redux';

import { State as ReduxState } from './state';
import { auth } from './firebase/firebase';

import Dashboard from './pages/Dashboard';
import Tutorials from './pages/Tutorials';
import Leaderboard from './pages/Leaderboard';

import Loading from './components/Loading';
import Root from './pages/Root';
import ChallengeRoot from './pages/ChallengeRoot';
import DocumentationWindow from './components/documentation/DocumentationWindow';
import AiWindow from './components/Ai/AiWindow';
import { DARK } from './components/constants/theme';
import CurriculumPage from './lms/CurriculumPage';
import { UsersAction } from './state/reducer';
import db from './db';
import Selector from './db/Selector';
import DbError from './db/Error';
import UserConsent from './consent/UserConsent';
import LegalAcceptance from './consent/LegalAcceptance';

export interface AppPublicProps {

}

interface AppPrivateProps {
  login: () => void;
  setMe: (me: string) => void;
  loadUser: (uid: string) => void;
}

interface AppState {
  loading: boolean;
}

type Props = AppPublicProps & AppPrivateProps;
type State = AppState;

/**
 * `App` is the main component of the application, responsible for handling user authentication
 * and rendering the primary routes and components of the application. It listens for authentication
 * state changes and manages the rendering of different components based on the authentication state.
 *
 * Props:
 *   - `login`: A function to be called when no user is detected to handle the login process.
 *
 * State:
 *   - `loading`: A boolean indicating whether the application is still loading the user state.
 *
 * Lifecycle Methods:
 *   - `componentDidMount`: Sets up a subscription to authentication state changes. If a user is 
 *     detected, it sets `loading` to false, otherwise it triggers the `login` function from props.
 *   - `componentWillUnmount`: Cleans up the authentication state change subscription.
 *
 * Render Method:
 *   - Returns a `Loading` component if the application is still loading.
 *   - Once loading is complete, it renders the primary routes of the application and the 
 *     `DocumentationWindow` component with a dark theme.
 *
 * Note: This component also maintains a private field `onAuthStateChangedSubscription_` for managing
 * the subscription to the authentication state changes.
 */
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
        this.props.loadUser(user.uid);
        this.props.setMe(user.uid);

        // Ensure user has obtained consent before continuing
        db.get<UserConsent>(Selector.user(user.uid))
          .then(userConsent => {
            const consentStatus = LegalAcceptance.getConsentStatus(userConsent?.legalAcceptance);
            if (consentStatus === 'valid') {
              console.log('Consent verified');
              this.setState({ loading: false });
            } else {
              console.log('Consent not verified, status is', consentStatus);
              this.props.login();
            }
          })
          .catch(error => {
            if (DbError.is(error) && error.code === DbError.CODE_NOT_FOUND) {
              console.log('Consent info does not exist');
              this.props.login();
            }

            // TODO: show user an error
            console.error('Failed to read user consent from DB');
          });
      } else {
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
          <Route path="/leaderboard" exact component={Leaderboard} />
          <Route path="/scene/:sceneId" component={Root} />
          <Route path="/challenge/:challengeId" component={ChallengeRoot} />
          <Route path="/curriculum" component={CurriculumPage} />
          <Redirect to="/" />
        </Switch>
        <DocumentationWindow theme={DARK} />
      </>
    );
  }
}

/**
 * Connects the `App` component to the Redux store and dispatch actions.
 * 
 * The `connect` function from Redux is used to bind the Redux state and dispatch actions to the 
 * `App` component's props. This allows `App` to access and interact with the global state managed 
 * by Redux and to trigger actions that can modify that state.
 *
 * State Mapping:
 *   - Currently, no state from the Redux store is being mapped to the `App` component's props.
 *     This can be updated in future to pass required state properties from the Redux store.
 *
 * Dispatch Mapping:
 *   - `login`: A function that gets dispatched when the user is not authenticated. It logs the 
 *     current pathname, then redirects the user to the login page, appending the 'from' query 
 *     parameter with the current pathname unless the current pathname is '/login'.
 *
 * The connected `App` component is then exported as the default export of this module. The 
 * `as React.ComponentType<AppPublicProps>` part ensures that TypeScript understands the types of 
 * the props passed to `App` after it has been connected to Redux, enhancing type safety and 
 * IntelliSense in IDEs.
 *
 * Note: This is a standard pattern for integrating React components with Redux in a TypeScript
 * environment. The `connect` function can be further customized to map more state properties or
 * dispatch more actions as needed.
 */
export default connect((state: ReduxState) => {
  return {
    
  };
}, dispatch => ({
  login: () => {
    console.log('Redirecting to login page', window.location.pathname);
    window.location.href = `/login${window.location.pathname === '/login' ? '' : `?from=${window.location.pathname}`}`;
  },
  setMe: (me: string) => dispatch(UsersAction.setMe({ me })),
  loadUser: (uid: string) => dispatch(UsersAction.loadOrEmptyUser({ userId: uid }))
}))(App) as React.ComponentType<AppPublicProps>;