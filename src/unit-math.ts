// Contains math types that are tagged with units

import { Angle, Distance, Value } from './util/Value';

import {
  Euler as RawEuler,
  Vector2 as RawVector2,
  Vector3 as RawVector3,
  AxisAngle as RawAxisAngle,
  ReferenceFrame as RawReferenceFrame,
  Quaternion,
} from './math';

import { TransformNode as BabylonTransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

export interface Vector2 {
  x: Distance;
  y: Distance;
}

export namespace Vector2 {
  export const zero = (type: Distance.Type = 'meters'): Vector2 => ({
    x: Distance.toType(Distance.meters(0), type),
    y: Distance.toType(Distance.meters(0), type),
  });

  export const create = (x: Distance, y: Distance, z: Distance): Vector2 => ({ x, y });

  export const toRaw = (v: Vector2, type: Distance.Type) => RawVector2.create(
    Distance.toType(v.x, type).value,
    Distance.toType(v.y, type).value,
  );

  export const fromRaw = (raw: RawVector2, type: Distance.Type) => ({
    x: { type, value: raw.x },
    y: { type, value: raw.y },
  });

  export const toTypeGranular = (v: Vector2, x: Distance.Type, y: Distance.Type): Vector2 => {
    return {
      x: Distance.toType(v.x, x),
      y: Distance.toType(v.y, y),
    };
  };
}

export interface Vector3 {
  x: Distance;
  y: Distance;
  z: Distance;
}

export namespace Vector3 {
  export const zero = (type: Distance.Type = 'meters'): Vector3 => ({
    x: Distance.toType(Distance.meters(0), type),
    y: Distance.toType(Distance.meters(0), type),
    z: Distance.toType(Distance.meters(0), type),
  });

  export const ZERO_METERS = zero('meters');

  export const one = (type: Distance.Type = 'meters'): Vector3 => ({
    x: Distance.toType(Distance.meters(1), type),
    y: Distance.toType(Distance.meters(1), type),
    z: Distance.toType(Distance.meters(1), type),
  });

  export const create = (x: Distance, y: Distance, z: Distance): Vector3 => ({ x, y, z });
  export const createX = (x: Distance): Vector3 => ({ x, y: Distance.ZERO_METERS, z: Distance.ZERO_METERS });
  export const createY = (y: Distance): Vector3 => ({ x: Distance.ZERO_METERS, y, z: Distance.ZERO_METERS });
  export const createZ = (z: Distance): Vector3 => ({ x: Distance.ZERO_METERS, y: Distance.ZERO_METERS, z });

  export const meters = (x: number, y: number, z: number) => create(
    Distance.meters(x),
    Distance.meters(y),
    Distance.meters(z),
  );

  export const centimeters = (x: number, y: number, z: number) => create(
    Distance.centimeters(x),
    Distance.centimeters(y),
    Distance.centimeters(z),
  );

  export const metersX = (x: number) => createX(Distance.meters(x));
  export const metersY = (y: number) => createY(Distance.meters(y));
  export const metersZ = (z: number) => createZ(Distance.meters(z));


  export const toRaw = (v: Vector3, type: Distance.Type) => RawVector3.create(
    Distance.toType(v.x, type).value,
    Distance.toType(v.y, type).value,
    Distance.toType(v.z, type).value
  );

  export const toRawGranular = (v: Vector3, x: Distance.Type, y: Distance.Type, z: Distance.Type) => RawVector3.create(
    Distance.toType(v.x, x).value,
    Distance.toType(v.y, y).value,
    Distance.toType(v.z, z).value
  );

  export const toBabylon = (v: Vector3, type: Distance.Type) => RawVector3.toBabylon(toRaw(v || ZERO_METERS, type));

  export const fromRaw = (raw: RawVector3, type: Distance.Type) => ({
    x: { type, value: raw.x },
    y: { type, value: raw.y },
    z: { type, value: raw.z },
  });

  export const fromRawGranular = (raw: RawVector3, x: Distance.Type, y: Distance.Type, z: Distance.Type) => ({
    x: { type: x, value: raw.x },
    y: { type: y, value: raw.y },
    z: { type: z, value: raw.z },
  });

  export const toTypeGranular = (v: Vector3, x: Distance.Type, y: Distance.Type, z: Distance.Type): Vector3 => {
    return {
      x: Distance.toType(v.x, x),
      y: Distance.toType(v.y, y),
      z: Distance.toType(v.z, z),
    };
  };

  export const distance = (lhs: Vector3, rhs: Vector3, newType: Distance.Type = 'meters'): Distance => {
    const raw = Distance.meters(RawVector3.distance(Vector3.toRaw(lhs, 'meters'), Vector3.toRaw(rhs, 'meters')));
    return Distance.toType(raw, newType);
  };

  /**
   * Adds two vectors together
   * 
   * @param lhs The left hand side of the addition. The units of this vector will be used for the result.
   * @param rhs The right hand side of the addition.
   */
  export const add = (lhs: Vector3, rhs: Vector3): Vector3 => {
    const raw = RawVector3.add(Vector3.toRawGranular(lhs, lhs.x.type, lhs.y.type, lhs.z.type), Vector3.toRawGranular(rhs, lhs.x.type, lhs.y.type, lhs.z.type));
    return Vector3.fromRawGranular(raw, lhs.x.type, lhs.y.type, lhs.z.type);
  };

  export const subtract = (lhs: Vector3, rhs: Vector3): Vector3 => {
    const raw = RawVector3.subtract(Vector3.toRawGranular(lhs, lhs.x.type, lhs.y.type, lhs.z.type), Vector3.toRawGranular(rhs, lhs.x.type, lhs.y.type, lhs.z.type));
    return Vector3.fromRawGranular(raw, lhs.x.type, lhs.y.type, lhs.z.type);
  };

  /**
   * Clamp a vector between a min and max value
   * @param min The minimum
   * @param v The value to clamp. The units of this vector will be used for the result.
   * @param max The maximum
   */
  export const clamp = (min: Vector3, v: Vector3, max: Vector3): Vector3 => {
    const minConv = Vector3.toRawGranular(min, v.x.type, v.y.type, v.z.type);
    const maxConv = Vector3.toRawGranular(max, v.x.type, v.y.type, v.z.type);
    const vConv = Vector3.toRawGranular(v, v.x.type, v.y.type, v.z.type);

    const raw = RawVector3.clampVec(minConv, vConv, maxConv);
    return Vector3.fromRawGranular(raw, v.x.type, v.y.type, v.z.type);
  };

  export const length = (v: Vector3): Distance => {
    const raw = Distance.meters(RawVector3.length(Vector3.toRaw(v, 'meters')));
    return Distance.toType(raw, v.x.type);
  };
}



export namespace Rotation {
  export type Type = 'euler' | 'axis-angle';

  export interface Euler {
    type: 'euler';
    x: Angle;
    y: Angle;
    z: Angle;
    order?: RawEuler.Order;
  }

  export namespace Euler {
    export const identity = (type: Angle.Type = Angle.Type.Radians): Euler => ({
      type: 'euler',
      x: Angle.toType(Angle.radians(0), type),
      y: Angle.toType(Angle.radians(0), type),
      z: Angle.toType(Angle.radians(0), type),
      order: 'yzx',
    });

    export const toRaw = (e: Euler) => RawEuler.create(
      Angle.toType(e.x, Angle.Type.Radians).value,
      Angle.toType(e.y, Angle.Type.Radians).value,
      Angle.toType(e.z, Angle.Type.Radians).value,
      e.order || 'yzx'
    );

    export const fromRaw = (raw: RawEuler): Euler => ({
      type: 'euler',
      x: { type: Angle.Type.Radians, value: raw.x },
      y: { type: Angle.Type.Radians, value: raw.y },
      z: { type: Angle.Type.Radians, value: raw.z },
      order: raw.order || 'yzx',
    });
  }
  
  export interface AxisAngle {
    type: 'axis-angle';
    angle: Angle;
    axis: Vector3;
  }

  export namespace AxisAngle {
    export const identity = (angleType: Angle.Type = Angle.Type.Degrees, axisType: Distance.Type = 'meters'): AxisAngle => {
      const angle = Angle.toType(Angle.radians(0), angleType);
      const axis = Vector3.zero(axisType);
      return {
        type: 'axis-angle',
        angle,
        axis,
      };
    };

    export const toRaw = (a: AxisAngle) => RawAxisAngle.create(
      Angle.toType(a.angle, Angle.Type.Radians).value,
      Vector3.toRaw(a.axis, 'meters')
    );

    export const fromRaw = (raw: RawAxisAngle): AxisAngle => {
      const angle = Angle.radians(raw.angle);
      const axis = Vector3.fromRaw(raw.axis, 'meters');
      return {
        type: 'axis-angle',
        angle,
        axis,
      };
    };
  }

  export const axisAngle = (axis: Vector3, angle: Angle): AxisAngle => ({
    type: 'axis-angle',
    angle: angle || Angle.ZERO_RADIANS,
    axis: axis || Vector3.ZERO_METERS,
  });

  export const euler = (x: Angle, y: Angle, z: Angle, order?: RawEuler.Order): Euler => ({
    type: 'euler',
    x,
    y,
    z,
    order: order || 'yzx',
  });

  export const eulerDegrees = (x: number, y: number, z: number, order?: RawEuler.Order) => euler(
    Angle.degrees(x),
    Angle.degrees(y),
    Angle.degrees(z),
    order
  );

  export const eulerRadians = (x: number, y: number, z: number, order?: RawEuler.Order) => euler(
    Angle.radians(x),
    Angle.radians(y),
    Angle.radians(z),
    order
  );

  export const toRawQuaternion = (rotation: Rotation) => {
    if (!rotation) return Quaternion.IDENTITY;
    switch (rotation.type) {
      case 'euler': return RawEuler.toQuaternion(Euler.toRaw(rotation));
      case 'axis-angle': return RawAxisAngle.toQuaternion(AxisAngle.toRaw(rotation));
    }
  };

  export const toType = (rotation: Rotation, type: Type): Rotation => {
    switch (type) {
      case 'euler': return Euler.fromRaw(RawEuler.fromQuaternion(toRawQuaternion(rotation)));
      case 'axis-angle': return AxisAngle.fromRaw(RawAxisAngle.fromQuaternion(toRawQuaternion(rotation)));
    }
  };

  export const fromRawQuaternion = (q: Quaternion, type: Type): Rotation => {
    switch (type) {
      case 'euler': return Euler.fromRaw(RawEuler.fromQuaternion(q));
      case 'axis-angle': return AxisAngle.fromRaw(RawAxisAngle.fromQuaternion(q));
    }
  };

  export const angle = (lhs: Rotation, rhs: Rotation): Angle => Angle.radians(Quaternion.angle(toRawQuaternion(lhs), toRawQuaternion(rhs)));
  export const slerp = (lhs: Rotation, rhs: Rotation, t: number, newType: Type = 'euler'): Rotation => fromRawQuaternion(Quaternion.slerp(toRawQuaternion(lhs), toRawQuaternion(rhs), t), newType);
}

export type Rotation = Rotation.Euler | Rotation.AxisAngle;

export interface ReferenceFrame {
  position?: Vector3;
  orientation?: Rotation;
  scale?: RawVector3;
}

export namespace ReferenceFrame {
  export const IDENTITY: ReferenceFrame = {
    position: Vector3.zero(),
    orientation: Rotation.Euler.identity(),
    scale: RawVector3.ONE,
  };

  export const create = (position?: Vector3, orientation?: Rotation, scale: RawVector3 = RawVector3.ONE): ReferenceFrame => ({
    position,
    orientation,
    scale
  });

  export const toRaw = (frame: ReferenceFrame, distanceType: Distance.Type = 'meters') => {
    return RawReferenceFrame.create(
      Vector3.toRaw(frame.position || Vector3.zero('meters'), distanceType),
      Rotation.toRawQuaternion(frame.orientation || Rotation.Euler.identity()),
      frame.scale || RawVector3.ONE
    );
  };

  export const toBabylon = (frame: ReferenceFrame, distanceType: Distance.Type = 'meters') =>
    RawReferenceFrame.toBabylon(toRaw(frame || IDENTITY, distanceType));

  export const syncBabylon = (frame: ReferenceFrame, bNode: BabylonTransformNode | BabylonAbstractMesh, distanceType: Distance.Type = 'meters') => {
    RawReferenceFrame.syncBabylon(toRaw(frame, distanceType), bNode);
  };
}