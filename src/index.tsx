import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

import { Root } from './components/Root';
import { Provider as StyletronProvider, DebugEngine } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

import store from './state';
import { BrowserRouter as Router, Switch, Route, RouteComponentProps } from 'react-router-dom';
import PageRouter from './PageRouter';

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

const debug = process.env.NODE_ENV === "production" ? void 0 : new DebugEngine();

const SimPage = () => (
  <Root />
);
const BlankHome = () => (
  <div>
    <h1> Home Page - Unprotected</h1>
    <button>SignUp</button>
  </div>
  
);

const MainRoutes = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={BlankHome} />
      <Route path="/sim" component={SimPage} />
    </Switch>
  </Router>
);

ReactDom.render(
  <StyletronProvider value={engine} debug={debug} debugAfterHydration>
    <ReduxProvider store={store}>
      <PageRouter />
    </ReduxProvider>
  </StyletronProvider>,
  reactRoot
);