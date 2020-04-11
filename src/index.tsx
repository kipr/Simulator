import * as React from 'react';
import * as ReactDom from 'react-dom';
import { App } from './App';
import { Visualizer } from './Visualizer'

const root = document.getElementById('root');

//ReactDom.render(<svg width={500} height={300}><img src={'static/Demobot.png'} width={500} height={300}/></svg>,root);
ReactDom.render(
<html>
    <div id="app">
        <App/>
    </div>
    <div id="visualizer">
        <Visualizer {... this.children}/>
    </div>
</html>,
root);
