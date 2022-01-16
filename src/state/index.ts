import { combineReducers, createStore,  } from 'redux';

import * as reducer from './reducer';

import * as React from 'react';

import { connect as reduxConnect } from 'react-redux';
import Scene from './State/Scene';
import { Scenes } from './State';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const global = window as any;

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
export default createStore(combineReducers({
  scene: reducer.reduceScene,
  scenes: reducer.reduceScenes
}), global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__());
/* eslint-enable @typescript-eslint/no-unsafe-call */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */


export interface State {
  scene: Scene;
  scenes: Scenes;
}