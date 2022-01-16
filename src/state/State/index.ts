import Dict from "../../Dict";
import Async from "./Async";
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