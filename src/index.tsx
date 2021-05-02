import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Root } from './components/Root';

import { Provider as StyletronProvider, DebugEngine } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });

const debug = process.env.NODE_ENV === "production" ? void 0 : new DebugEngine();

const StyletronPr = StyletronProvider as any;

ReactDom.render(
  <StyletronPr value={engine} debug={debug} debugAfterHydration>
    <Root />
  </StyletronPr>,
  reactRoot
);