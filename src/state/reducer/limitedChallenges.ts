import store from '..';
import { LimitedChallenges } from '../State';
import LimitedChallenge, { AsyncLimitedChallenge, LimitedChallengeBrief } from '../State/LimitedChallenge';
import Event from '../State/Challenge/Event';
import Predicate from '../State/Challenge/Predicate';
import Async from '../State/Async';

import { errorToAsyncError, mutate } from './util';
import construct from '../../util/redux/construct';
import LocalizedString from '../../util/LocalizedString';

import db from '../../db';
import Selector from '../../db/Selector';

import { DEFAULT_LIMITED_CHALLENGES } from '../../simulator/definitions/limitedChallenges';

export namespace LimitedChallengesAction {
  export interface LoadLimitedChallenge {
    type: 'limited-challenges/load-challenge';
    challengeId: string;
  }

  export const loadLimitedChallenge = construct<LoadLimitedChallenge>('limited-challenges/load-challenge');

  export interface CreateLimitedChallenge {
    type: 'limited-challenges/create-challenge';
    challengeId: string;
    challenge: LimitedChallenge;
  }

  export const createLimitedChallenge = construct<CreateLimitedChallenge>('limited-challenges/create-challenge');

  export interface SaveLimitedChallenge {
    type: 'limited-challenges/save-challenge';
    challengeId: string;
  }

  export const saveLimitedChallenge = construct<SaveLimitedChallenge>('limited-challenges/save-challenge');

  export interface RemoveLimitedChallenge {
    type: 'limited-challenges/remove-challenge';
    challengeId: string;
  }

  export const removeLimitedChallenge = construct<RemoveLimitedChallenge>('limited-challenges/remove-challenge');

  export interface SetLimitedChallengeInternal {
    type: 'limited-challenges/set-challenge-internal';
    challengeId: string;
    challenge: AsyncLimitedChallenge;
  }

  export const setLimitedChallengeInternal = construct<SetLimitedChallengeInternal>('limited-challenges/set-challenge-internal');

  export interface SetSuccessPredicate {
    type: 'limited-challenges/set-success-predicate';
    challengeId: string;
    success?: Predicate;
  }

  export const setSuccessPredicate = construct<SetSuccessPredicate>('limited-challenges/set-success-predicate');

  export interface SetFailurePredicate {
    type: 'limited-challenges/set-failure-predicate';
    challengeId: string;
    failure?: Predicate;
  }

  export const setFailurePredicate = construct<SetFailurePredicate>('limited-challenges/set-failure-predicate');

  export interface RemoveEvent {
    type: 'limited-challenges/remove-event';
    challengeId: string;
    eventId: string;
  }

  export const removeEvent = construct<RemoveEvent>('limited-challenges/remove-event');

  export interface SetEvent {
    type: 'limited-challenges/set-event';
    challengeId: string;
    eventId: string;
    event: Event;
  }

  export const setEvent = construct<SetEvent>('limited-challenges/set-event');

  export interface SetName {
    type: 'limited-challenges/set-name';
    challengeId: string;
    name: LocalizedString;
  }

  export const setName = construct<SetName>('limited-challenges/set-name');

  export interface SetDescription {
    type: 'limited-challenges/set-description';
    challengeId: string;
    description: LocalizedString;
  }

  export const setDescription = construct<SetDescription>('limited-challenges/set-description');
}

export type LimitedChallengesAction = (
  LimitedChallengesAction.LoadLimitedChallenge |
  LimitedChallengesAction.CreateLimitedChallenge |
  LimitedChallengesAction.SaveLimitedChallenge |
  LimitedChallengesAction.RemoveLimitedChallenge |
  LimitedChallengesAction.SetLimitedChallengeInternal |
  LimitedChallengesAction.SetSuccessPredicate |
  LimitedChallengesAction.SetFailurePredicate |
  LimitedChallengesAction.RemoveEvent |
  LimitedChallengesAction.SetEvent |
  LimitedChallengesAction.SetName |
  LimitedChallengesAction.SetDescription
);


const create = async (challengeId: string, next: Async.Creating<LimitedChallenge>) => {
  try {
    await db.set(Selector.limitedChallenge(challengeId), next.value);
    store.dispatch(LimitedChallengesAction.setLimitedChallengeInternal({
      challenge: Async.loaded({
        brief: LimitedChallengeBrief.fromChallenge(next.value),
        value: next.value
      }),
      challengeId,
    }));
  } catch (error) {
    store.dispatch(LimitedChallengesAction.setLimitedChallengeInternal({
      challenge: Async.createFailed({
        value: next.value,
        error: errorToAsyncError(error),
      }),
      challengeId,
    }));
  }
};

const save = async (challengeId: string, current: Async.Saveable<LimitedChallengeBrief, LimitedChallenge>) => {
  try {
    await db.set(Selector.limitedChallenge(challengeId), current.value);
    store.dispatch(LimitedChallengesAction.setLimitedChallengeInternal({
      challenge: Async.loaded({
        brief: current.brief,
        value: current.value
      }),
      challengeId,
    }));
  } catch (error) {
    store.dispatch(LimitedChallengesAction.setLimitedChallengeInternal({
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

const load = async (challengeId: string, current: AsyncLimitedChallenge | undefined) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<LimitedChallenge>(Selector.limitedChallenge(challengeId));
    store.dispatch(LimitedChallengesAction.setLimitedChallengeInternal({
      challenge: Async.loaded({ brief, value }),
      challengeId,
    }));
  } catch (error) {
    store.dispatch(LimitedChallengesAction.setLimitedChallengeInternal({
      challenge: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      challengeId,
    }));
  }
};

const remove = async (challengeId: string, next: Async.Deleting<LimitedChallengeBrief, LimitedChallenge>) => {
  try {
    await db.delete(Selector.limitedChallenge(challengeId));
    store.dispatch(LimitedChallengesAction.setLimitedChallengeInternal({ challengeId, challenge: undefined }));
  } catch (error) {
    store.dispatch(LimitedChallengesAction.setLimitedChallengeInternal({
      challenge: Async.deleteFailed({ brief: next.brief, value: next.value, error: errorToAsyncError(error) }),
      challengeId,
    }));
  }
};

export const reduceLimitedChallenges = (state: LimitedChallenges = DEFAULT_LIMITED_CHALLENGES, action: LimitedChallengesAction): LimitedChallenges => {
  switch (action.type) {
    case 'limited-challenges/load-challenge': {
      void load(action.challengeId, state[action.challengeId]);
      return {
        ...state,
        [action.challengeId]: Async.loading({ brief: Async.brief(state[action.challengeId]) }),
      };
    }
    case 'limited-challenges/create-challenge': {
      const creating = Async.creating({ value: action.challenge });
      void create(action.challengeId, creating);
      return {
        ...state,
        [action.challengeId]: creating,
      };
    }
    case 'limited-challenges/save-challenge': {
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
    case 'limited-challenges/remove-challenge': {
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
    case 'limited-challenges/set-challenge-internal': return {
      ...state,
      [action.challengeId]: action.challenge,
    };
    case 'limited-challenges/set-success-predicate': return mutate(state, action.challengeId, challenge => {
      challenge.success = action.success;
    });
    case 'limited-challenges/set-failure-predicate': return mutate(state, action.challengeId, challenge => {
      challenge.failure = action.failure;
    });
    case 'limited-challenges/remove-event': return mutate(state, action.challengeId, challenge => {
      delete challenge.events[action.eventId];
    });
    case 'limited-challenges/set-event': return mutate(state, action.challengeId, challenge => {
      challenge.events[action.eventId] = action.event;
    });
    case 'limited-challenges/set-name': return mutate(state, action.challengeId, challenge => {
      challenge.name = action.name;
    });
    case 'limited-challenges/set-description': return mutate(state, action.challengeId, challenge => {
      challenge.description = action.description;
    });
    default: return state;
  }
};
