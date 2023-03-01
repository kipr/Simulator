import Async from "../State/Async";
import { Challenges } from '../State';
import Challenge, { AsyncChallenge, ChallengeBrief } from '../State/Challenge';
import construct from '../../util/construct';
import Predicate from '../State/Challenge/Predicate';
import Event from '../State/Challenge/Event';
import LocalizedString from '../../util/LocalizedString';
import Selector from '../../db/Selector';
import db from '../../db';
import store from '..';
import { errorToAsyncError, mutate } from './util';
import test from '../../challenges/test';
import jbc6c from "../../challenges/jbc6c";


export namespace ChallengesAction {
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

  export interface RemoveChallenge {
    type: 'challenges/remove-challenge';
    challengeId: string;
  }

  export const removeChallenge = construct<RemoveChallenge>('challenges/remove-challenge');

  export interface SetChallengeInternal {
    type: 'challenges/set-challenge-internal';
    challengeId: string;
    challenge: AsyncChallenge;
  }

  export const setChallengeInternal = construct<SetChallengeInternal>('challenges/set-challenge-internal');

  export interface SetSuccessPredicate {
    type: 'challenges/set-success-predicate';
    challengeId: string;
    success?: Predicate;
  }

  export const setSuccessPredicate = construct<SetSuccessPredicate>('challenges/set-success-predicate');

  export interface SetFailurePredicate {
    type: 'challenges/set-failure-predicate';
    challengeId: string;
    failure?: Predicate;
  }

  export const setFailurePredicate = construct<SetFailurePredicate>('challenges/set-failure-predicate');

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

  export interface SetName {
    type: 'challenges/set-name';
    challengeId: string;
    name: LocalizedString;
  }

  export const setName = construct<SetName>('challenges/set-name');

  export interface SetDescription {
    type: 'challenges/set-description';
    challengeId: string;
    description: LocalizedString;
  }

  export const setDescription = construct<SetDescription>('challenges/set-description');
}

export type ChallengesAction = (
  ChallengesAction.LoadChallenge |
  ChallengesAction.CreateChallenge |
  ChallengesAction.SaveChallenge |
  ChallengesAction.RemoveChallenge |
  ChallengesAction.SetChallengeInternal |
  ChallengesAction.SetSuccessPredicate |
  ChallengesAction.SetFailurePredicate |
  ChallengesAction.RemoveEvent |
  ChallengesAction.SetEvent |
  ChallengesAction.SetName |
  ChallengesAction.SetDescription
);

const DEFAULT_CHALLENGES: Challenges = {
  'test': Async.loaded({
    value: test,
    brief: ChallengeBrief.fromChallenge(test),
  }),
  'jbc6c': Async.loaded({
    value: jbc6c,
    brief: ChallengeBrief.fromChallenge(jbc6c),
  }),
};

const create = async (challengeId: string, next: Async.Creating<Challenge>) => {
  try {
    await db.set(Selector.challenge(challengeId), next.value);
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.loaded({
        brief: ChallengeBrief.fromChallenge(next.value),
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

export const reduceChallenges = (state: Challenges = DEFAULT_CHALLENGES, action: ChallengesAction): Challenges => {
  switch (action.type) {
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
    case 'challenges/set-challenge-internal': return {
      ...state,
      [action.challengeId]: action.challenge,
    };
    case 'challenges/set-success-predicate': return mutate(state, action.challengeId, challenge => {
      challenge.success = action.success;
    });
    case 'challenges/set-failure-predicate': return mutate(state, action.challengeId, challenge => {
      challenge.failure = action.failure;
    });
    case 'challenges/remove-event': return mutate(state, action.challengeId, challenge => {
      delete challenge.events[action.eventId];
    });
    case 'challenges/set-event': return mutate(state, action.challengeId, challenge => {
      challenge.events[action.eventId] = action.event;
    });
    case 'challenges/set-name': return mutate(state, action.challengeId, challenge => {
      challenge.name = action.name;
    });
    case 'challenges/set-description': return mutate(state, action.challengeId, challenge => {
      challenge.description = action.description;
    });
    default: return state;
  }
};