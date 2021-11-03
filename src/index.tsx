import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

import { Provider as StyletronProvider, DebugEngine } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

import store from './state';
import PageRouter from './PageRouter';

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

const debug = process.env.NODE_ENV === "production" ? void 0 : new DebugEngine();

ReactDom.render(
  <StyletronProvider value={engine} debug={debug} debugAfterHydration>
    <ReduxProvider store={store}>
      <PageRouter />
    </ReduxProvider>
  </StyletronProvider>,
  reactRoot
);