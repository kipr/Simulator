import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { SimReduxContext } from './state/context';
import { BrowserRouter } from 'react-router-dom';

import { Provider as StyletronProvider, DebugEngine } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

import store from './state';
// import history from './state/history';
import App from './App';

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

const debug = process.env.NODE_ENV === "production" ? void 0 : new DebugEngine();


if (!reactRoot) {
  throw new Error('Missing #reactRoot element');
}

const root = createRoot(reactRoot);
console.log("IvyGate path:", require.resolve("ivygate"));

root.render(
  <StyletronProvider value={engine} debug={debug} debugAfterHydration>
    <ReduxProvider store={store} context={SimReduxContext}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ReduxProvider>
  </StyletronProvider>
);