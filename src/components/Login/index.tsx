import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { DARK } from '../constants/theme';
import LoginPage from '../../pages/LoginPage';

import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

import store from '../../state';

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

if (!reactRoot) {
  throw new Error('Missing #reactRoot element');
}

const root = createRoot(reactRoot);
root.render(
  <StyletronProvider value={engine} debugAfterHydration>
    <ReduxProvider store={store}>
      <LoginPage theme={DARK} />
    </ReduxProvider>
  </StyletronProvider>
);