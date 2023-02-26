import { Size } from '../../components/Widget';
import LocalizedString from '../../util/LocalizedString';
import Dict from '../../Dict';
import Async from "./Async";
import { AsyncChallenge } from './Challenge';
import { AsyncChallengeCompletion } from './ChallengeCompletion';
import Documentation from './Documentation';
import DocumentationLocation from './Documentation/DocumentationLocation';
import Robot from './Robot';
import { AsyncScene } from './Scene';

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