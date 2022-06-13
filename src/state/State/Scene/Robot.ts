import deepNeq from "../../../deepNeq";
import { ReferenceFrame } from "../../../unit-math";
import Patch from "./Patch";

interface Robot {
  origin: ReferenceFrame;
}

namespace Robot {
  export const diff = (prev: Robot, next: Robot): Patch<Robot> => {
    if (!deepNeq(prev, next)) return Patch.none(prev);
    if (prev === undefined && next !== undefined) return Patch.outerChange(prev, next);
    if (prev !== undefined && next === undefined) return Patch.outerChange(prev, next);
    return Patch.innerChange(prev, next, {
      origin: Patch.diff(prev.origin, next.origin)
    });
  };
}

export default Robot;