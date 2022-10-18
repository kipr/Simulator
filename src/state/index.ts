import { applyMiddleware, combineReducers, compose, createStore,  } from 'redux';

import * as reducer from './reducer';
import { Robots, Scenes } from './State';
import { connectRouter, RouterState, routerMiddleware } from 'connected-react-router';
import history from './history';


// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const global = window as any;

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
export default createStore(combineReducers<State>({
  scenes: reducer.reduceScenes,
  robots: reducer.reduceRobots,
  router: connectRouter(history),
}), composeEnhancers(
  applyMiddleware(
    routerMiddleware(history)
  )
));
/* eslint-enable @typescript-eslint/no-unsafe-call */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

export interface State {
  scenes: Scenes;
  robots: Robots;
  router: RouterState;
}