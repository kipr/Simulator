import store from '..';
import { Challenges } from '../State';
import Challenge, { AsyncChallenge, ChallengeBrief } from '../State/Challenge';
import Event from '../State/Challenge/Event';
import Predicate from '../State/Challenge/Predicate';
import Async from "../State/Async";

import { errorToAsyncError, mutate } from './util';
import construct from '../../util/redux/construct';
import LocalizedString from '../../util/LocalizedString';

import db from '../../db';
import Selector from '../../db/Selector';

import jbc1 from "../../simulator/definitions/challenges/jbc1";
import jbc2 from "../../simulator/definitions/challenges/jbc2";
import jbc2b from "../../simulator/definitions/challenges/jbc2b";
import jbc2c from "../../simulator/definitions/challenges/jbc2c";
import jbc2d from "../../simulator/definitions/challenges/jbc2d";
import jbc3 from "../../simulator/definitions/challenges/jbc3";
import jbc4 from "../../simulator/definitions/challenges/jbc4";
import jbc4b from "../../simulator/definitions/challenges/jbc4b";
import jbc5 from "../../simulator/definitions/challenges/jbc5";
import jbc6 from "../../simulator/definitions/challenges/jbc6";
import jbc6c from "../../simulator/definitions/challenges/jbc6c";
import jbc7 from "../../simulator/definitions/challenges/jbc7";
import jbc7b from "../../simulator/definitions/challenges/jbc7b";
import jbc8 from "../../simulator/definitions/challenges/jbc8";
import jbc8b from "../../simulator/definitions/challenges/jbc8b";
import jbc10 from "../../simulator/definitions/challenges/jbc10";
import jbc10b from "../../simulator/definitions/challenges/jbc10b";
import jbc12 from "../../simulator/definitions/challenges/jbc12";
import jbc13 from "../../simulator/definitions/challenges/jbc13";
import jbc15b from "../../simulator/definitions/challenges/jbc15b";
import jbc17 from "../../simulator/definitions/challenges/jbc17";
import jbc17b from "../../simulator/definitions/challenges/jbc17b";
import jbc19 from "../../simulator/definitions/challenges/jbc19";
import jbc20 from "../../simulator/definitions/challenges/jbc20";
import jbc21 from "../../simulator/definitions/challenges/jbc21";
import jbc22 from "../../simulator/definitions/challenges/jbc22";
import test from '../../simulator/definitions/challenges/test';

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
  'jbc1': Async.loaded({
    value: jbc1,
    brief: ChallengeBrief.fromChallenge(jbc1),
  }),
  'jbc2': Async.loaded({
    value: jbc2,
    brief: ChallengeBrief.fromChallenge(jbc2),
  }),
  'jbc2b': Async.loaded({
    value: jbc2b,
    brief: ChallengeBrief.fromChallenge(jbc2b),
  }),
  'jbc2c': Async.loaded({
    value: jbc2c,
    brief: ChallengeBrief.fromChallenge(jbc2c),
  }),
  'jbc2d': Async.loaded({
    value: jbc2d,
    brief: ChallengeBrief.fromChallenge(jbc2d),
  }),
  'jbc3': Async.loaded({
    value: jbc3,
    brief: ChallengeBrief.fromChallenge(jbc3),
  }),
  'jbc5': Async.loaded({
    value: jbc5,
    brief: ChallengeBrief.fromChallenge(jbc5),
  }),
  'jbc4': Async.loaded({
    value: jbc4,
    brief: ChallengeBrief.fromChallenge(jbc4),
  }),
  'jbc4b': Async.loaded({
    value: jbc4b,
    brief: ChallengeBrief.fromChallenge(jbc4b),
  }),
  'jbc6': Async.loaded({
    value: jbc6,
    brief: ChallengeBrief.fromChallenge(jbc6),
  }),
  'jbc7': Async.loaded({
    value: jbc7,
    brief: ChallengeBrief.fromChallenge(jbc7),
  }),
  'jbc7b': Async.loaded({
    value: jbc7b,
    brief: ChallengeBrief.fromChallenge(jbc7b),
  }),
  'jbc8': Async.loaded({
    value: jbc8,
    brief: ChallengeBrief.fromChallenge(jbc8),
  }),
  'jbc8b': Async.loaded({
    value: jbc8b,
    brief: ChallengeBrief.fromChallenge(jbc8b),
  }),
  'jbc10': Async.loaded({
    value: jbc10,
    brief: ChallengeBrief.fromChallenge(jbc10),
  }),
  'jbc10b': Async.loaded({
    value: jbc10b,
    brief: ChallengeBrief.fromChallenge(jbc10b),
  }),
  'jbc12': Async.loaded({
    value: jbc12,
    brief: ChallengeBrief.fromChallenge(jbc12),
  }),
  'jbc13': Async.loaded({
    value: jbc13,
    brief: ChallengeBrief.fromChallenge(jbc13),
  }),
  'jbc15b': Async.loaded({
    value: jbc15b,
    brief: ChallengeBrief.fromChallenge(jbc15b),
  }),
  'jbc17': Async.loaded({
    value: jbc17,
    brief: ChallengeBrief.fromChallenge(jbc17),
  }),
  'jbc17b': Async.loaded({
    value: jbc17b,
    brief: ChallengeBrief.fromChallenge(jbc17b),
  }),
  'jbc19': Async.loaded({
    value: jbc19,
    brief: ChallengeBrief.fromChallenge(jbc19),
  }),
  'jbc20': Async.loaded({
    value: jbc20,
    brief: ChallengeBrief.fromChallenge(jbc20),
  }),
  'jbc21': Async.loaded({
    value: jbc21,
    brief: ChallengeBrief.fromChallenge(jbc21),
  }),
  'jbc22': Async.loaded({
    value: jbc22,
    brief: ChallengeBrief.fromChallenge(jbc22),
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