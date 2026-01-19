import { OuterObjectPatch } from 'symmetry/dist';

import store from '..';
import { LimitedChallengeCompletions } from '../State';
import Async from "../State/Async";
import Scene from '../State/Scene';
import LimitedChallengeCompletion, { AsyncLimitedChallengeCompletion, LimitedChallengeCompletionBrief } from '../State/LimitedChallengeCompletion';
import PredicateCompletion from '../State/ChallengeCompletion/PredicateCompletion';

import Selector from '../../db/Selector';
import db from '../../db';
import DbError from '../../db/Error';

import { errorToAsyncError, mutate } from './util';
import construct from '../../util/redux/construct';
import Dict from '../../util/objectOps/Dict';
import { ReferenceFramewUnits } from '../../util/math/unitMath';

import ProgrammingLanguage from '../../programming/compiler/ProgrammingLanguage';

export namespace LimitedChallengeCompletionsAction {
  export interface LoadLimitedChallengeCompletion {
    type: 'limited-challenge-completions/load-challenge-completion';
    challengeId: string;
  }

  export const loadLimitedChallengeCompletion = construct<LoadLimitedChallengeCompletion>('limited-challenge-completions/load-challenge-completion');

  export interface CreateLimitedChallengeCompletion {
    type: 'limited-challenge-completions/create-challenge-completion';
    challengeId: string;
    challengeCompletion: LimitedChallengeCompletion;
  }

  export const createLimitedChallengeCompletion = construct<CreateLimitedChallengeCompletion>('limited-challenge-completions/create-challenge-completion');

  export interface SaveLimitedChallengeCompletion {
    type: 'limited-challenge-completions/save-challenge-completion';
    challengeId: string;
  }

  export const saveLimitedChallengeCompletion = construct<SaveLimitedChallengeCompletion>('limited-challenge-completions/save-challenge-completion');

  export interface RemoveLimitedChallengeCompletion {
    type: 'limited-challenge-completions/remove-challenge-completion';
    challengeId: string;
  }

  export const removeLimitedChallengeCompletion = construct<RemoveLimitedChallengeCompletion>('limited-challenge-completions/remove-challenge-completion');

  export interface SetLimitedChallengeCompletionInternal {
    type: 'limited-challenge-completions/set-challenge-completion-internal';
    challengeId: string;
    challengeCompletion: AsyncLimitedChallengeCompletion;
  }

  export const setLimitedChallengeCompletionInternal = construct<SetLimitedChallengeCompletionInternal>('limited-challenge-completions/set-challenge-completion-internal');

  export interface SetSuccessPredicateCompletion {
    type: 'limited-challenge-completions/set-success-predicate-completion';
    challengeId: string;
    success?: PredicateCompletion;
  }

  export const setSuccessPredicateCompletion = construct<SetSuccessPredicateCompletion>('limited-challenge-completions/set-success-predicate-completion');

  export interface SetFailurePredicateCompletion {
    type: 'limited-challenge-completions/set-failure-predicate-completion';
    challengeId: string;
    failure?: PredicateCompletion;
  }

  export const setFailurePredicateCompletion = construct<SetFailurePredicateCompletion>('limited-challenge-completions/set-failure-predicate-completion');

  export interface RemoveEventState {
    type: 'limited-challenge-completions/remove-event-state';
    challengeId: string;
    eventId: string;
  }

  export const removeEventState = construct<RemoveEventState>('limited-challenge-completions/remove-event-state');

  export interface SetEventState {
    type: 'limited-challenge-completions/set-event-state';
    challengeId: string;
    eventId: string;
    eventState: boolean;
  }

  export const setEventState = construct<SetEventState>('limited-challenge-completions/set-event-state');

  export interface SetEventStates {
    type: 'limited-challenge-completions/set-event-states';
    challengeId: string;
    eventStates: Dict<boolean>;
  }

  export const setEventStates = construct<SetEventStates>('limited-challenge-completions/set-event-states');

  export interface SetEventStatesAndPredicateCompletions {
    type: 'limited-challenge-completions/set-event-states-and-predicate-completions';
    challengeId: string;
    eventStates: Dict<boolean>;
    success?: PredicateCompletion;
    failure?: PredicateCompletion;
  }

  export const setEventStatesAndPredicateCompletions = construct<SetEventStatesAndPredicateCompletions>('limited-challenge-completions/set-event-states-and-predicate-completions');

  export interface SetSceneDiff {
    type: 'limited-challenge-completions/set-scene-diff';
    challengeId: string;
    sceneDiff: OuterObjectPatch<Scene>;
  }

  export const setSceneDiff = construct<SetSceneDiff>('limited-challenge-completions/set-scene-diff');

  export interface ResetLimitedChallengeCompletion {
    type: 'limited-challenge-completions/reset-challenge-completion';
    challengeId: string;
  }

  export const resetLimitedChallengeCompletion = construct<ResetLimitedChallengeCompletion>('limited-challenge-completions/reset-challenge-completion');

  export interface SetCode {
    type: 'limited-challenge-completions/set-code';
    challengeId: string;
    language: ProgrammingLanguage;
    code: string;
  }

  export const setCode = construct<SetCode>('limited-challenge-completions/set-code');

  export interface SetCurrentLanguage {
    type: 'limited-challenge-completions/set-current-language';
    challengeId: string;
    language: ProgrammingLanguage;
  }

  export const setCurrentLanguage = construct<SetCurrentLanguage>('limited-challenge-completions/set-current-language');

  export interface SetRobotLinkOrigins {
    type: 'limited-challenge-completions/set-robot-link-origins';
    challengeId: string;
    robotLinkOrigins: Dict<Dict<ReferenceFramewUnits>>;
  }

  export const setRobotLinkOrigins = construct<SetRobotLinkOrigins>('limited-challenge-completions/set-robot-link-origins');

  // New action for recording best completion time
  export interface RecordBestCompletion {
    type: 'limited-challenge-completions/record-best-completion';
    challengeId: string;
    runtimeMs: number;
  }

  export const recordBestCompletion = construct<RecordBestCompletion>('limited-challenge-completions/record-best-completion');
}

export type LimitedChallengeCompletionsAction = (
  LimitedChallengeCompletionsAction.LoadLimitedChallengeCompletion |
  LimitedChallengeCompletionsAction.CreateLimitedChallengeCompletion |
  LimitedChallengeCompletionsAction.SaveLimitedChallengeCompletion |
  LimitedChallengeCompletionsAction.RemoveLimitedChallengeCompletion |
  LimitedChallengeCompletionsAction.SetLimitedChallengeCompletionInternal |
  LimitedChallengeCompletionsAction.SetSuccessPredicateCompletion |
  LimitedChallengeCompletionsAction.SetFailurePredicateCompletion |
  LimitedChallengeCompletionsAction.RemoveEventState |
  LimitedChallengeCompletionsAction.SetEventState |
  LimitedChallengeCompletionsAction.SetEventStates |
  LimitedChallengeCompletionsAction.SetEventStatesAndPredicateCompletions |
  LimitedChallengeCompletionsAction.SetSceneDiff |
  LimitedChallengeCompletionsAction.ResetLimitedChallengeCompletion |
  LimitedChallengeCompletionsAction.SetCode |
  LimitedChallengeCompletionsAction.SetCurrentLanguage |
  LimitedChallengeCompletionsAction.SetRobotLinkOrigins |
  LimitedChallengeCompletionsAction.RecordBestCompletion
);

const DEFAULT_LIMITED_CHALLENGE_COMPLETIONS: LimitedChallengeCompletions = {
};

const create = async (challengeId: string, next: Async.Creating<LimitedChallengeCompletion>) => {
  try {
    await db.set(Selector.limitedChallengeCompletion(challengeId), next.value);
    store.dispatch(LimitedChallengeCompletionsAction.setLimitedChallengeCompletionInternal({
      challengeCompletion: Async.loaded({
        brief: LimitedChallengeCompletionBrief.fromCompletion(next.value),
        value: next.value
      }),
      challengeId,
    }));
  } catch (error) {
    store.dispatch(LimitedChallengeCompletionsAction.setLimitedChallengeCompletionInternal({
      challengeCompletion: Async.createFailed({
        value: next.value,
        error: errorToAsyncError(error),
      }),
      challengeId,
    }));
  }
};

const save = async (challengeId: string, current: Async.Saveable<LimitedChallengeCompletionBrief, LimitedChallengeCompletion>) => {
  try {
    await db.set(Selector.limitedChallengeCompletion(challengeId), current.value);

    const latest = Async.latestValue(store.getState().limitedChallengeCompletions[challengeId]);

    let next: AsyncLimitedChallengeCompletion;
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
    store.dispatch(LimitedChallengeCompletionsAction.setLimitedChallengeCompletionInternal({
      challengeCompletion: next,
      challengeId,
    }));
  } catch (error) {
    store.dispatch(LimitedChallengeCompletionsAction.setLimitedChallengeCompletionInternal({
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

const load = async (challengeId: string, current: AsyncLimitedChallengeCompletion | undefined) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<LimitedChallengeCompletion>(Selector.limitedChallengeCompletion(challengeId));
    store.dispatch(LimitedChallengeCompletionsAction.setLimitedChallengeCompletionInternal({
      challengeCompletion: Async.loaded({ brief, value }),
      challengeId,
    }));
  } catch (error) {
    // If not found (404), create a new completion with default values from the challenge
    if (DbError.is(error) && error.code === DbError.CODE_NOT_FOUND) {
      // Get the challenge to use its default code
      const challenge = Async.latestValue(store.getState().limitedChallenges[challengeId]);
      
      const newCompletion: LimitedChallengeCompletion = challenge
        ? {
          ...LimitedChallengeCompletion.EMPTY,
          code: challenge.code,
          currentLanguage: challenge.defaultLanguage,
        }
        : LimitedChallengeCompletion.EMPTY;
      
      // Create the completion (this will save it to the database)
      const creating = Async.creating({ value: newCompletion });
      void create(challengeId, creating);
      
      store.dispatch(LimitedChallengeCompletionsAction.setLimitedChallengeCompletionInternal({
        challengeCompletion: creating,
        challengeId,
      }));
      return;
    }

    // For other errors, set to loadFailed
    store.dispatch(LimitedChallengeCompletionsAction.setLimitedChallengeCompletionInternal({
      challengeCompletion: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      challengeId,
    }));
  }
};

const remove = async (challengeId: string, next: Async.Deleting<LimitedChallengeCompletionBrief, LimitedChallengeCompletion>) => {
  try {
    await db.delete(Selector.limitedChallengeCompletion(challengeId));
    store.dispatch(LimitedChallengeCompletionsAction.setLimitedChallengeCompletionInternal({ challengeId, challengeCompletion: undefined }));
  } catch (error) {
    store.dispatch(LimitedChallengeCompletionsAction.setLimitedChallengeCompletionInternal({
      challengeCompletion: Async.deleteFailed({ brief: next.brief, value: next.value, error: errorToAsyncError(error) }),
      challengeId,
    }));
  }
};

export const reduceLimitedChallengeCompletions = (state: LimitedChallengeCompletions = DEFAULT_LIMITED_CHALLENGE_COMPLETIONS, action: LimitedChallengeCompletionsAction): LimitedChallengeCompletions => {
  switch (action.type) {
    case 'limited-challenge-completions/load-challenge-completion': {
      void load(action.challengeId, state[action.challengeId]);
      return {
        ...state,
        [action.challengeId]: Async.loading({ brief: Async.brief(state[action.challengeId]) }),
      };
    }
    case 'limited-challenge-completions/create-challenge-completion': {
      const creating = Async.creating({ value: action.challengeCompletion });
      void create(action.challengeId, creating);
      return {
        ...state,
        [action.challengeId]: creating,
      };
    }
    case 'limited-challenge-completions/save-challenge-completion': {
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
    case 'limited-challenge-completions/remove-challenge-completion': {
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
    case 'limited-challenge-completions/set-challenge-completion-internal': return {
      ...state,
      [action.challengeId]: action.challengeCompletion,
    };
    case 'limited-challenge-completions/set-success-predicate-completion': return mutate(state, action.challengeId, completion => {
      completion.success = action.success;
    });
    case 'limited-challenge-completions/set-failure-predicate-completion': return mutate(state, action.challengeId, completion => {
      completion.failure = action.failure;
    });
    case 'limited-challenge-completions/remove-event-state': return mutate(state, action.challengeId, completion => {
      delete completion.eventStates[action.eventId];
    });
    case 'limited-challenge-completions/set-event-state': return mutate(state, action.challengeId, completion => {
      completion.eventStates[action.eventId] = action.eventState;
    });
    case 'limited-challenge-completions/set-event-states': return mutate(state, action.challengeId, completion => {
      completion.eventStates = action.eventStates;
    });
    case 'limited-challenge-completions/set-event-states-and-predicate-completions': return mutate(state, action.challengeId, completion => {
      completion.eventStates = action.eventStates;
      completion.success = action.success;
      completion.failure = action.failure;
    });
    case 'limited-challenge-completions/set-scene-diff': return mutate(state, action.challengeId, completion => {
      completion.serializedSceneDiff = JSON.stringify(action.sceneDiff);
    });
    case 'limited-challenge-completions/reset-challenge-completion': return mutate(state, action.challengeId, completion => {
      completion.eventStates = {};
      completion.success = undefined;
      completion.failure = undefined;
      completion.serializedSceneDiff = JSON.stringify({ t: "o" });
    });
    case 'limited-challenge-completions/set-code': return mutate(state, action.challengeId, completion => {
      completion.code[action.language] = action.code;
    });
    case 'limited-challenge-completions/set-current-language': return mutate(state, action.challengeId, completion => {
      completion.currentLanguage = action.language;
    });
    case 'limited-challenge-completions/set-robot-link-origins': return mutate(state, action.challengeId, completion => {
      completion.robotLinkOrigins = action.robotLinkOrigins;
    });
    case 'limited-challenge-completions/record-best-completion': return mutate(state, action.challengeId, completion => {
      // Only update if this is a better time (or first completion)
      if (completion.bestRuntimeMs === undefined || action.runtimeMs < completion.bestRuntimeMs) {
        completion.bestRuntimeMs = action.runtimeMs;
        completion.bestCompletionTime = new Date().toISOString();
      }
    });
    default: return state;
  }
};
