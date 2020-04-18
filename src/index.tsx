import * as React from 'react';
import * as ReactDom from 'react-dom';
import { App } from './App';
import { Visualizer } from './Visualizer';
import { Static } from './Static';

const root = document.getElementById('root');

ReactDom.render(
<section id="container">
    <section id="app">
        <App/>
    </section>
    <section id="simulator">
        <svg width={1300} height={900} viewBox="0 0 1440 960" id="simulator-area">
            <Static/>
            <Visualizer {... this.children}/>
        </svg>
    </section>
</section>,
root);
