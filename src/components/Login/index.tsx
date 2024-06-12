import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { DARK } from '../constants/theme';
import LoginPage from '../../pages/LoginPage';

import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

import store from '../../state';

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

ReactDom.render(
  <StyletronProvider value={engine} debugAfterHydration>
    <ReduxProvider store={store}>
      <LoginPage theme={DARK} />
    </ReduxProvider>
  </StyletronProvider>,
  reactRoot
);