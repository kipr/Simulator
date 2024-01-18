/**
 * This file contains a set of functions for converting between different units.
 * The 'wUnits' suffix stands for 'with units', and indicates that the function or
 * object takes and returns values with units attached.
 */
import { Angle, Distance, Value } from './Value';

import {
  RawEuler,
  RawVector2,
  RawVector3,
  RawAxisAngle,
  RawReferenceFrame,
  RawQuaternion,
} from './math';

import { TransformNode as BabylonTransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

export interface Vector2wUnits {
  x: Distance;
  y: Distance;
}

export namespace Vector2wUnits {
  export const zero = (type: Distance.Type = 'meters'): Vector2wUnits => ({
    x: Distance.toType(Distance.meters(0), type),
    y: Distance.toType(Distance.meters(0), type),
  });

  export const create = (x: Distance, y: Distance, z: Distance): Vector2wUnits => ({ x, y });

  export const toRaw = (v: Vector2wUnits, type: Distance.Type) => RawVector2.create(
    Distance.toType(v.x, type).value,
    Distance.toType(v.y, type).value,
  );

  export const fromRaw = (raw: RawVector2, type: Distance.Type) => ({
    x: { type, value: raw.x },
    y: { type, value: raw.y },
  });

  export const toTypeGranular = (v: Vector2wUnits, x: Distance.Type, y: Distance.Type): Vector2wUnits => {
    return {
      x: Distance.toType(v.x, x),
      y: Distance.toType(v.y, y),
    };
  };
}

export interface Vector3wUnits {
  x: Distance;
  y: Distance;
  z: Distance;
}

export namespace Vector3wUnits {
  export const zero = (type: Distance.Type = 'meters'): Vector3wUnits => ({
    x: Distance.toType(Distance.meters(0), type),
    y: Distance.toType(Distance.meters(0), type),
    z: Distance.toType(Distance.meters(0), type),
  });

  export const ZERO_METERS = zero('meters');

  export const one = (type: Distance.Type = 'meters'): Vector3wUnits => ({
    x: Distance.toType(Distance.meters(1), type),
    y: Distance.toType(Distance.meters(1), type),
    z: Distance.toType(Distance.meters(1), type),
  });

  export const create = (x: Distance, y: Distance, z: Distance): Vector3wUnits => ({ x, y, z });
  export const createX = (x: Distance): Vector3wUnits => ({ x, y: Distance.ZERO_METERS, z: Distance.ZERO_METERS });
  export const createY = (y: Distance): Vector3wUnits => ({ x: Distance.ZERO_METERS, y, z: Distance.ZERO_METERS });
  export const createZ = (z: Distance): Vector3wUnits => ({ x: Distance.ZERO_METERS, y: Distance.ZERO_METERS, z });

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


  export const toRaw = (v: Vector3wUnits, type: Distance.Type) => RawVector3.create(
    Distance.toType(v.x, type).value,
    Distance.toType(v.y, type).value,
    Distance.toType(v.z, type).value
  );

  export const toRawGranular = (v: Vector3wUnits, x: Distance.Type, y: Distance.Type, z: Distance.Type) => RawVector3.create(
    Distance.toType(v.x, x).value,
    Distance.toType(v.y, y).value,
    Distance.toType(v.z, z).value
  );

  export const toBabylon = (v: Vector3wUnits, type: Distance.Type) => RawVector3.toBabylon(toRaw(v || ZERO_METERS, type));

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

  export const toTypeGranular = (v: Vector3wUnits, x: Distance.Type, y: Distance.Type, z: Distance.Type): Vector3wUnits => {
    return {
      x: Distance.toType(v.x, x),
      y: Distance.toType(v.y, y),
      z: Distance.toType(v.z, z),
    };
  };

  export const distance = (lhs: Vector3wUnits, rhs: Vector3wUnits, newType: Distance.Type = 'meters'): Distance => {
    const raw = Distance.meters(RawVector3.distance(Vector3wUnits.toRaw(lhs, 'meters'), Vector3wUnits.toRaw(rhs, 'meters')));
    return Distance.toType(raw, newType);
  };

  /**
   * Adds two vectors together
   * 
   * @param lhs The left hand side of the addition. The units of this vector will be used for the result.
   * @param rhs The right hand side of the addition.
   */
  export const add = (lhs: Vector3wUnits, rhs: Vector3wUnits): Vector3wUnits => {
    const raw = RawVector3.add(Vector3wUnits.toRawGranular(lhs, lhs.x.type, lhs.y.type, lhs.z.type), Vector3wUnits.toRawGranular(rhs, lhs.x.type, lhs.y.type, lhs.z.type));
    return Vector3wUnits.fromRawGranular(raw, lhs.x.type, lhs.y.type, lhs.z.type);
  };

  export const subtract = (lhs: Vector3wUnits, rhs: Vector3wUnits): Vector3wUnits => {
    const raw = RawVector3.subtract(Vector3wUnits.toRawGranular(lhs, lhs.x.type, lhs.y.type, lhs.z.type), Vector3wUnits.toRawGranular(rhs, lhs.x.type, lhs.y.type, lhs.z.type));
    return Vector3wUnits.fromRawGranular(raw, lhs.x.type, lhs.y.type, lhs.z.type);
  };

  /**
   * Clamp a vector between a min and max value
   * @param min The minimum
   * @param v The value to clamp. The units of this vector will be used for the result.
   * @param max The maximum
   */
  export const clamp = (min: Vector3wUnits, v: Vector3wUnits, max: Vector3wUnits): Vector3wUnits => {
    const minConv = Vector3wUnits.toRawGranular(min, v.x.type, v.y.type, v.z.type);
    const maxConv = Vector3wUnits.toRawGranular(max, v.x.type, v.y.type, v.z.type);
    const vConv = Vector3wUnits.toRawGranular(v, v.x.type, v.y.type, v.z.type);

    const raw = RawVector3.clampVec(minConv, vConv, maxConv);
    return Vector3wUnits.fromRawGranular(raw, v.x.type, v.y.type, v.z.type);
  };

  export const length = (v: Vector3wUnits): Distance => {
    const raw = Distance.meters(RawVector3.length(Vector3wUnits.toRaw(v, 'meters')));
    return Distance.toType(raw, v.x.type);
  };
}



export namespace RotationwUnits {
  export type Type = 'euler' | 'axis-angle';

  export interface EulerwUnits {
    type: 'euler';
    x: Angle;
    y: Angle;
    z: Angle;
    order?: RawEuler.Order;
  }

  export namespace EulerwUnits {
    export const identity = (type: Angle.Type = Angle.Type.Radians): EulerwUnits => ({
      type: 'euler',
      x: Angle.toType(Angle.radians(0), type),
      y: Angle.toType(Angle.radians(0), type),
      z: Angle.toType(Angle.radians(0), type),
      order: 'yzx',
    });

    export const toRaw = (e: EulerwUnits) => RawEuler.create(
      Angle.toType(e.x, Angle.Type.Radians).value,
      Angle.toType(e.y, Angle.Type.Radians).value,
      Angle.toType(e.z, Angle.Type.Radians).value,
      e.order || 'yzx'
    );

    export const fromRaw = (raw: RawEuler): EulerwUnits => ({
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
    axis: Vector3wUnits;
  }

  export namespace AxisAngle {
    export const identity = (angleType: Angle.Type = Angle.Type.Degrees, axisType: Distance.Type = 'meters'): AxisAngle => {
      const angle = Angle.toType(Angle.radians(0), angleType);
      const axis = Vector3wUnits.zero(axisType);
      return {
        type: 'axis-angle',
        angle,
        axis,
      };
    };

    export const toRaw = (a: AxisAngle) => RawAxisAngle.create(
      Angle.toType(a.angle, Angle.Type.Radians).value,
      Vector3wUnits.toRaw(a.axis, 'meters')
    );

    export const fromRaw = (raw: RawAxisAngle): AxisAngle => {
      const angle = Angle.radians(raw.angle);
      const axis = Vector3wUnits.fromRaw(raw.axis, 'meters');
      return {
        type: 'axis-angle',
        angle,
        axis,
      };
    };
  }

  export const axisAngle = (axis: Vector3wUnits, angle: Angle): AxisAngle => ({
    type: 'axis-angle',
    angle: angle || Angle.ZERO_RADIANS,
    axis: axis || Vector3wUnits.ZERO_METERS,
  });

  export const euler = (x: Angle, y: Angle, z: Angle, order?: RawEuler.Order): EulerwUnits => ({
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

  export const toRawQuaternion = (rotation: RotationwUnits) => {
    if (!rotation) return RawQuaternion.IDENTITY;
    switch (rotation.type) {
      case 'euler': return RawEuler.toQuaternion(EulerwUnits.toRaw(rotation));
      case 'axis-angle': return RawAxisAngle.toQuaternion(AxisAngle.toRaw(rotation));
    }
  };

  export const toType = (rotation: RotationwUnits, type: Type): RotationwUnits => {
    switch (type) {
      case 'euler': return EulerwUnits.fromRaw(RawEuler.fromQuaternion(toRawQuaternion(rotation)));
      case 'axis-angle': return AxisAngle.fromRaw(RawAxisAngle.fromQuaternion(toRawQuaternion(rotation)));
    }
  };

  export const fromRawQuaternion = (q: RawQuaternion, type: Type): RotationwUnits => {
    switch (type) {
      case 'euler': return EulerwUnits.fromRaw(RawEuler.fromQuaternion(q));
      case 'axis-angle': return AxisAngle.fromRaw(RawAxisAngle.fromQuaternion(q));
    }
  };

  export const angle = (lhs: RotationwUnits, rhs: RotationwUnits): Angle => Angle.radians(RawQuaternion.angle(toRawQuaternion(lhs), toRawQuaternion(rhs)));
  export const slerp = (lhs: RotationwUnits, rhs: RotationwUnits, t: number, newType: Type = 'euler'): RotationwUnits => fromRawQuaternion(RawQuaternion.slerp(toRawQuaternion(lhs), toRawQuaternion(rhs), t), newType);
}

export type RotationwUnits = RotationwUnits.EulerwUnits | RotationwUnits.AxisAngle;

export interface ReferenceFramewUnits {
  position?: Vector3wUnits;
  orientation?: RotationwUnits;
  scale?: RawVector3;
}

export namespace ReferenceFramewUnits {
  export const IDENTITY: ReferenceFramewUnits = {
    position: Vector3wUnits.zero(),
    orientation: RotationwUnits.EulerwUnits.identity(),
    scale: RawVector3.ONE,
  };

  export const create = (position?: Vector3wUnits, orientation?: RotationwUnits, scale: RawVector3 = RawVector3.ONE): ReferenceFramewUnits => ({
    position,
    orientation,
    scale
  });

  export const toRaw = (frame: ReferenceFramewUnits, distanceType: Distance.Type = 'meters') => {
    return RawReferenceFrame.create(
      Vector3wUnits.toRaw(frame.position || Vector3wUnits.zero('meters'), distanceType),
      RotationwUnits.toRawQuaternion(frame.orientation || RotationwUnits.EulerwUnits.identity()),
      frame.scale || RawVector3.ONE
    );
  };

  export const toBabylon = (frame: ReferenceFramewUnits, distanceType: Distance.Type = 'meters') =>
    RawReferenceFrame.toBabylon(toRaw(frame || IDENTITY, distanceType));

  export const syncBabylon = (frame: ReferenceFramewUnits, bNode: BabylonTransformNode | BabylonAbstractMesh, distanceType: Distance.Type = 'meters') => {
    RawReferenceFrame.syncBabylon(toRaw(frame, distanceType), bNode);
  };
}