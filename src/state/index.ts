import { combineReducers, createStore,  } from 'redux';

import * as reducer from './reducer';

import * as React from 'react';

import { connect as reduxConnect } from 'react-redux';

const global = window as any;

export default createStore(combineReducers({
  scene: reducer.reduceScene
}), global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__());



export * from './State';