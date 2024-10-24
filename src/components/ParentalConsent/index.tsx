import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DARK } from '../constants/theme';

import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";
import ParentalConsentPage from '../../pages/ParentalConsentPage';

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

const userId = window.location.pathname.split('/').pop();
const token = new URLSearchParams(window.location.search).get('token');

ReactDom.render(
  <StyletronProvider value={engine} debugAfterHydration>
    <ParentalConsentPage theme={DARK} userId={userId} token={token} />
  </StyletronProvider>,
  reactRoot
);