import deepNeq from '../../../deepNeq';
import { Vector3 } from '../../../math';
import { ReferenceFrame } from '../../../unit-math';
import { Angle, Mass } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Patch from '../../../util/Patch';

namespace Node {
  export enum Type {
    Frame = 'frame',
    Link = 'link',
    Motor = 'motor',
    Servo = 'servo',
    EtSensor = 'et-sensor',
    TouchSensor = 'touch-sensor',
    ReflectanceSensor = 'reflectance-sensor',
  }
  
  interface Base {
    /// The parent Node, or undefined if a root.
    parentId?: string;

    /// The translation and orientation from the parentId,
    /// or ReferenceFrame.IDENTITY if undefined.
    origin: ReferenceFrame;

    /// A human readable name for the Node.
    name?: LocalizedString;

    /// A human readable description of the Node.
    description?: LocalizedString;
  }

  namespace Base {
    export const innerDiff = (a: Base, b: Base): Patch.InnerPatch<Base> => ({
      parentId: Patch.diff(a.parentId, b.parentId),
      origin: Patch.diff(a.origin, b.origin),
      name: Patch.diff(a.name, b.name),
      description: Patch.diff(a.description, b.description)
    });
  }

  export interface Frame extends Base {
    type: Type.Frame;
  }

  export namespace Frame {
    export const diff = (a: Frame, b: Frame): Patch<Frame> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);

      return Patch.innerChange(a, b, {
        type: Patch.none(Type.Frame),
        ...Base.innerDiff(a, b)
      });
    };
  }

  export interface Link extends Base {
    type: Type.Link;

    /// The mass of the link. If undefined, zero.
    mass?: Mass;

    /// The moment of inertia of the Mesh, represented as a
    /// column-wise 3x3 matrix of numbers. If undefined, zeros.
    inertia?: number[];

    /// The physics body used for determining collision. If undefined,
    /// the geometry at specified by geometryId is used.
    collisionBody?: Link.CollisionBody;

    /// The geometry to display for this mesh. If undefined, no mesh
    /// is displayed.
    geometryId?: string;
  }

  export namespace Link {
    export namespace CollisionBody {
      export enum Type {
        Geometry = 'geometry',
        Sphere = 'sphere',
        Box = 'box',
      }

      export interface Geometry {
        type: Type.Geometry;
        geometryId: string;
      }

      export interface Sphere {
        type: Type.Sphere;
      }

      export interface Box {
        type: Type.Box;
      }
    }

    export type CollisionBody = (
      CollisionBody.Geometry |
      CollisionBody.Sphere |
      CollisionBody.Box
    );

    export const diff = (a: Link, b: Link): Patch<Link> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);

      return Patch.innerChange(a, b, {
        type: Patch.none(Type.Link),
        parentId: Patch.diff(a.parentId, b.parentId),
        origin: Patch.diff(a.origin, b.origin),
        name: Patch.diff(a.name, b.name),
        description: Patch.diff(a.description, b.description),
        mass: Patch.diff(a.mass, b.mass),
        inertia: Patch.diff(a.inertia, b.inertia),
        collisionBody: Patch.diff(a.collisionBody, b.collisionBody),
        geometryId: Patch.diff(a.geometryId, b.geometryId),
        ...Base.innerDiff(a, b)
      });
    };
  }

  export interface Motor extends Base {
    type: Type.Motor;

    /// The axis of rotation.
    axis: Vector3;

    /// The number of ticks in a full revolution of the motor.
    /// If undefined, 1500 is assumed.
    ticksPerRevolution?: number;

    /// The motor port.
    motorPort: number;
  }

  export namespace Motor {
    export const diff = (a: Motor, b: Motor): Patch<Motor> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.Motor),
        axis: Patch.diff(a.axis, b.axis),
        ticksPerRevolution: Patch.diff(a.ticksPerRevolution, b.ticksPerRevolution),
        motorPort: Patch.diff(a.motorPort, b.motorPort),
        ...Base.innerDiff(a, b)
      });
    }
  }

  export interface Servo extends Base {
    type: Type.Servo;

    /// The axis of rotation.
    axis: Vector3;

    /// Position limits. Defaults are used (described below) if undefined.
    position?: {
      /// The minimum position of the servo. If undefined,
      /// assumed to be -90 degrees from origin.
      min?: Angle;
      /// The maximum position of the servo. If undefined,
      /// assumed to be 90 degrees from origin.
      max?: Angle;
    };

    /// The servo port.
    servoPort: number;
  }

  export namespace Servo {
    export const diff = (a: Servo, b: Servo): Patch<Servo> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.Servo),
        axis: Patch.diff(a.axis, b.axis),
        position: Patch.diff(a.position, b.position),
        servoPort: Patch.diff(a.servoPort, b.servoPort),
        ...Base.innerDiff(a, b)
      });
    }
  }

  /// ET (distance) sensor.
  export interface EtSensor extends Base {
    type: Type.EtSensor;

    /// The analog port.
    analogPort: number;
  }

  export namespace EtSensor {
    export const diff = (a: EtSensor, b: EtSensor): Patch<EtSensor> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.EtSensor),
        analogPort: Patch.diff(a.analogPort, b.analogPort),
        ...Base.innerDiff(a, b)
      });
    }
  }

  export interface TouchSensor extends Base {
    type: Type.TouchSensor;

    /// The digital port.
    digitalPort: number;
  }

  export namespace TouchSensor {
    export const diff = (a: TouchSensor, b: TouchSensor): Patch<TouchSensor> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);
      return Patch.innerChange(a, b, {
        type: Patch.none(Type.TouchSensor),
        digitalPort: Patch.diff(a.digitalPort, b.digitalPort),
        ...Base.innerDiff(a, b)
      });
    }
  }

  export interface ReflectanceSensor extends Base {
    type: Type.ReflectanceSensor;

    /// The analog port.
    analogPort: number;
  }

  export namespace ReflectanceSensor {
    export const diff = (a: ReflectanceSensor, b: ReflectanceSensor): Patch<ReflectanceSensor> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      if (a === undefined && b !== undefined) return Patch.outerChange(a, b);
      if (a !== undefined && b === undefined) return Patch.outerChange(a, b);

      return Patch.innerChange(a, b, {
        type: Patch.none(Type.ReflectanceSensor),
        analogPort: Patch.diff(a.analogPort, b.analogPort),
        ...Base.innerDiff(a, b)
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
    }
  };
}

type Node = (
  Node.Frame |
  Node.Link |
  Node.Motor |
  Node.Servo |
  Node.EtSensor |
  Node.TouchSensor |
  Node.ReflectanceSensor
);

export default Node;