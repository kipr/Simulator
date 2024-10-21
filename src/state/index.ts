import { applyMiddleware, combineReducers, compose, createStore,  } from 'redux';
import { connectRouter, RouterState, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import * as reducer from './reducer';
import { DocumentationState, ChallengeCompletions, Challenges, I18n, Robots, Scenes, Assignments, Users } from './State';
// import history from './history';
import { AsyncScene } from './State/Scene';
import { CHALLENGE_COLLECTION, CHALLENGE_COMPLETION_COLLECTION, SCENE_COLLECTION, ASSIGNMENT_COLLECTION, USER_COLLECTION } from '../db/constants';
import Record from '../db/Record';
import Selector from '../db/Selector';


export const history = createBrowserHistory();

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
export default createStore(combineReducers<State>({
  scenes: reducer.reduceScenes,
  robots: reducer.reduceRobots,
  documentation: reducer.reduceDocumentation,
  router: connectRouter((history)),
  challenges: reducer.reduceChallenges,
  challengeCompletions: reducer.reduceChallengeCompletions,
  i18n: reducer.reduceI18n,
  assignments: reducer.reduceAssignments,
  users: reducer.reduceUsers
}), composeEnhancers(
  applyMiddleware(
    routerMiddleware((history))
  )
));
/* eslint-enable @typescript-eslint/no-unsafe-call */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

export interface State {
  scenes: Scenes;
  challenges: Challenges;
  challengeCompletions: ChallengeCompletions;
  robots: Robots;
  documentation: DocumentationState;
  router: RouterState;
  i18n: I18n;
  assignments: Assignments;
  users: Users;
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
      case USER_COLLECTION: return {
        type: Record.Type.User,
        id: selector.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value: state.users[selector.id]
      };
      case ASSIGNMENT_COLLECTION: return {
        type: Record.Type.Assignment,
        id: selector.id,
        value: state.assignments[selector.id]
      };
    }
    
    return undefined;
  };
}