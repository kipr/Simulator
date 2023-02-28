import deepNeq from '../../../deepNeq';
import { Vector3 } from '../../../math';
import { Vector3 as UnitVector3, ReferenceFrame } from '../../../unit-math';
import { Angle, Distance, Mass } from '../../../util';
import construct from '../../../util/construct';
import LocalizedString from '../../../util/LocalizedString';
import Patch from '../../../util/Patch';

namespace Node {
  export enum Type {
    Frame = 'frame',
    Link = 'link',
    Weight = 'weight',
    Motor = 'motor',
    Servo = 'servo',
    EtSensor = 'et-sensor',
    TouchSensor = 'touch-sensor',
    LightSensor = 'light-sensor',
    ReflectanceSensor = 'reflectance-sensor',
    IRobotCreate = 'irobot-create',
  }
  
  interface Base {
    /**
     * A human readable name for the Node.
     */
    name?: LocalizedString;

    /**
     * A human readable description of the Node.
     */
    description?: LocalizedString;
  }

  namespace Base {
    export const innerDiff = (a: Base, b: Base): Patch.InnerPatch<Base> => ({
      name: Patch.diff(a.name, b.name),
      description: Patch.diff(a.description, b.description)
    });
  }

  export interface FrameLike {
    /**
     * Parent
     */
    parentId: string;

    /**
     * The translation and orientation from the parentId,
     * or ReferenceFrame.IDENTITY if undefined.
     */
    origin?: ReferenceFrame;
  }

  namespace FrameLike {
    export const innerDiff = (a: FrameLike, b: FrameLike): Patch.InnerPatch<FrameLike> => ({
      parentId: Patch.diff(a.parentId, b.parentId),
      origin: Patch.diff(a.origin, b.origin)
    });
  }

  /**
   * A Frame is a reference frame in the robot's kinematic tree.
   * It MUST be placed between two `Link`s.
   */
  export interface Frame extends FrameLike {
    type: Type.Frame;
  }

  export namespace Frame {
    export const diff = (a: Frame, b: Frame): Patch<Frame> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);

      return Patch.innerChange(a, b, {
        type: Patch.none(Type.Frame),
        ...FrameLike.innerDiff(a, b)
      });
    };
  }

  export interface Link extends Base {
    type: Type.Link;

    parentId?: string;

    /**
     * The mass of the link. If undefined, zero.
     */
    mass?: Mass;

    /**
     * Coefficient of friction. If undefined, zero.
     */
    friction?: number;

    /**
     * Restitution (bounciness). If undefined, zero.
     */
    restitution?: number;

    /**
     * The moment of inertia of the Mesh, represented as a
     * column-wise 3x3 matrix of numbers. If undefined, zeros.
     */
    inertia?: number[];

    /**
     * The physics body used for determining collision.
     */
    collisionBody: Link.CollisionBody;

    /**
     * The geometry to display for this mesh. If undefined, no mesh
     * is displayed.
     */
    geometryId?: string;
  }

  export const link = construct<Link>(Type.Link);

  export namespace Link {
    export namespace CollisionBody {
      export enum Type {
        Embedded = 'embedded',
        Sphere = 'sphere',
        Cylinder = 'cylinder',
        Box = 'box',
      }

      export interface Embedded {
        type: Type.Embedded;
      }

      export const EMBEDDED: Embedded = { type: Type.Embedded };

      export interface Sphere {
        type: Type.Sphere;
      }

      export const SPHERE: Sphere = { type: Type.Sphere };

      export interface Cylinder {
        type: Type.Cylinder;
      }

      export const CYLINDER: Cylinder = { type: Type.Cylinder };

      export interface Box {
        type: Type.Box;
      }

      export const BOX: Box = { type: Type.Box };
    }

    export type CollisionBody = (
      CollisionBody.Embedded |
      CollisionBody.Sphere |
      CollisionBody.Cylinder |
      CollisionBody.Box
    );

    export const diff = (a: Link, b: Link): Patch<Link> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);

      return Patch.innerChange(a, b, {
        type: Patch.none(Type.Link),
        parentId: Patch.diff(a.parentId, b.parentId),
        mass: Patch.diff(a.mass, b.mass),
        inertia: Patch.diff(a.inertia, b.inertia),
        collisionBody: Patch.diff(a.collisionBody, b.collisionBody),
        geometryId: Patch.diff(a.geometryId, b.geometryId),
        ...Base.innerDiff(a, b)
      });
    };
  }

  /**
   * A `Weight` can be attached to a `Link` to distribute mass arbitrarily.
   * It has no visual or physical representation.
   */
  export interface Weight {
    type: Type.Weight;

    /**
     * Parent. Must be a link.
     */
    parentId: string;

    /**
     * The translation and orientation from the parentId,
     * or ReferenceFrame.IDENTITY if undefined.
     */
    origin?: ReferenceFrame;

    /**
     * The mass of the weight.
     */
    mass: Mass;
  }

  export const weight = construct<Weight>(Type.Weight);

  export namespace Weight {
    export const diff = (a: Weight, b: Weight): Patch<Weight> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.Weight),
        parentId: Patch.diff(a.parentId, b.parentId),
        origin: Patch.diff(a.origin, b.origin),
        mass: Patch.diff(a.mass, b.mass)
      });
    };
  }

  export interface HingeJoint {
    /**
     * The axis of the parent
     */
    parentAxis: Vector3;
    
    /**
     * The axis of the child. If undefined, same as `parentAxis`.
     */
    childAxis?: Vector3;

    /**
     * The pivot point of the parent. If undefined, zero.
     */
    parentPivot?: UnitVector3;

    /**
     * The pivot point of the child. If undefined, zero.
     */
    childPivot?: UnitVector3;

    /**
     * The starting twist of the child relative to the parent along the main axis.
     * If undefined, zero.
     */
    childTwist?: Angle;
  }

  namespace HingeJoint {
    export const innerDiff = (a: HingeJoint, b: HingeJoint): Patch.InnerPatch<HingeJoint> => {
      return {
        parentAxis: Patch.diff(a.parentAxis, b.parentAxis),
        childAxis: Patch.diff(a.childAxis, b.childAxis),
        parentPivot: Patch.diff(a.parentPivot, b.parentPivot),
        childPivot: Patch.diff(a.childPivot, b.childPivot),
        childTwist: Patch.diff(a.childTwist, b.childTwist)
      };
    };
  }

  /**
   * A `Motor` is a continuous hinge joint.
   * It MUST have a parent that is a `Link`.
   */
  export interface Motor extends Base, HingeJoint {
    type: Type.Motor;

    parentId: string;

    /**
     * The number of ticks in a full revolution of the motor.
     * If undefined, 2048 is assumed.
     */
    ticksPerRevolution?: number;

    /**
     * Max velocity in ticks per second.
     * If undefined, 1500 ticks/sec is assumed.
     */
    velocityMax?: number;

    /**
     * The motor port.
     */
    motorPort: number;

    /**
     * The connection to the wombat. 'normal' or 'inverted'. If undefined, 'normal' is assumed.
     */
    plug?: Motor.Plug;
  }

  export const motor = construct<Motor>(Type.Motor);

  export namespace Motor {
    export enum Plug {
      Normal = 'normal',
      Inverted = 'inverted',
    }

    export const diff = (a: Motor, b: Motor): Patch<Motor> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.Motor),
        parentId: Patch.diff(a.parentId, b.parentId),
        ticksPerRevolution: Patch.diff(a.ticksPerRevolution, b.ticksPerRevolution),
        motorPort: Patch.diff(a.motorPort, b.motorPort),
        ...HingeJoint.innerDiff(a, b),
        ...Base.innerDiff(a, b)
      });
    };
  }

  /**
   * A `Servo` is a revolute hinge joint.
   * It MUST have a parent that is a `Link`.
   */
  export interface Servo extends Base, HingeJoint {
    type: Type.Servo;

    parentId: string;

    /**
     * Position limits. Defaults are used (described below) if undefined.
     * Note that these are logical limits, not physical limits. The physical limits
     * are always +/- 87.5 degrees.
     */
    position?: {
      /**
       * The minimum position of the servo. If undefined,
       * assumed to be -87.5 degrees from origin.
       */
      min?: Angle;

      /**
       * The maximum position of the servo. If undefined,
       * assumed to be 87.5 degrees from origin.
       */
      max?: Angle;
    };

    /**
     * The servo port.
     */
    servoPort: number;
  }

  export const servo = construct<Servo>(Type.Servo);

  export namespace Servo {
    export const diff = (a: Servo, b: Servo): Patch<Servo> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.Servo),
        parentId: Patch.diff(a.parentId, b.parentId),
        position: Patch.diff(a.position, b.position),
        servoPort: Patch.diff(a.servoPort, b.servoPort),
        ...HingeJoint.innerDiff(a, b),
        ...Base.innerDiff(a, b)
      });
    };
  }

  interface DigitalSensor extends FrameLike {
    /**
     * The digital port.
     */
    digitalPort: number;
  }

  namespace DigitalSensor {
    export const innerDiff = (a: DigitalSensor, b: DigitalSensor): Patch.InnerPatch<DigitalSensor> => {
      return {
        digitalPort: Patch.diff(a.digitalPort, b.digitalPort),
        ...FrameLike.innerDiff(a, b)
      };
    };
  }

  interface AnalogSensor extends FrameLike {
    /**
     * The analog port.
     */
    analogPort: number;
  }

  namespace AnalogSensor {
    export const innerDiff = (a: AnalogSensor, b: AnalogSensor): Patch.InnerPatch<AnalogSensor> => {
      return {
        analogPort: Patch.diff(a.analogPort, b.analogPort),
        ...FrameLike.innerDiff(a, b)
      };
    };
  }

  /**
   * ET (distance) sensor.
   */
  export interface EtSensor extends Base, AnalogSensor {
    type: Type.EtSensor;

    maxDistance?: Distance;

    noiseRadius?: Distance;
  }

  export const etSensor = construct<EtSensor>(Type.EtSensor);

  export namespace EtSensor {
    export const diff = (a: EtSensor, b: EtSensor): Patch<EtSensor> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.EtSensor),
        maxDistance: Patch.diff(a.maxDistance, b.maxDistance),
        noiseRadius: Patch.diff(a.noiseRadius, b.noiseRadius),
        ...Base.innerDiff(a, b),
        ...AnalogSensor.innerDiff(a, b)
      });
    };
  }

  export interface TouchSensor extends Base, DigitalSensor {
    type: Type.TouchSensor;

    collisionBox: UnitVector3;
  }

  export const touchSensor = construct<TouchSensor>(Type.TouchSensor);

  export namespace TouchSensor {
    export const diff = (a: TouchSensor, b: TouchSensor): Patch<TouchSensor> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.TouchSensor),
        collisionBox: Patch.diff(a.collisionBox, b.collisionBox),
        ...Base.innerDiff(a, b),
        ...DigitalSensor.innerDiff(a, b)
      });
    };
  }

  export interface LightSensor extends Base, AnalogSensor {
    type: Type.LightSensor;
  }

  export const lightSensor = construct<LightSensor>(Type.LightSensor);
  
  export interface ReflectanceSensor extends Base, AnalogSensor {
    type: Type.ReflectanceSensor;

    maxDistance?: Distance;

    noiseRadius?: Distance;
  }

  export const reflectanceSensor = construct<ReflectanceSensor>(Type.ReflectanceSensor);

  export namespace ReflectanceSensor {
    export const diff = (a: ReflectanceSensor, b: ReflectanceSensor): Patch<ReflectanceSensor> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);

      return Patch.innerChange(a, b, {
        type: Patch.none(Type.ReflectanceSensor),
        maxDistance: Patch.diff(a.maxDistance, b.maxDistance),
        noiseRadius: Patch.diff(a.noiseRadius, b.noiseRadius),
        ...Base.innerDiff(a, b),
        ...AnalogSensor.innerDiff(a, b)
      });
    };
  }

  export interface IRobotCreate extends Base, FrameLike {
    type: Type.IRobotCreate;
  }

  export const iRobotCreate = construct<IRobotCreate>(Type.IRobotCreate);

  export namespace IRobotCreate {
    export const diff = (a: IRobotCreate, b: IRobotCreate): Patch<IRobotCreate> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.IRobotCreate),
        ...Base.innerDiff(a, b),
        ...FrameLike.innerDiff(a, b)
      });
    };
  }

  export const diff = (a: Node, b: Node): Patch<Node> => {
    if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
    if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
    if (a.type !== b.type) return Patch.outerChange(a, b);

    switch (a.type) {
      case Type.Frame: return Frame.diff(a, b as Frame);
      case Type.Link: return Link.diff(a, b as Link);
      case Type.Motor: return Motor.diff(a, b as Motor);
      case Type.Servo: return Servo.diff(a, b as Servo);
      case Type.EtSensor: return EtSensor.diff(a, b as EtSensor);
      case Type.TouchSensor: return TouchSensor.diff(a, b as TouchSensor);
      case Type.ReflectanceSensor: return ReflectanceSensor.diff(a, b as ReflectanceSensor);
      case Type.IRobotCreate: return IRobotCreate.diff(a, b as IRobotCreate);
    }
  };

  export const isConstraint = (node: Node): boolean => {
    return node.type === Type.Motor || node.type === Type.Servo;
  };
}

type Node = (
  Node.Frame |
  Node.Link |
  Node.Weight |
  Node.Motor |
  Node.Servo |
  Node.EtSensor |
  Node.TouchSensor |
  Node.LightSensor |
  Node.ReflectanceSensor |
  Node.IRobotCreate
);

export default Node;