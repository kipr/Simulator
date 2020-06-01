import * as React from 'react';
import * as ReactDom from 'react-dom';
import { App } from './App';
import { Visualizer } from './Visualizer';
import { Static } from './Static';
import { Container } from './Container';

const root = document.getElementById('root');

ReactDom.render(
    <Container/>, 
root);
