import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Container } from './Container';

const reactRoot = document.getElementById('reactRoot');

ReactDom.render(
    <Container />,
    reactRoot
);