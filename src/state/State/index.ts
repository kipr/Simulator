import Dict from '../../Dict';
import Async from "./Async";
import { AsyncChallenge } from './Challenge';
import Robot from './Robot';
import Scene, { AsyncScene } from './Scene';

export type Scenes = Dict<AsyncScene>;

export namespace Scenes {
  export const EMPTY: Scenes = {};
}

export interface Robots {
  robots: Dict<Async<Record<string, never>, Robot>>;
}

export type Challenges = Dict<AsyncChallenge>;

export namespace Challenges {
  export const EMPTY: Challenges = {};
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
