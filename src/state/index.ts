import { applyMiddleware, combineReducers, compose, createStore,  } from 'redux';

import * as reducer from './reducer';
import { Robots, Scenes } from './State';
import { connectRouter, RouterState, routerMiddleware } from 'connected-react-router';
import history from './history';
import { AsyncScene } from './State/Scene';
import { SCENE_COLLECTION } from '../db/constants';
import Record from '../db/Record';
import Selector from '../db/Selector';


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

export namespace State {
  export const lookup = (state: State, selector: Selector): Record | undefined => {
    switch (selector.collection) {
      case SCENE_COLLECTION: return {
        type: Record.Type.Scene,
        id: selector.id,
        value: state.scenes[selector.id]
      };
    }
    
    return undefined;
  };
}