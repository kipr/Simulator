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
}
