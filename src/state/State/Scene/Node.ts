import deepNeq from '../../../deepNeq';
import { Vector3 } from '../../../math';
import { ReferenceFrame } from '../../../unit-math';
import { Angle, Mass } from '../../../util';
import Patch from './Patch';

namespace Node {
  
  export interface Physics {
    colliderId?: string;
    fixed?: boolean;
    type: Physics.Type;
    mass?: Mass;
    friction?: number;
    restitution?: number;
  }

  export namespace Physics {
    export type Type = 'box' | 'sphere' | 'cylinder' | 'mesh' | 'none';
  
    export const diff = (prev: Physics, next: Physics): Patch<Physics> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        colliderId: Patch.diff(prev.colliderId, next.colliderId),
        fixed: Patch.diff(prev.fixed, next.fixed),
        type: Patch.diff(prev.type, next.type),
        mass: Patch.diff(prev.mass, next.mass),
        friction: Patch.diff(prev.friction, next.friction),
        restitution: Patch.diff(prev.restitution, next.restitution)
      });
    };
  }

  interface Base {
    name: string;
    parentId?: string;
    origin?: ReferenceFrame;
    physics?: Physics;
    scriptIds?: string[];
    documentIds?: string[];
    editable?: boolean;
    visible?: boolean;
  }

  namespace Base {
    export const NIL: Base = {
      name: '',
      parentId: undefined,
      origin: undefined,
      physics: undefined,
      scriptIds: undefined,
      documentIds: undefined,
      editable: undefined,
      visible: true
    };

    export const upcast = <T extends Base>(t: T): Base => ({
      name: t.name,
      parentId: t.parentId,
      origin: t.origin,
      physics: t.physics,
      scriptIds: t.scriptIds,
      documentIds: t.documentIds,
      editable: t.editable,
      visible: t.visible
    });

    export const partialDiff = (prev: Base, next: Base): Patch.InnerPatch<Base> => ({
      name: Patch.diff(prev.name, next.name),
      parentId: Patch.diff(prev.parentId, next.parentId),
      origin: Patch.diff(prev.origin, next.origin),
      physics: Patch.diff(prev.physics, next.physics),
      scriptIds: Patch.diff(prev.scriptIds, next.scriptIds),
      documentIds: Patch.diff(prev.documentIds, next.documentIds),
      editable: Patch.diff(prev.editable, next.editable),
      visible: Patch.diff(prev.visible, next.visible)
    });
  }

  export interface Empty extends Base {
    type: 'empty';
  }

  export namespace Empty {
    export const NIL: Empty = {
      type: 'empty',
      ...Base.NIL
    };

    export const from = <T extends Base>(t: T): Empty => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: Empty, next: Empty): Patch<Empty> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        ...Base.partialDiff(prev, next)
      });
    };
  }

  export interface Obj extends Base {
    type: 'object';
    geometryId: string;
  }

  export namespace Obj {
    export const NIL: Obj = {
      type: 'object',
      ...Base.NIL,
      geometryId: undefined,
    };

    export const from = <T extends Base>(t: T): Obj => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: Obj, next: Obj): Patch<Obj> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        geometryId: Patch.diff(prev.geometryId, next.geometryId),
        ...Base.partialDiff(prev, next)
      });
    };
  }

  export interface PointLight extends Base {
    type: 'point-light';
    intensity: number;
    radius?: number;
    range?: number;
  }

  export namespace PointLight {
    export const NIL: PointLight = {
      type: 'point-light',
      ...Base.NIL,
      intensity: 1
    };

    export const from = <T extends Base>(t: T): PointLight => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: PointLight, next: PointLight): Patch<PointLight> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        intensity: Patch.diff(prev.intensity, next.intensity),
        radius: Patch.diff(prev.radius, next.radius),
        range: Patch.diff(prev.range, next.range),
        ...Base.partialDiff(prev, next)
      });
    };
  }

  export interface SpotLight extends Base {
    type: 'spot-light';
    direction: Vector3;
    angle: Angle;
    exponent: number;
    intensity: number;
  }

  export namespace SpotLight {
    export const NIL: SpotLight = {
      type: 'spot-light',
      ...Base.NIL,
      angle: Angle.degrees(90),
      exponent: 1,
      intensity: 1,
      direction: { x: 0, y: -1, z: 0 },
    };

    export const from = <T extends Base>(t: T): SpotLight => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: SpotLight, next: SpotLight): Patch<SpotLight> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        direction: Patch.diff(prev.direction, next.direction),
        angle: Patch.diff(prev.angle, next.angle),
        exponent: Patch.diff(prev.exponent, next.exponent),
        intensity: Patch.diff(prev.intensity, next.intensity),
        ...Base.partialDiff(prev, next)
      });
    };
  }

  export interface DirectionalLight extends Base {
    type: 'directional-light';
    radius?: number;
    range?: number;
    direction: Vector3;
    intensity: number;
  }

  export namespace DirectionalLight {
    export const NIL: DirectionalLight = {
      type: 'directional-light',
      ...Base.NIL,
      intensity: 1,
      direction: { x: 0, y: -1, z: 0 },
    };

    export const from = <T extends Base>(t: T): DirectionalLight => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: DirectionalLight, next: DirectionalLight): Patch<DirectionalLight> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        radius: Patch.diff(prev.radius, next.radius),
        range: Patch.diff(prev.range, next.range),
        direction: Patch.diff(prev.direction, next.direction),
        intensity: Patch.diff(prev.intensity, next.intensity),
        ...Base.partialDiff(prev, next)
      });
    };
  }

  export const diff = (prev: Node, next: Node): Patch<Node> => {
    if (prev.type !== next.type) return Patch.outerChange(prev, next);

    switch (prev.type) {
      case 'empty': return Empty.diff(prev, next as Empty);
      case 'object': return Obj.diff(prev, next as Obj);
      case 'point-light': return PointLight.diff(prev, next as PointLight);
      case 'spot-light': return SpotLight.diff(prev, next as SpotLight);
      case 'directional-light': return DirectionalLight.diff(prev, next as DirectionalLight);
    }
  };

  export type Type = 'empty' | 'object' | 'point-light' | 'spot-light' | 'directional-light';

  export const transmute = (node: Node, type: Type): Node => {
    switch (type) {
      case 'empty': return Empty.from(node);
      case 'object': return Obj.from(node);
      case 'point-light': return PointLight.from(node);
      case 'spot-light': return SpotLight.from(node);
      case 'directional-light': return DirectionalLight.from(node);
    }
  };
}

type Node = Node.Empty | Node.Obj | Node.PointLight | Node.SpotLight | Node.DirectionalLight;

export default Node;