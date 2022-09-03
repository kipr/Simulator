import { combineReducers, createStore,  } from 'redux';

import * as reducer from './reducer';
import Scene from './State/Scene';
import { Robots, Scenes } from './State';
import { RobotState } from '../RobotState';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const global = window as any;

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
export default createStore(combineReducers<State>({
  scene: reducer.reduceScene,
  scenes: reducer.reduceScenes,
  robotState: reducer.reduceRobotState,
  robots: reducer.reduceRobots,
}), global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__());
/* eslint-enable @typescript-eslint/no-unsafe-call */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

export interface State {
  scene: ReferencedScenePair;
  scenes: Scenes;
  robots: Robots;
  robotState: RobotState;
}

export interface ReferencedScenePair {
  referenceScene: Scene;
  workingScene: Scene;
}