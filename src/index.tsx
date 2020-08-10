import * as React from 'react';
import * as ReactDom from 'react-dom';
import { App } from './App';
import { Visualizer } from './Visualizer';
import { Static } from './Static';
import { Container } from './Container';
import { SimulatorArea } from './SimulatorArea';

// const root = document.getElementById('root');
// const right = document.getElementById('right');

const reactRoot = document.getElementById('reactRoot');

// ReactDom.render(
//     <Container />,
//     root);

// ReactDom.render(
//     <SimulatorArea />,
//     right
// );

ReactDom.render(
    <Container />,
    reactRoot
);