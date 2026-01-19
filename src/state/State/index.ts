import { Size } from '../../components/interface/Widget';
import LocalizedString from '../../util/LocalizedString';
import Dict from '../../util/objectOps/Dict';
import Async from "./Async";
import { AsyncChallenge } from './Challenge';
import { AsyncChallengeCompletion } from './ChallengeCompletion';
import { AsyncLimitedChallenge } from './LimitedChallenge';
import { AsyncLimitedChallengeCompletion } from './LimitedChallengeCompletion';
import Documentation from './Documentation';
import DocumentationLocation from './Documentation/DocumentationLocation';
import Robot from './Robot';
import Scene, { AsyncScene } from './Scene';
import User, { AsyncUser } from './User';
import { AsyncAssignment } from './Assignment';

import tr from '@i18n';
import Author from '../../db/Author';
import Subject from './Assignment/Subject';
import StandardsLocation from './Assignment/StandardsLocation';

export type Assignments = Dict<AsyncAssignment>;

export namespace Assignments {
  export const EMPTY: Assignments = {};

  export const TEST: Assignments = {
    'test': Async.loaded({
      value: {
        name: tr('Test Assignment'),
        description: tr('This is a test assignment.'),
        author: Author.organization('kipr'),
        assets: {},
        educatorNotes: tr('Educator notes'),
        studentNotes: tr('Student notes'),
        gradeLevels: [0, 1, 2, 3, 4, 7, 8, 9, 11, 12],
        subjects: [Subject.Science],
        standardsAligned: true,
        standardsConformance: [StandardsLocation.Alaska, StandardsLocation.Oklahoma],
      }
    }),
  };
}

export type Scenes = Dict<AsyncScene>;

export namespace Scenes {
  export const EMPTY: Scenes = {};
}

export type Challenges = Dict<AsyncChallenge>;

export namespace Challenges {
  export const EMPTY: Challenges = {};
}

export type ChallengeCompletions = Dict<AsyncChallengeCompletion>;

export namespace ChallengeCompletions {
  export const EMPTY: ChallengeCompletions = {};
}

export type LimitedChallenges = Dict<AsyncLimitedChallenge>;

export namespace LimitedChallenges {
  export const EMPTY: LimitedChallenges = {};
}

export type LimitedChallengeCompletions = Dict<AsyncLimitedChallengeCompletion>;

export namespace LimitedChallengeCompletions {
  export const EMPTY: LimitedChallengeCompletions = {};
}

export interface Robots {
  robots: Dict<Async<Record<string, never>, Robot>>;
}

export namespace Robots {
  export const EMPTY: Robots = {
    robots: {},
  };

  export const loaded = (robots: Robots): Dict<Robot> => {
    const ret: Dict<Robot> = {};
    for (const id in robots.robots) {
      const robot = robots.robots[id];
      if (robot.type !== Async.Type.Loaded) continue;
      ret[id] = robot.value;
    }
    return ret;
  };
}

export interface DocumentationState {
  documentation: Documentation;
  locationStack: DocumentationLocation[];
  size: Size;
  language: 'c' | 'python';
}

export namespace DocumentationState {
  export const DEFAULT: DocumentationState = {
    documentation: SIMULATOR_LIBKIPR_C_DOCUMENTATION as Documentation || Documentation.EMPTY,
    locationStack: [],
    size: Size.MINIMIZED,
    language: 'c'
  };
}

export interface I18n {
  locale: LocalizedString.Language;
}

export interface Users {
  me?: string;
  users: Dict<AsyncUser>;
}

export namespace Users {
  export const EMPTY: Users = {
    users: {},
  };
}