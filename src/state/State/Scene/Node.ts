import AbstractRobot from '../../../AbstractRobot';
import deepNeq from '../../../deepNeq';
import { Vector2, Vector3 } from '../../../math';
import { ReferenceFrame } from '../../../unit-math';
import { DistributiveOmit } from '../../../util/types';
import { Angle, Mass } from '../../../util/Value';
import LocalizedString from '../../../util/LocalizedString';
import Patch from '../../../util/Patch';
import Material from './Material';

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
    name: LocalizedString;
    startingOrigin?: ReferenceFrame;
    origin?: ReferenceFrame;
    scriptIds?: string[];
    documentIds?: string[];
    editable?: boolean;
    visible?: boolean;
  }

  export namespace Base {
    export const NIL: Base = {
      name: { [LocalizedString.EN_US]: '' },
      origin: undefined,
      scriptIds: undefined,
      documentIds: undefined,
      editable: undefined,
      visible: true
    };

    export const upcast = <T extends Base>(t: T): Base => ({
      name: t.name,
      origin: t.origin,
      scriptIds: t.scriptIds,
      documentIds: t.documentIds,
      editable: t.editable,
      visible: t.visible
    });

    export const partialDiff = (prev: Base, next: Base): Patch.InnerPatch<Base> => ({
      name: Patch.diff(prev.name, next.name),
      origin: Patch.diff(prev.origin, next.origin),
      scriptIds: Patch.diff(prev.scriptIds, next.scriptIds),
      documentIds: Patch.diff(prev.documentIds, next.documentIds),
      editable: Patch.diff(prev.editable, next.editable),
      visible: Patch.diff(prev.visible, next.visible)
    });
  }

  export interface Empty extends Base {
    type: 'empty';
    parentId?: string;
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
        parentId: Patch.diff(prev.parentId, next.parentId),
        ...Base.partialDiff(prev, next)
      });
    };
  }

  export interface Obj extends Base {
    type: 'object';
    parentId?: string;
    geometryId: string;
    physics?: Physics;
    material?: Material;
    faceUvs?: Vector2[];
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
        parentId: Patch.diff(prev.parentId, next.parentId),
        geometryId: Patch.diff(prev.geometryId, next.geometryId),
        physics: Patch.diff(prev.physics, next.physics),
        material: Material.diff(prev.material, next.material),
        faceUvs: Patch.diff(prev.faceUvs, next.faceUvs),
        ...Base.partialDiff(prev, next)
      });
    };
  }

  export interface PointLight extends Base {
    type: 'point-light';
    parentId?: string;
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
        parentId: Patch.diff(prev.parentId, next.parentId),
        intensity: Patch.diff(prev.intensity, next.intensity),
        radius: Patch.diff(prev.radius, next.radius),
        range: Patch.diff(prev.range, next.range),
        ...Base.partialDiff(prev, next)
      });
    };
  }

  export interface SpotLight extends Base {
    type: 'spot-light';
    parentId?: string;
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
        parentId: Patch.diff(prev.parentId, next.parentId),
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
    parentId?: string;
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
        parentId: Patch.diff(prev.parentId, next.parentId),
        radius: Patch.diff(prev.radius, next.radius),
        range: Patch.diff(prev.range, next.range),
        direction: Patch.diff(prev.direction, next.direction),
        intensity: Patch.diff(prev.intensity, next.intensity),
        ...Base.partialDiff(prev, next)
      });
    };
  }

  export interface FromTemplate extends Base {
    type: 'from-template';
    parentId?: string;
    templateId: string;
  }

  export namespace FromTemplate {
    export const NIL: FromTemplate = {
      type: 'from-template',
      ...Base.NIL,
      templateId: '',
    };

    export const from = <T extends Base>(t: T): FromTemplate => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: FromTemplate, next: FromTemplate): Patch<FromTemplate> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        parentId: Patch.diff(prev.parentId, next.parentId),
        templateId: Patch.diff(prev.templateId, next.templateId),
        ...Base.partialDiff(prev, next),
      });
    };
  }

  export interface Robot extends Base {
    type: 'robot';
    robotId: string;
    state: AbstractRobot.Stateless;
  }

  export namespace Robot {
    export const NIL: Robot = {
      type: 'robot',
      ...Base.NIL,
      robotId: undefined,
      state: AbstractRobot.Stateless.NIL,
    };

    export const from = <T extends Base>(t: T): Robot => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: Robot, next: Robot): Patch<Robot> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        robotId: Patch.diff(prev.robotId, next.robotId),
        state: AbstractRobot.Stateless.diff(prev.state, next.state),
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
      case 'from-template': return FromTemplate.diff(prev, next as FromTemplate);
      case 'robot': return Robot.diff(prev, next as Robot);
    }
  };

  export type Type = 'empty' | 'object' | 'point-light' | 'spot-light' | 'directional-light' | 'from-template' | 'robot';

  export const transmute = (node: Node, type: Type): Node => {
    switch (type) {
      case 'empty': return Empty.from(node);
      case 'object': return Obj.from(node);
      case 'point-light': return PointLight.from(node);
      case 'spot-light': return SpotLight.from(node);
      case 'directional-light': return DirectionalLight.from(node);
      case 'from-template': return FromTemplate.from(node);
      case 'robot': return Robot.from(node);
    }
  };

  export type TemplatedNode<T extends Base> = DistributiveOmit<T, keyof Base>;
}

type Node = (
  Node.Empty |
  Node.Obj |
  Node.PointLight |
  Node.SpotLight |
  Node.DirectionalLight |
  Node.FromTemplate |
  Node.Robot
);

export default Node;