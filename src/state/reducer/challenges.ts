import Challenge, { AsyncChallenge, ChallengeBrief } from "../State/Challenge";
import { Challenges } from "../State";
import Async from "../State/Async";
import construct from '../../util/construct';
import { Vector3 as RawVector3 } from '../../math';
import { ReferenceFrame, Rotation, Vector3 } from '../../unit-math';
import db from '../../db';
import { SCENE_COLLECTION } from '../../db/constants';
import store from '..';
import DbError from '../../db/Error';
import Selector from '../../db/Selector';
import Dict from '../../Dict';
import LocalizedString from '../../util/LocalizedString';
import { Angle } from '../../util';
import produce, { original } from 'immer';
import Event from '../State/Challenge/Event';
import Expr from '../State/Challenge/Expr';
import test from '../../challenges/test';
import { errorToAsyncError } from './util';

export namespace ChallengesAction {
  export interface RemoveChallenge {
    type: 'challenges/remove-challenge';
    challengeId: string;
  }

  export const removeChallenge = construct<RemoveChallenge>('challenges/remove-challenge');

  export interface SetChallenge {
    type: 'challenges/set-challenge';
    challengeId: string;
    challenge: Challenge;
  }

  export const setChallenge = construct<SetChallenge>('challenges/set-challenge');

  export interface SetChallengePartial {
    type: 'challenges/set-challenge-partial';
    challengeId: string;
    partialChallenge: Partial<Challenge>;
  }

  export const setChallengePartial = construct<SetChallengePartial>('challenges/set-challenge-partial');

  export interface SetChallengeInternal {
    type: 'challenges/set-challenge-internal';
    challengeId: string;
    challenge: AsyncChallenge;
  }

  export const setChallengeInternal = construct<SetChallengeInternal>('challenges/set-challenge-internal');

  export interface SetChallengesInternal {
    type: 'challenges/set-challenges-internal';
    challenges: {
      [challengeId: string]: AsyncChallenge;
    };
  }

  export const setChallengesInternal = construct<SetChallengesInternal>('challenges/set-challenges-internal');

  export interface SetChallengeBatch {
    type: 'challenges/set-challenge-batch';
    challengeIds: {
      id: string;
      challenge: Challenge;
    }[];
  }

  export const setChallengeBatch = construct<SetChallengeBatch>('challenges/set-challenge-batch');

  export interface LoadChallenge {
    type: 'challenges/load-challenge';
    challengeId: string;
  }

  export const loadChallenge = construct<LoadChallenge>('challenges/load-challenge');

  export interface CreateChallenge {
    type: 'challenges/create-challenge';
    challengeId: string;
    challenge: Challenge;
  }

  export const createChallenge = construct<CreateChallenge>('challenges/create-challenge');

  export interface SaveChallenge {
    type: 'challenges/save-challenge';
    challengeId: string;
  }

  export const saveChallenge = construct<SaveChallenge>('challenges/save-challenge');

  export interface ListUserChallenges {
    type: 'challenges/list-user-challenges';
  }

  export const LIST_USER_SCENES: ListUserChallenges = { type: 'challenges/list-user-challenges' };

  export interface ResetChallenge {
    type: 'challenges/reset-challenge';
    challengeId: string;
  }

  export const resetChallenge = construct<ResetChallenge>('challenges/reset-challenge');

  export interface SoftResetChallenge {
    type: 'challenges/soft-reset-challenge';
    challengeId: string;
  }

  export const softResetChallenge = construct<SoftResetChallenge>('challenges/soft-reset-challenge');

  export interface RemoveEvent {
    type: 'challenges/remove-event';
    challengeId: string;
    eventId: string;
  }

  export const removeEvent = construct<RemoveEvent>('challenges/remove-event');

  export interface SetEvent {
    type: 'challenges/set-event';
    challengeId: string;
    eventId: string;
    event: Event;
  }


  export const setEvent = construct<SetEvent>('challenges/set-event');

  export interface SetEventBatch {
    type: 'challenges/set-event-batch';
    challengeId: string;
    eventIds: {
      id: string;
      event: Event;
    }[];
  }

  export const setEventBatch = construct<SetEventBatch>('challenges/set-event-batch');

  export interface SetScene {
    type: 'challenges/set-scene';
    challengeId: string;
    sceneId: string;
  }

  export const setScene = construct<SetScene>('challenges/set-scene');

  export interface SetSuccessPredicate {
    type: 'challenges/set-success-predicate';
    challengeId: string;
    successPredicate?: Expr;
  }

  export const setSuccessPredicate = construct<SetSuccessPredicate>('challenges/set-success-predicate');

  export interface SetFailurePredicate {
    type: 'challenges/set-failure-predicate';
    challengeId: string;
    failurePredicate?: Expr;
  }

  export const setFailurePredicate = construct<SetFailurePredicate>('challenges/set-failure-predicate');

  export interface UnfailChallenge {
    type: 'challenges/unfail-challenge';
    challengeId: string;
  }

  export const unfailChallenge = construct<UnfailChallenge>('challenges/unfail-challenge');
}

export type ChallengesAction = (
  ChallengesAction.RemoveChallenge |
  ChallengesAction.SetChallenge |
  ChallengesAction.SetChallengePartial |
  ChallengesAction.SetChallengeInternal |
  ChallengesAction.SetChallengesInternal |
  ChallengesAction.SetChallengeBatch |
  ChallengesAction.LoadChallenge |
  ChallengesAction.ResetChallenge |
  ChallengesAction.SoftResetChallenge |
  ChallengesAction.RemoveEvent |
  ChallengesAction.SetEvent |
  ChallengesAction.SetEventBatch |
  ChallengesAction.SetScene |
  ChallengesAction.SetSuccessPredicate |
  ChallengesAction.SetFailurePredicate |
  ChallengesAction.CreateChallenge |
  ChallengesAction.SaveChallenge |
  ChallengesAction.ListUserChallenges |
  ChallengesAction.UnfailChallenge
);

const DEFAULT_CHALLENGES: Challenges = {
  test: Async.loaded({ value: test }),
};

const create = async (challengeId: string, next: Async.Creating<Challenge>) => {
  try {
    await db.set(Selector.challenge(challengeId), next.value);
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.loaded({
        brief: ChallengeBrief .fromChallenge(next.value),
        value: next.value
      }),
      challengeId,
    }));
  } catch (error) {
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.createFailed({
        value: next.value,
        error: errorToAsyncError(error),
      }),
      challengeId,
    }));
  }
};

const save = async (challengeId: string, current: Async.Saveable<ChallengeBrief, Challenge>) => {
  try {
    await db.set(Selector.challenge(challengeId), current.value);
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.loaded({
        brief: current.brief,
        value: current.value
      }),
      challengeId,
    }));
  } catch (error) {
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.saveFailed({
        brief: current.brief,
        original: current.original,
        value: current.value,
        error: errorToAsyncError(error),
      }),
      challengeId,
    }));
  }
};

const load = async (challengeId: string, current: AsyncChallenge | undefined) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<Challenge>(Selector.challenge(challengeId));
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.loaded({ brief, value }),
      challengeId,
    }));
  } catch (error) {
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      challengeId,
    }));
  }
};

const remove = async (challengeId: string, next: Async.Deleting<ChallengeBrief, Challenge>) => {
  try {
    await db.delete(Selector.challenge(challengeId));
    store.dispatch(ChallengesAction.setChallengeInternal({ challengeId, challenge: undefined }));
  } catch (error) {
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.deleteFailed({ brief: next.brief, value: next.value, error: errorToAsyncError(error) }),
      challengeId,
    }));
  }
};

export const listUserChallenges = async () => {
  const challenges = await db.list<Challenge>(SCENE_COLLECTION);
  store.dispatch(ChallengesAction.setChallengesInternal({
    challenges: Dict.map(challenges, challenge => Async.loaded({
      brief: ChallengeBrief.fromChallenge(challenge),
      value: challenge
    }))
  }));
};

export const reduceChallenges = (state: Challenges = DEFAULT_CHALLENGES, action: ChallengesAction): Challenges => {
  switch (action.type) {
    case 'challenges/remove-challenge': {
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
    case 'challenges/set-challenge': {
      const current = state[action.challengeId];

      if (!current) return state;

      if (current.type === Async.Type.Loaded) {
        return {
          ...state,
          [action.challengeId]: Async.saveable({
            brief: current.brief,
            original: current.value,
            value: action.challenge,
          })
        };
      }

      if (current.type === Async.Type.Saveable) {
        return {
          ...state,
          [action.challengeId]: Async.saveable({
            brief: current.brief,
            original: current.original,
            value: action.challenge,
          })
        };
      }
      
      return state;
    }
    case 'challenges/set-challenge-partial': {
      const current = state[action.challengeId];

      if (!current) return state;

      if (current.type === Async.Type.Loaded) {
        return {
          ...state,
          [action.challengeId]: Async.saveable({
            brief: current.brief,
            original: current.value,
            value: {
              ...current.value,
              ...action.partialChallenge,
            },
          })
        };
      }

      if (current.type === Async.Type.Saveable) {
        return {
          ...state,
          [action.challengeId]: Async.saveable({
            brief: current.brief,
            original: current.original,
            value: {
              ...current.value,
              ...action.partialChallenge,
            },
          })
        };
      }

      return state;
    }
    case 'challenges/set-challenge-internal': return {
      ...state,
      [action.challengeId]: action.challenge,
    };
    case 'challenges/set-challenges-internal': {
      const nextState = { ...state };
      for (const challengeId in action.challenges) {
        nextState[challengeId] = action.challenges[challengeId];
      }
      return nextState;
    }
    case 'challenges/set-challenge-batch': {
      const nextState: Challenges = { ...state };

      for (const { id, challenge } of action.challengeIds) {
        nextState.challenges[id] = Async.loaded({ value: challenge });
      }

      return nextState;
    }
    case 'challenges/load-challenge': {
      void load(action.challengeId, state[action.challengeId]);
      return {
        ...state,
        [action.challengeId]: Async.loading({ brief: Async.brief(state[action.challengeId]) }),
      };
    }
    case 'challenges/create-challenge': {
      const creating = Async.creating({ value: action.challenge });
      void create(action.challengeId, creating);
      return {
        ...state,
        [action.challengeId]: creating,
      };
    }
    case 'challenges/save-challenge': {
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
    case 'challenges/reset-challenge': return {
      ...state,
      [action.challengeId]: Async.reset(state[action.challengeId]),
    };
    case 'challenges/remove-event': return {
      ...state,
      [action.challengeId]: Async.mutate(state[action.challengeId], challenge => {
        delete challenge.events[action.eventId];
      }),
    };
    case 'challenges/set-event': return {
      ...state,
      [action.challengeId]: Async.mutate(state[action.challengeId], challenge => {
        challenge.events[action.eventId] = action.event;
      }),
    };
    case 'challenges/set-event-batch': return {
      ...state,
      [action.challengeId]: Async.mutate(state[action.challengeId], challenge => {
        for (const { id, event } of action.eventIds) challenge.events[id] = event;
      }),
    };
    case 'challenges/set-scene': return {
      ...state,
      [action.challengeId]: Async.mutate(state[action.challengeId], challenge => {
        challenge.sceneId = action.sceneId;
      }),
    };
    case 'challenges/set-success-predicate': return {
      ...state,
      [action.challengeId]: Async.mutate(state[action.challengeId], challenge => {
        challenge.successPredicate = action.successPredicate;
      }),
    };
    case 'challenges/set-failure-predicate': return {
      ...state,
      [action.challengeId]: Async.mutate(state[action.challengeId], challenge => {
        challenge.failurePredicate = action.failurePredicate;
      }),
    };
    case 'challenges/list-user-challenges': {
      void listUserChallenges();
      return state;
    }
    case 'challenges/unfail-challenge': return {
      ...state,
      [action.challengeId]: Async.unfail(state[action.challengeId]),
    };
    default: return state;
  }
};