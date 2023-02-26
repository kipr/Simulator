import Async from "../State/Async";
import { ChallengeCompletions } from '../State';
import construct from '../../util/construct';
import Selector from '../../db/Selector';
import db from '../../db';
import store from '..';
import { errorToAsyncError, mutate } from './util';
import ChallengeCompletion, { AsyncChallengeCompletion, ChallengeCompletionBrief } from '../State/ChallengeCompletion';
import PredicateCompletion from '../State/ChallengeCompletion/PredicateCompletion';
import Scene from '../State/Scene';
import Dict from '../../Dict';
import { OuterObjectPatch } from 'symmetry/dist';
import ProgrammingLanguage from '../../ProgrammingLanguage';
import { ReferenceFrame } from '../../unit-math';


export namespace ChallengeCompletionsAction {
  export interface LoadChallengeCompletion {
    type: 'challenge-completions/load-challenge-completion';
    challengeId: string;
  }

  export const loadChallengeCompletion = construct<LoadChallengeCompletion>('challenge-completions/load-challenge-completion');

  export interface CreateChallengeCompletion {
    type: 'challenge-completions/create-challenge-completion';
    challengeId: string;
    challengeCompletion: ChallengeCompletion;
  }

  export const createChallengeCompletion = construct<CreateChallengeCompletion>('challenge-completions/create-challenge-completion');

  export interface SaveChallengeCompletion {
    type: 'challenge-completions/save-challenge-completion';
    challengeId: string;
  }

  export const saveChallengeCompletion = construct<SaveChallengeCompletion>('challenge-completions/save-challenge-completion');

  export interface RemoveChallengeCompletion {
    type: 'challenge-completions/remove-challenge-completion';
    challengeId: string;
  }

  export const removeChallenge = construct<RemoveChallengeCompletion>('challenge-completions/remove-challenge-completion');

  export interface SetChallengeCompletionInternal {
    type: 'challenge-completions/set-challenge-completion-internal';
    challengeId: string;
    challengeCompletion: AsyncChallengeCompletion;
  }

  export const setChallengeCompletionInternal = construct<SetChallengeCompletionInternal>('challenge-completions/set-challenge-completion-internal');

  export interface SetSuccessPredicateCompletion {
    type: 'challenge-completions/set-success-predicate-completion';
    challengeId: string;
    success?: PredicateCompletion;
  }

  export const setSuccessPredicateCompletion = construct<SetSuccessPredicateCompletion>('challenge-completions/set-success-predicate-completion');

  export interface SetFailurePredicateCompletion {
    type: 'challenge-completions/set-failure-predicate-completion';
    challengeId: string;
    failure?: PredicateCompletion;
  }

  export const setFailurePredicateCompletion = construct<SetFailurePredicateCompletion>('challenge-completions/set-failure-predicate-completion');

  export interface RemoveEventState {
    type: 'challenge-completions/remove-event-state';
    challengeId: string;
    eventId: string;
  }

  export const removeEventState = construct<RemoveEventState>('challenge-completions/remove-event-state');

  export interface SetEventState {
    type: 'challenge-completions/set-event-state';
    challengeId: string;
    eventId: string;
    eventState: boolean;
  }

  export const setEventState = construct<SetEventState>('challenge-completions/set-event-state');

  export interface SetEventStates {
    type: 'challenge-completions/set-event-states';
    challengeId: string;
    eventStates: Dict<boolean>;
  }

  export const setEventStates = construct<SetEventStates>('challenge-completions/set-event-states');

  export interface SetEventStatesAndPredicateCompletions {
    type: 'challenge-completions/set-event-states-and-predicate-completions';
    challengeId: string;
    eventStates: Dict<boolean>;
    success?: PredicateCompletion;
    failure?: PredicateCompletion;
  }

  export const setEventStatesAndPredicateCompletions = construct<SetEventStatesAndPredicateCompletions>('challenge-completions/set-event-states-and-predicate-completions');

  export interface SetSceneDiff {
    type: 'challenge-completions/set-scene-diff';
    challengeId: string;
    sceneDiff: OuterObjectPatch<Scene>;
  }

  export const setSceneDiff = construct<SetSceneDiff>('challenge-completions/set-scene-diff');

  export interface ResetChallengeCompletion {
    type: 'challenge-completions/reset-challenge-completion';
    challengeId: string;
  }

  export const resetChallengeCompletion = construct<ResetChallengeCompletion>('challenge-completions/reset-challenge-completion');

  export interface SetCode {
    type: 'challenge-completions/set-code';
    challengeId: string;
    language: ProgrammingLanguage;
    code: string;
  }

  export const setCode = construct<SetCode>('challenge-completions/set-code');

  export interface SetCurrentLanguage {
    type: 'challenge-completions/set-current-language';
    challengeId: string;
    language: ProgrammingLanguage;
  }

  export const setCurrentLanguage = construct<SetCurrentLanguage>('challenge-completions/set-current-language');

  export interface SetRobotLinkOrigins {
    type: 'challenge-completions/set-robot-link-origins';
    challengeId: string;
    robotLinkOrigins: Dict<Dict<ReferenceFrame>>;
  }

  export const setRobotLinkOrigins = construct<SetRobotLinkOrigins>('challenge-completions/set-robot-link-origins');
}

export type ChallengeCompletionsAction = (
  ChallengeCompletionsAction.LoadChallengeCompletion |
  ChallengeCompletionsAction.CreateChallengeCompletion |
  ChallengeCompletionsAction.SaveChallengeCompletion |
  ChallengeCompletionsAction.RemoveChallengeCompletion |
  ChallengeCompletionsAction.SetChallengeCompletionInternal |
  ChallengeCompletionsAction.SetSuccessPredicateCompletion |
  ChallengeCompletionsAction.SetFailurePredicateCompletion |
  ChallengeCompletionsAction.RemoveEventState |
  ChallengeCompletionsAction.SetEventState |
  ChallengeCompletionsAction.SetEventStates |
  ChallengeCompletionsAction.SetEventStatesAndPredicateCompletions |
  ChallengeCompletionsAction.SetSceneDiff |
  ChallengeCompletionsAction.ResetChallengeCompletion |
  ChallengeCompletionsAction.SetCode |
  ChallengeCompletionsAction.SetCurrentLanguage |
  ChallengeCompletionsAction.SetRobotLinkOrigins
);

const DEFAULT_CHALLENGE_COMPLETIONS: ChallengeCompletions = {
};

const create = async (challengeId: string, next: Async.Creating<ChallengeCompletion>) => {
  try {
    await db.set(Selector.challengeCompletion(challengeId), next.value);
    store.dispatch(ChallengeCompletionsAction.setChallengeCompletionInternal({
      challengeCompletion: Async.loaded({
        brief: {},
        value: next.value
      }),
      challengeId,
    }));
  } catch (error) {
    store.dispatch(ChallengeCompletionsAction.setChallengeCompletionInternal({
      challengeCompletion: Async.createFailed({
        value: next.value,
        error: errorToAsyncError(error),
      }),
      challengeId,
    }));
  }
};

const save = async (challengeId: string, current: Async.Saveable<ChallengeCompletionBrief, ChallengeCompletion>) => {
  try {
    await db.set(Selector.challengeCompletion(challengeId), current.value);

    const latest = Async.latestValue(store.getState().challengeCompletions[challengeId]);

    let next: AsyncChallengeCompletion;
    if (latest === current.value) {
      next = Async.loaded({
        brief: current.brief,
        value: current.value
      });
    } else {
      next = Async.saveable({
        brief: current.brief,
        original: current.value,
        value: latest,
      });
    }
    store.dispatch(ChallengeCompletionsAction.setChallengeCompletionInternal({
      challengeCompletion: next,
      challengeId,
    }));
  } catch (error) {
    store.dispatch(ChallengeCompletionsAction.setChallengeCompletionInternal({
      challengeCompletion: Async.saveFailed({
        brief: current.brief,
        original: current.original,
        value: current.value,
        error: errorToAsyncError(error),
      }),
      challengeId,
    }));
  }
};

const load = async (challengeId: string, current: AsyncChallengeCompletion | undefined) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<ChallengeCompletion>(Selector.challengeCompletion(challengeId));
    store.dispatch(ChallengeCompletionsAction.setChallengeCompletionInternal({
      challengeCompletion: Async.loaded({ brief, value }),
      challengeId,
    }));
  } catch (error) {
    store.dispatch(ChallengeCompletionsAction.setChallengeCompletionInternal({
      challengeCompletion: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      challengeId,
    }));
  }
};

const remove = async (challengeId: string, next: Async.Deleting<ChallengeCompletionBrief, ChallengeCompletion>) => {
  try {
    await db.delete(Selector.challengeCompletion(challengeId));
    store.dispatch(ChallengeCompletionsAction.setChallengeCompletionInternal({ challengeId, challengeCompletion: undefined }));
  } catch (error) {
    store.dispatch(ChallengeCompletionsAction.setChallengeCompletionInternal({
      challengeCompletion: Async.deleteFailed({ brief: next.brief, value: next.value, error: errorToAsyncError(error) }),
      challengeId,
    }));
  }
};

export const reduceChallengeCompletions = (state: ChallengeCompletions = DEFAULT_CHALLENGE_COMPLETIONS, action: ChallengeCompletionsAction): ChallengeCompletions => {
  switch (action.type) {
    case 'challenge-completions/load-challenge-completion': {
      void load(action.challengeId, state[action.challengeId]);
      return {
        ...state,
        [action.challengeId]: Async.loading({ brief: Async.brief(state[action.challengeId]) }),
      };
    }
    case 'challenge-completions/create-challenge-completion': {
      const creating = Async.creating({ value: action.challengeCompletion });
      void create(action.challengeId, creating);
      return {
        ...state,
        [action.challengeId]: creating,
      };
    }
    case 'challenge-completions/save-challenge-completion': {
      const current = state[action.challengeId];
      if (current.type !== Async.Type.Saveable) return state;
      void save(action.challengeId, current);
      return {
        ...state,
        [action.challengeId]: Async.saving({
          brief: current.brief,
          original: current.original,
          value: current.value,
        }),
      };
    }
    case 'challenge-completions/remove-challenge-completion': {
      const current = state[action.challengeId];
      const deleting = Async.deleting({
        brief: Async.brief(current),
        value: Async.latestValue(current)
      });

      void remove(action.challengeId, deleting);

      return {
        ...state,
        [action.challengeId]: deleting,
      };
    }
    case 'challenge-completions/set-challenge-completion-internal': return {
      ...state,
      [action.challengeId]: action.challengeCompletion,
    };
    case 'challenge-completions/set-success-predicate-completion': return mutate(state, action.challengeId, challenge => {
      challenge.success = action.success;
    });
    case 'challenge-completions/set-failure-predicate-completion': return mutate(state, action.challengeId, challenge => {
      challenge.failure = action.failure;
    });
    case 'challenge-completions/remove-event-state': return mutate(state, action.challengeId, challenge => {
      delete challenge.eventStates[action.eventId];
    });
    case 'challenge-completions/set-event-state': return mutate(state, action.challengeId, challenge => {
      challenge.eventStates[action.eventId] = action.eventState;
    });
    case 'challenge-completions/set-event-states': return mutate(state, action.challengeId, challenge => {
      challenge.eventStates = action.eventStates;
    });
    case 'challenge-completions/set-event-states-and-predicate-completions': return mutate(state, action.challengeId, challenge => {
      challenge.eventStates = action.eventStates;
      challenge.success = action.success;
      challenge.failure = action.failure;
    });
    case 'challenge-completions/set-scene-diff': return mutate(state, action.challengeId, challenge => {
      challenge.serializedSceneDiff = JSON.stringify(action.sceneDiff);
    });
    case 'challenge-completions/reset-challenge-completion': return mutate(state, action.challengeId, challenge => {
      challenge.eventStates = {};
      challenge.success = undefined;
      challenge.failure = undefined;
      challenge.serializedSceneDiff = JSON.stringify({ t: "o" });
    });
    case 'challenge-completions/set-code': return mutate(state, action.challengeId, challenge => {
      challenge.code[action.language] = action.code;
    });
    case 'challenge-completions/set-current-language': return mutate(state, action.challengeId, challenge => {
      challenge.currentLanguage = action.language;
    });
    case 'challenge-completions/set-robot-link-origins': return mutate(state, action.challengeId, challenge => {
      challenge.robotLinkOrigins = action.robotLinkOrigins;
    });
    default: return state;
  }
};