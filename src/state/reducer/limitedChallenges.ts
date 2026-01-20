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
import Author from '../../db/Author';
import ProgrammingLanguage from '../../programming/compiler/ProgrammingLanguage';
import Expr from '../State/Challenge/Expr';
import tr from '@i18n';

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

// Sample limited challenge based on jbc2 (Ring Around the Can)
const sampleLimitedChallenge: LimitedChallenge = {
  name: tr("Speed Run: Ring Around the Can"),
  description: tr("Complete the Ring Around the Can challenge as fast as possible! Limited time event."),
  author: {
    type: Author.Type.Organization,
    id: "kipr",
  },
  code: {
    'c': ProgrammingLanguage.DEFAULT_CODE.c,
    'cpp': ProgrammingLanguage.DEFAULT_CODE.cpp,
    'python': ProgrammingLanguage.DEFAULT_CODE.python,
  },
  defaultLanguage: "c",
  events: {
    notInStartBox: {
      name: tr("Robot not in Start Box"),
      description: tr("Robot not in start box"),
    },
    can6Intersects: {
      name: tr("Can 6 Intersects"),
      description: tr("Can 6 intersects circle 6"),
    },
    can6Upright: {
      name: tr("Can 6 Upright"),
      description: tr("Can 6 upright on circle 6"),
    },
    returnStartBox: {
      name: tr("Robot Reentered Start"),
      description: tr("Robot reentered starting box"),
    },
    rightSide: {
      name: tr("Robot Passed Right Side"),
      description: tr("Robot passed right side of can 6"),
    },
    topSide: {
      name: tr("Robot Passed Top Side"),
      description: tr("Robot passed top side of can 6"),
    },
    leftSide: {
      name: tr("Robot Passed Left Side"),
      description: tr("Robot passed left side of can 6"),
    },
  },
  success: {
    exprs: {
      notInStartBox: {
        type: Expr.Type.Event,
        eventId: "notInStartBox",
      },
      inStartBox: {
        type: Expr.Type.Not,
        argId: "notInStartBox",
      },
      inStartBoxOnce: {
        type: Expr.Type.Once,
        argId: "inStartBox",
      },
      rightSide: {
        type: Expr.Type.Event,
        eventId: "rightSide",
      },
      rightSideOnce: {
        type: Expr.Type.Once,
        argId: "rightSide",
      },
      topSide: {
        type: Expr.Type.Event,
        eventId: "topSide",
      },
      topSideOnce: {
        type: Expr.Type.Once,
        argId: "topSide",
      },
      leftSide: {
        type: Expr.Type.Event,
        eventId: "leftSide",
      },
      leftSideOnce: {
        type: Expr.Type.Once,
        argId: "leftSide",
      },
      returnStartBox: {
        type: Expr.Type.Event,
        eventId: "returnStartBox",
      },
      completion: {
        type: Expr.Type.And,
        argIds: [
          "inStartBoxOnce",
          "returnStartBox",
          "rightSideOnce",
          "topSideOnce",
          "leftSideOnce"
        ],
      },
    },
    rootId: "completion",
  },
  failure: {
    exprs: {
      can6Intersects: {
        type: Expr.Type.Event,
        eventId: 'can6Intersects',
      },
      can6NotIntersects: {
        type: Expr.Type.Not,
        argId: 'can6Intersects',
      },
      can6Upright: {
        type: Expr.Type.Event,
        eventId: 'can6Upright',
      },
      can6NotUpright: {
        type: Expr.Type.Not,
        argId: 'can6Upright',
      },
      failure: {
        type: Expr.Type.Or,
        argIds: ['can6NotIntersects', 'can6NotUpright'],
      },
    },
    rootId: 'failure',
  },
  successGoals: [
    {
      exprId: 'inStartBoxOnce',
      name: tr('Start in the Start Box'),
    },
    {
      exprId: 'rightSideOnce',
      name: tr('Pass the right side of can 6'),
    },
    {
      exprId: 'topSideOnce',
      name: tr('Pass the top side of can 6'),
    },
    {
      exprId: 'leftSideOnce',
      name: tr('Pass the left side of can 6'),
    },
    {
      exprId: 'returnStartBox',
      name: tr('Return to the Start Box'),
    },
  ],
  failureGoals: [
    {
      exprId: 'can6NotIntersects',
      name: tr('Can 6 not in circle 6'),
    },
    {
      exprId: 'can6NotUpright',
      name: tr('Can 6 not upright'),
    },
  ],
  sceneId: "jbc2",
  // Time window: Open from Feb 1, 2026 to Feb 7, 2026
  openDate: '2026-01-19T00:00:00Z',
  closeDate: '2026-01-26T23:59:59Z',
};

const DEFAULT_LIMITED_CHALLENGES: LimitedChallenges = {
  'limited-speed-run-1': Async.loaded({
    value: sampleLimitedChallenge,
    brief: LimitedChallengeBrief.fromChallenge(sampleLimitedChallenge),
  }),
};

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
