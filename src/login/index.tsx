import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DARK } from '../components/theme';
import LoginPage from './LoginPage';

import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

ReactDom.render(
  <StyletronProvider value={engine} debugAfterHydration>
    <LoginPage theme={DARK} />
  </StyletronProvider>,
  reactRoot
);