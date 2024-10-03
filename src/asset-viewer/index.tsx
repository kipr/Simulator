import * as React from 'react';
import * as ReactDom from 'react-dom';


import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

import { Provider as ReduxProvider } from 'react-redux';
import store from '../state';
import AssetViewerPage from './AssetViewerPage';

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

ReactDom.render(
  <StyletronProvider value={engine} debugAfterHydration>
    <ReduxProvider store={store}>
      <AssetViewerPage />
    </ReduxProvider>
  </StyletronProvider>,
  reactRoot
);