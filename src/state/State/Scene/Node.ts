import AbstractRobot from '../../../programming/AbstractRobot';
import deepNeq from '../../../util/redux/deepNeq';
import { RawVector2, RawVector3 } from '../../../util/math/math';
import { ReferenceFramewUnits } from '../../../util/math/unitMath';
import { DistributiveOmit } from '../../../util/types';
import { Angle, Mass } from '../../../util/math/Value';
import LocalizedString from '../../../util/LocalizedString';
import Patch from '../../../util/redux/Patch';
import Material from './Material';
import { PhysicsMotionType } from '@babylonjs/core';

/**
 * Nodes are all of the objects in a scene.
 * They store the physical properties of the object.
 */
namespace Node {
  /**
   * The parameters for a physics-enabled node.
   */
  export interface Physics {
    /**
     * This is used to track the id of the collision mesh for an object.
     * It is automatically assigned when an object is created, so you shouldn't need to set it manually.
     */
    colliderId?: string;

    /**
     * What shape will simulate the physics for the object:
     * box, sphere, cylinder, mesh, or none.
     */
    type: Physics.Type;

    /**
     * Describes whether the object should move. If undefined, dynamic (does move).
     */
    motionType?: PhysicsMotionType;

    /**
     * The mass of the object. If undefined, zero.
     */
    mass?: Mass;

    /**
     * Coefficient of friction. If undefined, 0.2.
     */
    friction?: number;

    /**
     * Restitution (bounciness) of the object.
     * Defines how much energy is retained after a collision, where zero
     * means none is retained, one means all energy is is retained, and values
     * greater than one mean that energy is gained from the collsion.
     * Should generally be between zero and one. If undefined, 0.2.
     */
    restitution?: number;

    /**
     * The moment of inertia of the Mesh, represented as a 3-length vector.
     * Represents how hard to rotate left/right (x), twisting around (y), and
     * rocking back/forward (z). The physics engine calculates this
     * automatically and it is difficult to get right setting it manually, so
     * this value is currently ignored.
     */
    inertia?: number[];

  }

  export namespace Physics {
    export type Type = 'box' | 'sphere' | 'cylinder' | 'mesh' | 'none';

    export const diff = (prev: Physics, next: Physics): Patch<Physics> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        colliderId: Patch.diff(prev.colliderId, next.colliderId),
        type: Patch.diff(prev.type, next.type),
        motionType: Patch.diff(prev.motionType, next.motionType),
        mass: Patch.diff(prev.mass, next.mass),
        friction: Patch.diff(prev.friction, next.friction),
        restitution: Patch.diff(prev.restitution, next.restitution),
        inertia: Patch.diff(prev.inertia, next.inertia)
      });
    };
  }

  interface Base {
    /**
     * The name of the object which will be displayed to the user.
     */
    name: LocalizedString;
    startingOrigin?: ReferenceFramewUnits;
    origin?: ReferenceFramewUnits;
    /**
     * Names of any scripts that you want to include in the scene
     */
    scriptIds?: string[];
    /**
     * Names of documents that you want to include in the scene
     */
    documentIds?: string[];
    /**
     * Can the user edit the object?
     */
    editable?: boolean;
    /**
     * Is the object visible to the user?
     * NOTE: If an object is not visible, it cannot have physics enabled.
     */
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

    // Upcast turns a extended type T into a base type
    export const upcast = <T extends Base>(t: T): Base => ({
      name: t.name,
      origin: t.origin,
      startingOrigin: t.startingOrigin,
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

  /**
   * A basic Node with physics.
   */
  export interface Obj extends Base {
    /**
     * What kind of thing it is.
     */
    type: 'object';
    /**
     * The parent Node ID.
     */
    parentId?: string;
    /**
     * The name of the Geometry of this node.
     * The Geometry variable must be accessable to the Node somehow.
     * See `/src/simulator/definitions/scenes/tableBase.ts` for an example of including it locally,
     * or `/src/simulator/definitions/nodes/2025gameTableTemplates.ts` and
     * `/src/simulator/definitions/scenes/tableSandbox.ts` for an example of using templates.
     */
    geometryId: string;
    /**
     * The Physics of the Node.
     */
    physics?: Physics;
    /**
     * The Material of the Node.
     */
    material?: Material;
    /**
     * The FaceUVs of the Node.
     */
    faceUvs?: RawVector2[];
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
    direction: RawVector3;
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
    direction: RawVector3;
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

  /**
   * A template representing a JBC object.
   */
  export interface FromJBCTemplate extends Base {
    /**
     * What kind of thing it is.
     */
    type: 'from-jbc-template';
    /**
     * The parent Node ID.
     */
    parentId?: string;
    /**
     * The template to use. See /src/simulator/definitions/nodes/index.ts
     * for examples.
     */
    templateId: string;
  }

  export namespace FromJBCTemplate {
    export const NIL: FromJBCTemplate = {
      type: 'from-jbc-template',
      ...Base.NIL,
      templateId: '',
    };

    export const from = <T extends Base>(t: T): FromJBCTemplate => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: FromJBCTemplate, next: FromJBCTemplate): Patch<FromJBCTemplate> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        parentId: Patch.diff(prev.parentId, next.parentId),
        templateId: Patch.diff(prev.templateId, next.templateId),
        ...Base.partialDiff(prev, next),
      });
    };
  }

  /**
   * A rock template Node.
   */
  export interface FromRockTemplate extends Base {
    /**
     * What kind of thing it is.
     */
    type: 'from-rock-template';
    /**
     * The parent Node ID.
     */
    parentId?: string;
    /**
     * The object's material (surface visual)
     */
    material?: Material;
    /**
     * The template to use.
     */
    templateId: string;
  }

  export namespace FromRockTemplate {
    export const NIL: FromRockTemplate = {
      type: 'from-rock-template',
      ...Base.NIL,
      templateId: '',
    };

    export const from = <T extends Base>(t: T): FromRockTemplate => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: FromRockTemplate, next: FromRockTemplate): Patch<FromRockTemplate> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        parentId: Patch.diff(prev.parentId, next.parentId),
        templateId: Patch.diff(prev.templateId, next.templateId),
        ...Base.partialDiff(prev, next),
      });
    };
  }

  /**
   * A Space template Node.
   */
  export interface FromSpaceTemplate extends Base {
    /**
     * What kind of thing it is.
     */
    type: 'from-space-template';
    /**
     * The template to use. See /src/simulator/definitions/nodes/index.ts
     * for examples.
     */
    templateId: string;
    /**
     * The parent Node ID.
     */
    parentId?: string;
    /**
     * The Physics of the Node.
     */
    physics?: Physics;
    /**
     * The Material of the Node.
     */
    material?: Material;
    /**
     * The geometry (shape) of the Node.
     */
    geometryId?: string;
  }

  export namespace FromSpaceTemplate {
    export const NIL: FromSpaceTemplate = {
      type: 'from-space-template',
      ...Base.NIL,
      templateId: '',
    };

    export const from = <T extends Base>(t: T): FromSpaceTemplate => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: FromSpaceTemplate, next: FromSpaceTemplate): Patch<FromSpaceTemplate> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        parentId: Patch.diff(prev.parentId, next.parentId),
        templateId: Patch.diff(prev.templateId, next.templateId),
        physics: Patch.diff(prev.physics, next.physics),
        material: Material.diff(prev.material, next.material),
        geometryId: Patch.diff(prev.geometryId, next.geometryId),
        ...Base.partialDiff(prev, next),
      });
    };
  }

  /**
   * A Botball gamepiece template Node.
   */
  export interface FromBBTemplate extends Base {
    /**
     * What kind of thing it is.
     */
    type: 'from-bb-template';
    /**
     * The template to use. See /src/simulator/definitions/nodes/index.ts
     * for examples.
     */
    templateId: string;
    /**
     * The parent Node ID.
     */
    parentId?: string;
    /**
     * The Physics of the Node.
     */
    physics?: Physics;
    /**
     * The Material of the Node.
     */
    material?: Material;
    /**
     * The geometry (shape) of the Node.
     */
    geometryId?: string;
  }

  export namespace FromBBTemplate {
    export const NIL: FromBBTemplate = {
      type: 'from-bb-template',
      ...Base.NIL,
      templateId: '',
    };

    export const from = <T extends Base>(t: T): FromBBTemplate => ({
      ...NIL,
      ...Base.upcast(t)
    });

    export const diff = (prev: FromBBTemplate, next: FromBBTemplate): Patch<FromBBTemplate> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        parentId: Patch.diff(prev.parentId, next.parentId),
        templateId: Patch.diff(prev.templateId, next.templateId),
        physics: Patch.diff(prev.physics, next.physics),
        material: Material.diff(prev.material, next.material),
        geometryId: Patch.diff(prev.geometryId, next.geometryId),
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

  /**
   * `All` is a transitory utility type to allow users to view a list of all
   * templates when adding a `Node` to a scene. See
   * `src/components/World/NodeSettings.tsx`. It is not intended to be used as
   * an actual object in scenes.
   */
  export interface All extends Base {
    type: 'all';
    templateId: string;
    parentId?: string;
  }

  export namespace All {
    export const NIL: All = {
      type: 'all',
      ...Base.NIL,
      templateId: '',
    };

    export const from = <T extends Base>(t: T): All => ({
      ...NIL,
      ...Base.upcast(t),
    });

    export const diff = (prev: All, next: All): Patch<All> => {
      if (deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        templateId: Patch.diff(prev.templateId, next.templateId),
        ...Base.partialDiff(prev, next),
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
      case 'from-jbc-template': return FromJBCTemplate.diff(prev, next as FromJBCTemplate);
      case 'from-rock-template': return FromRockTemplate.diff(prev, next as FromRockTemplate);
      case 'from-space-template': return FromSpaceTemplate.diff(prev, next as FromSpaceTemplate);
      case 'from-bb-template': return FromBBTemplate.diff(prev, next as FromBBTemplate);
      case 'all': return All.diff(prev, next as All);
      case 'robot': return Robot.diff(prev, next as Robot);
    }
  };

  export type Type = 'empty' | 'object' | 'point-light' | 'spot-light' | 'directional-light' | 'from-jbc-template' | 'from-space-template' | 'from-bb-template' | 'from-rock-template' | 'robot' | 'all';
  export const transmute = (node: Node, type: Type): Node => {
    switch (type) {
      case 'empty': return Empty.from(node);
      case 'object': return Obj.from(node);
      case 'point-light': return PointLight.from(node);
      case 'spot-light': return SpotLight.from(node);
      case 'directional-light': return DirectionalLight.from(node);
      case 'from-jbc-template': return FromJBCTemplate.from(node);
      case 'from-rock-template': return FromRockTemplate.from(node);
      case 'from-space-template': return FromSpaceTemplate.from(node);
      case 'from-bb-template': return FromBBTemplate.from(node);
      case 'robot': return Robot.from(node);
      case 'all': return All.from(node);
    }
  };

  /**
   * TemplateNode is the type of a node that includes only the properties that go beyond the
   * properties of base.
   */
  export type TemplatedNode<T extends Base> = DistributiveOmit<T, keyof Base>;
}

type Node = (
  Node.Empty |
  Node.Obj |
  Node.PointLight |
  Node.SpotLight |
  Node.DirectionalLight |
  Node.FromJBCTemplate |
  Node.FromRockTemplate |
  Node.FromSpaceTemplate |
  Node.FromBBTemplate |
  Node.Robot |
  Node.All
);

export default Node;
