import deepNeq from "../../../deepNeq";
import { Vector3 } from "../../../unit-math";
import { Distance } from "../../../util/Value";
import Patch from '../../../util/Patch';

namespace Camera {
  export interface ArcRotate {
    type: 'arc-rotate';
    target: Vector3;
    position: Vector3;
    radius: Distance;
  }

  namespace ArcRotate {
    export const diff = (prev: ArcRotate, next: ArcRotate): Patch<ArcRotate> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        target: Patch.diff(prev.target, next.target),
        position: Patch.diff(prev.position, next.position),
        radius: Patch.diff(prev.radius, next.radius),
      });
    };
  }

  export type ArcRotateParams = Omit<ArcRotate, 'type'>;

  export const arcRotate = (params: ArcRotateParams): ArcRotate => ({
    type: 'arc-rotate',
    ...params
  });

  export type Type = 'arc-rotate' | 'none';

  export const diff = (prev: Camera, next: Camera): Patch<Camera> => {
    if (!deepNeq(prev, next)) return Patch.none(prev);

    if (prev.type !== next.type) return Patch.outerChange(prev, next);

    switch (next.type) {
      case 'arc-rotate': return ArcRotate.diff(prev as ArcRotate, next);
      case 'none': return Patch.none(prev);
    }
  };

  export interface None {
    type: "none";
  }

  export const NONE: None = {
    type: "none"
  };
}

type Camera = Camera.ArcRotate | Camera.None;

export default Camera;