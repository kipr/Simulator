import store from '..';
import { Challenges } from '../State';
import Dict from '../../util/objectOps/Dict';
import Challenge, { AsyncChallenge, ChallengeBrief, Goal } from '../State/Challenge';
import Event from '../State/Challenge/Event';
import Predicate from '../State/Challenge/Predicate';
import Async from '../State/Async';

import { deferAfterReducer, errorToAsyncError, mutate } from './util';
import construct from '../../util/redux/construct';
import LocalizedString from '../../util/LocalizedString';

import db from '../../db';
import Selector from '../../db/Selector';
import { CHALLENGE_COLLECTION, SCENE_COLLECTION } from '../../db/constants';
import { isCustomChallengeId } from '../../util/customChallengeFactory';
import {
  challengeFromScene,
  sceneWithCustomChallenge,
} from '../../util/customChallengeStorage';
import {
  isClassroomSharedReadOnlyScene,
  sharedCustomChallengeForStudent,
  sharedCustomChallengeSceneForStudent,
} from '../../util/customChallengeClassroomShare';
import Scene, { SceneBrief } from '../State/Scene';
import { auth } from '../../firebase/firebase';
import { ScenesAction } from './scenes';

import jbc0 from '../../simulator/definitions/challenges/jbc0-Drive-Straight';
import jbc1 from '../../simulator/definitions/challenges/jbc1-Tag-Youre-It';
import jbc2 from '../../simulator/definitions/challenges/jbc2-Ring-Around-the-Can';
// import jbc2b from '../../simulator/definitions/challenges/archived/jbc2b-Ring-Around-the-Cans-Sr';
// import jbc2c from '../../simulator/definitions/challenges/archived/jbc2c-Back-It-Up';
// import jbc2d from '../../simulator/definitions/challenges/archived/jbc2d-Ring-Around-the-Can-and-Back-It-Up';
import jbc3 from '../../simulator/definitions/challenges/jbc3-Precision-Parking';
import jbc4 from '../../simulator/definitions/challenges/jbc4-Serpentine';
// import jbc4b from '../../simulator/definitions/challenges/archived/jbc4b-Barrel-Racing';
import jbc5 from '../../simulator/definitions/challenges/jbc5-Odd-Numbers';
import jbc6 from '../../simulator/definitions/challenges/jbc6-Figure-Eight';
// import jbc6c from '../../simulator/definitions/challenges/archived/jbc6c-Empty-the-Garage';
import jbc7 from '../../simulator/definitions/challenges/jbc7-Load-Em-Up';
// import jbc7b from '../../simulator/definitions/challenges/archived/jbc7b-Cover-Your-Bases';
import jbc8 from '../../simulator/definitions/challenges/jbc8-Bulldozer-Mania';
import jbc9 from '../../simulator/definitions/challenges/jbc9-Cover-Your-Bases';
// import jbc8b from '../../simulator/definitions/challenges/archived/jbc8b-Serpentine-Jr';
import jbc10 from '../../simulator/definitions/challenges/jbc10-Chopped';
// import jbc10b from '../../simulator/definitions/challenges/archived/jbc10b-Solo-Joust-Jr';
import jbc11 from '../../simulator/definitions/challenges/jbc11-Making-Waves';
import jbc12 from '../../simulator/definitions/challenges/jbc12-Add-It-Up';
// import jbc13 from '../../simulator/definitions/challenges/archived/jbc13-Clean-the-Mat';
// import jbc14 from '../../simulator/definitions/challenges/jbc14-Dance-Party';
import jbc15 from '../../simulator/definitions/challenges/jbc15-Go-Fetch';
// import jbc15b from '../../simulator/definitions/challenges/archived/jbc15b-Bump-Bump';
import jbc16 from '../../simulator/definitions/challenges/jbc16-Pick-Em-Up';
import jbc17 from '../../simulator/definitions/challenges/jbc17-Mountain-Rescue';
// import jbc17b from '../../simulator/definitions/challenges/archived/jbc17b-Walk-the-Line-2';
import jbc18 from '../../simulator/definitions/challenges/jbc18-Stackerz-New';
import jbc19 from '../../simulator/definitions/challenges/jbc19-Bump';
import jbc20 from '../../simulator/definitions/challenges/jbc20-Amazing';
import jbc21 from '../../simulator/definitions/challenges/jbc21-Proximity';
import jbc22 from '../../simulator/definitions/challenges/jbc22-Search-and-Rescue';
import jbc23 from '../../simulator/definitions/challenges/jbc23-Find-the-Black-Line';
import jbc24 from '../../simulator/definitions/challenges/jbc24-Walk-the-Line';
// import test from '../../simulator/definitions/challenges/archived/test';
import Find_The_Black_Line from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Find-The-Black-Line';
import Sense_The_Can from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Sense-The-Can';
import Ice_Ice_Botguy from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Ice-Ice-Botguy';
import Thirst_Quencher from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Thirst-Quencher';
import Entree_Express from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Entree-Express';
import Special_Sauce from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Special-Sauce';
import Cover_Your_Bases from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Cover-Your-Bases';
import Odd_Numbers from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Odd-Numbers';
import Bulldozer_Mania from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Bulldozer-Mania';
import Mountain_Rescue from '../../simulator/definitions/challenges/gcer25/jbcGcer25-Mountain-Rescue';
import bex1 from '../../simulator/definitions/challenges/bex26/bex1-Waypoint-Alpha';
import bex2 from '../../simulator/definitions/challenges/bex26/bex2-Relocate-the-Red-Cube';
import bex3 from '../../simulator/definitions/challenges/bex26/bex3-Mixed-Freight';
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

  export interface ApplyChallengeConditions {
    type: 'challenges/apply-challenge-conditions';
    challengeId: string;
    success?: Predicate;
    failure?: Predicate;
    successGoals?: Goal[];
    failureGoals?: Goal[];
  }

  export const applyChallengeConditions = construct<ApplyChallengeConditions>(
    'challenges/apply-challenge-conditions'
  );

  export interface ListUserChallenges {
    type: 'challenges/list-user-challenges';
  }

  export const listUserChallenges = construct<ListUserChallenges>(
    'challenges/list-user-challenges'
  );

  export interface SetChallengesInternal {
    type: 'challenges/set-challenges-internal';
    challenges: Dict<AsyncChallenge>;
  }

  export const setChallengesInternal = construct<SetChallengesInternal>(
    'challenges/set-challenges-internal'
  );
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
  ChallengesAction.SetDescription |
  ChallengesAction.ApplyChallengeConditions |
  ChallengesAction.ListUserChallenges |
  ChallengesAction.SetChallengesInternal
);

const DEFAULT_CHALLENGES: Challenges = {
  // 'test': Async.loaded({
  //   value: test,
  //   brief: ChallengeBrief.fromChallenge(test),
  // }),
  // 'jbc6c': Async.loaded({
  //   value: jbc6c,
  //   brief: ChallengeBrief.fromChallenge(jbc6c),
  // }),
  'jbc0': Async.loaded({
    value: jbc0,
    brief: ChallengeBrief.fromChallenge(jbc0),
  }),
  'jbc1': Async.loaded({
    value: jbc1,
    brief: ChallengeBrief.fromChallenge(jbc1),
  }),
  'jbc2': Async.loaded({
    value: jbc2,
    brief: ChallengeBrief.fromChallenge(jbc2),
  }),
  // 'jbc2b': Async.loaded({
  //   value: jbc2b,
  //   brief: ChallengeBrief.fromChallenge(jbc2b),
  // }),
  // 'jbc2c': Async.loaded({
  //   value: jbc2c,
  //   brief: ChallengeBrief.fromChallenge(jbc2c),
  // }),
  // 'jbc2d': Async.loaded({
  //   value: jbc2d,
  //   brief: ChallengeBrief.fromChallenge(jbc2d),
  // }),
  'jbc3': Async.loaded({
    value: jbc3,
    brief: ChallengeBrief.fromChallenge(jbc3),
  }),
  'jbc4': Async.loaded({
    value: jbc4,
    brief: ChallengeBrief.fromChallenge(jbc4),
  }),
  // 'jbc4b': Async.loaded({
  //   value: jbc4b,
  //   brief: ChallengeBrief.fromChallenge(jbc4b),
  // }),
  'jbc5': Async.loaded({
    value: jbc5,
    brief: ChallengeBrief.fromChallenge(jbc5),
  }),
  'jbc6': Async.loaded({
    value: jbc6,
    brief: ChallengeBrief.fromChallenge(jbc6),
  }),
  'jbc7': Async.loaded({
    value: jbc7,
    brief: ChallengeBrief.fromChallenge(jbc7),
  }),
  // 'jbc7b': Async.loaded({
  //   value: jbc7b,
  //   brief: ChallengeBrief.fromChallenge(jbc7b),
  // }),
  'jbc8': Async.loaded({
    value: jbc8,
    brief: ChallengeBrief.fromChallenge(jbc8),
  }),
  // 'jbc8b': Async.loaded({
  //   value: jbc8b,
  //   brief: ChallengeBrief.fromChallenge(jbc8b),
  // }),
  'jbc9': Async.loaded({
    value: jbc9,
    brief: ChallengeBrief.fromChallenge(jbc9),
  }),
  'jbc10': Async.loaded({
    value: jbc10,
    brief: ChallengeBrief.fromChallenge(jbc10),
  }),
  // 'jbc10b': Async.loaded({
  //   value: jbc10b,
  //   brief: ChallengeBrief.fromChallenge(jbc10b),
  // }),
  'jbc11': Async.loaded({
    value: jbc11,
    brief: ChallengeBrief.fromChallenge(jbc11),
  }),
  'jbc12': Async.loaded({
    value: jbc12,
    brief: ChallengeBrief.fromChallenge(jbc12),
  }),
  // 'jbc13': Async.loaded({
  //   value: jbc13,
  //   brief: ChallengeBrief.fromChallenge(jbc13),
  // }),
  // 'jbc14': Async.loaded({
  //   value: jbc14,
  //   brief: ChallengeBrief.fromChallenge(jbc14),
  // }),
  'jbc15': Async.loaded({
    value: jbc15,
    brief: ChallengeBrief.fromChallenge(jbc15),
  }),
  // 'jbc15b': Async.loaded({
  //   value: jbc15b,
  //   brief: ChallengeBrief.fromChallenge(jbc15b),
  // }),
  'jbc16': Async.loaded({
    value: jbc16,
    brief: ChallengeBrief.fromChallenge(jbc16),
  }),
  'jbc17': Async.loaded({
    value: jbc17,
    brief: ChallengeBrief.fromChallenge(jbc17),
  }),
  // 'jbc17b': Async.loaded({
  //   value: jbc17b,
  //   brief: ChallengeBrief.fromChallenge(jbc17b),
  // }),
  'jbc18': Async.loaded({
    value: jbc18,
    brief: ChallengeBrief.fromChallenge(jbc18),
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
  'jbc23': Async.loaded({
    value: jbc23,
    brief: ChallengeBrief.fromChallenge(jbc23),
  }),
  'jbc24': Async.loaded({
    value: jbc24,
    brief: ChallengeBrief.fromChallenge(jbc24),
  }),
  'bex1': Async.loaded({
    value: bex1,
    brief: ChallengeBrief.fromChallenge(bex1)
  }),
  'bex2': Async.loaded({
    value: bex2,
    brief: ChallengeBrief.fromChallenge(bex2)
  }),
  'bex3': Async.loaded({
    value: bex3,
    brief: ChallengeBrief.fromChallenge(bex3)
  }),
  'Find_The_Black_Line': Async.loaded({
    value: Find_The_Black_Line,
    brief: ChallengeBrief.fromChallenge(Find_The_Black_Line),
  }),
  'Sense_The_Can': Async.loaded({
    value: Sense_The_Can,
    brief: ChallengeBrief.fromChallenge(Sense_The_Can),
  }),
  'Ice_Ice_Botguy': Async.loaded({
    value: Ice_Ice_Botguy,
    brief: ChallengeBrief.fromChallenge(Ice_Ice_Botguy),
  }),
  'Thirst_Quencher': Async.loaded({
    value: Thirst_Quencher,
    brief: ChallengeBrief.fromChallenge(Thirst_Quencher),
  }),
  'Entree_Express': Async.loaded({
    value: Entree_Express,
    brief: ChallengeBrief.fromChallenge(Entree_Express),
  }),
  'Special_Sauce': Async.loaded({
    value: Special_Sauce,
    brief: ChallengeBrief.fromChallenge(Special_Sauce),
  }),
  'Cover_Your_Bases': Async.loaded({
    value: Cover_Your_Bases,
    brief: ChallengeBrief.fromChallenge(Cover_Your_Bases),
  }),
  'Odd_Numbers': Async.loaded({
    value: Odd_Numbers,
    brief: ChallengeBrief.fromChallenge(Odd_Numbers),
  }),
  'Bulldozer_Mania': Async.loaded({
    value: Bulldozer_Mania,
    brief: ChallengeBrief.fromChallenge(Bulldozer_Mania),
  }),
  'Mountain_Rescue': Async.loaded({
    value: Mountain_Rescue,
    brief: ChallengeBrief.fromChallenge(Mountain_Rescue),
  }),
};

const create = async (challengeId: string, next: Async.Creating<Challenge>) => {
  await deferAfterReducer();
  try {
    if (!isCustomChallengeId(challengeId)) {
      await db.set(Selector.challenge(challengeId), next.value);
    }
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
  await deferAfterReducer();
  try {
    if (isCustomChallengeId(challengeId)) {
      const sceneAsync = store.getState().scenes[challengeId];
      const sceneValue = Async.latestValue(sceneAsync);
      if (isClassroomSharedReadOnlyScene(sceneValue)) {
        store.dispatch(ChallengesAction.setChallengeInternal({
          challenge: Async.loaded({
            brief: current.brief,
            value: current.value,
          }),
          challengeId,
        }));
        return;
      }
      if (!sceneValue) {
        throw new Error(`Cannot save custom challenge ${challengeId}: scene not loaded`);
      }
      const sceneToSave = sceneWithCustomChallenge(sceneValue, current.value);
      await db.set(Selector.scene(challengeId), sceneToSave);
      store.dispatch(ChallengesAction.setChallengeInternal({
        challenge: Async.loaded({
          brief: current.brief,
          value: current.value,
        }),
        challengeId,
      }));
      return;
    }
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
  await deferAfterReducer();
  const brief = Async.brief(current);
  try {
    if (isCustomChallengeId(challengeId)) {
      const scene = await db.get<Scene>(Selector.scene(challengeId));
      let value = challengeFromScene(challengeId, scene);
      if (!value) {
        throw new Error(`Scene ${challengeId} is not a custom challenge`);
      }
      if (!scene.customChallenge) {
        try {
          const legacy = await db.get<Challenge>(Selector.challenge(challengeId));
          value = {
            ...legacy,
            name: scene.name,
            description: scene.description,
            author: scene.author,
            sceneId: challengeId,
          };
          await db.set(Selector.scene(challengeId), sceneWithCustomChallenge(scene, value));
        } catch {
          // No legacy challenge document — use scene metadata with empty rules.
        }
      }
      store.dispatch(ChallengesAction.setChallengeInternal({
        challenge: Async.loaded({
          brief: ChallengeBrief.fromChallenge(value),
          value,
        }),
        challengeId,
      }));
      return;
    }
    const value = await db.get<Challenge>(Selector.challenge(challengeId));
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.loaded({ brief, value }),
      challengeId,
    }));
  } catch (error) {
    if (isCustomChallengeId(challengeId)) {
      const classrooms = store.getState().classrooms;
      const studentId = auth.currentUser?.uid;
      const sharedScene = sharedCustomChallengeSceneForStudent(
        classrooms,
        studentId,
        challengeId
      );
      const shared = sharedCustomChallengeForStudent(
        classrooms,
        studentId,
        challengeId
      );
      if (shared && sharedScene) {
        store.dispatch(ScenesAction.setSceneInternal({
          scene: Async.loaded({
            brief: SceneBrief.fromScene(sharedScene),
            value: sharedScene,
          }),
          sceneId: challengeId,
        }));
        store.dispatch(ChallengesAction.setChallengeInternal({
          challenge: Async.loaded({
            brief: ChallengeBrief.fromChallenge(shared),
            value: shared,
          }),
          challengeId,
        }));
        return;
      }
    }
    store.dispatch(ChallengesAction.setChallengeInternal({
      challenge: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      challengeId,
    }));
  }
};

export const listUserChallengesFromDb = async () => {
  await deferAfterReducer();
  const scenes = await db.list<Scene>(SCENE_COLLECTION);
  const customChallenges: Dict<AsyncChallenge> = {};
  for (const sceneId in scenes) {
    if (!isCustomChallengeId(sceneId)) continue;
    const scene = scenes[sceneId];
    const challenge = challengeFromScene(sceneId, scene);
    if (!challenge) continue;
    customChallenges[sceneId] = Async.loaded({
      brief: ChallengeBrief.fromChallenge(challenge),
      value: challenge,
    });
  }
  store.dispatch(ChallengesAction.setChallengesInternal({
    challenges: customChallenges,
  }));
};

const remove = async (challengeId: string, next: Async.Deleting<ChallengeBrief, Challenge>) => {
  await deferAfterReducer();
  try {
    if (!isCustomChallengeId(challengeId)) {
      await db.delete(Selector.challenge(challengeId));
    }
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
    case 'challenges/apply-challenge-conditions': return mutate(state, action.challengeId, challenge => {
      challenge.success = action.success;
      challenge.failure = action.failure;
      challenge.successGoals = action.successGoals;
      challenge.failureGoals = action.failureGoals;
    });
    case 'challenges/list-user-challenges': {
      void listUserChallengesFromDb();
      return state;
    }
    case 'challenges/set-challenges-internal': {
      const nextState = { ...state };
      for (const challengeId in action.challenges) {
        nextState[challengeId] = action.challenges[challengeId];
      }
      return nextState;
    }
    default: return state;
  }
};
