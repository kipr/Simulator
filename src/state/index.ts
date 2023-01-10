import { applyMiddleware, combineReducers, compose, createStore,  } from 'redux';

import * as reducer from './reducer';
import { ChallengeCompletions, Challenges, Robots, Scenes } from './State';
import { connectRouter, RouterState, routerMiddleware } from 'connected-react-router';
import history from './history';
import { AsyncScene } from './State/Scene';
import { CHALLENGE_COLLECTION, CHALLENGE_COMPLETION_COLLECTION, SCENE_COLLECTION } from '../db/constants';
import Record from '../db/Record';
import Selector from '../db/Selector';


// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
export default createStore(combineReducers<State>({
  scenes: reducer.reduceScenes,
  robots: reducer.reduceRobots,
  router: connectRouter(history),
  challenges: reducer.reduceChallenges,
  challengeCompletions: reducer.reduceChallengeCompletions,
}), composeEnhancers(
  applyMiddleware(
    routerMiddleware(history)
  )
));
/* eslint-enable @typescript-eslint/no-unsafe-call */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

export interface State {
  scenes: Scenes;
  challenges: Challenges;
  challengeCompletions: ChallengeCompletions;
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
      case CHALLENGE_COLLECTION: return {
        type: Record.Type.Challenge,
        id: selector.id,
        value: state.challenges[selector.id]
      };
      case CHALLENGE_COMPLETION_COLLECTION: return {
        type: Record.Type.ChallengeCompletion,
        id: selector.id,
        value: state.challengeCompletions[selector.id]
      };
    }
    
    return undefined;
  };
}