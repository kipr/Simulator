import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Root } from './components/Root';

const reactRoot = document.getElementById('reactRoot');

ReactDom.render(
    <Root />,
    reactRoot
);