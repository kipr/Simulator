import Dict from '../../Dict';
import Async from "./Async";
import Robot from './Robot';
import Scene from "./Scene";

export interface Scenes {
  scenes: Dict<Async<Scene>>;
  activeId?: string;
}

export namespace Scenes {
  export const EMPTY: Scenes = {
    scenes: {},
  };
}

export interface Robots {
  robots: Dict<Async<Robot>>;
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
