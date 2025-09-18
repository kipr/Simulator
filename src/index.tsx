import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

import { Provider as StyletronProvider, DebugEngine } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";
import { createRoot } from 'react-dom/client';
import store, { history } from './state';
// import history from './state/history';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

const debug = process.env.NODE_ENV === "production" ? void 0 : new DebugEngine();


// ReactDom.render(

//   reactRoot
// );

if (reactRoot) {
  createRoot(reactRoot).render(
    <StyletronProvider value={engine} debug={debug} debugAfterHydration>
      <ReduxProvider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ReduxProvider>
    </StyletronProvider>
  );
}