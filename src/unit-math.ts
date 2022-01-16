// Contains math types that are tagged with units

import { Angle, Distance, Value } from './util/Value';

import {
  Euler as RawEuler,
  Vector2 as RawVector2,
  Vector3 as RawVector3,
  Quaternion as RawQuaternion,
  AngleAxis as RawAngleAxis,
  ReferenceFrame as RawReferenceFrame,
  Quaternion,
} from './math';

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

  export const one = (type: Distance.Type = 'meters'): Vector3 => ({
    x: Distance.toType(Distance.meters(1), type),
    y: Distance.toType(Distance.meters(1), type),
    z: Distance.toType(Distance.meters(1), type),
  });

  export const create = (x: Distance, y: Distance, z: Distance): Vector3 => ({ x, y, z });

  export const toRaw = (v: Vector3, type: Distance.Type) => RawVector3.create(
    Distance.toType(v.x, type).value,
    Distance.toType(v.y, type).value,
    Distance.toType(v.z, type).value
  );

  export const toBabylon = (v: Vector3, type: Distance.Type) => RawVector3.toBabylon(toRaw(v, type));

  export const fromRaw = (raw: RawVector3, type: Distance.Type) => ({
    x: { type, value: raw.x },
    y: { type, value: raw.y },
    z: { type, value: raw.z },
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

}



export namespace Rotation {
  export type Type = 'euler' | 'angle-axis';

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
  
  export interface AngleAxis {
    type: 'angle-axis';
    angle: Angle;
    axis: Vector3;
  }

  export namespace AngleAxis {
    export const identity = (angleType: Angle.Type = Angle.Type.Degrees, axisType: Distance.Type = 'meters'): AngleAxis => {
      const angle = Angle.toType(Angle.radians(0), angleType);
      const axis = Vector3.zero(axisType);
      return {
        type: 'angle-axis',
        angle,
        axis,
      };
    };

    export const toRaw = (a: AngleAxis) => RawAngleAxis.create(
      Angle.toType(a.angle, Angle.Type.Radians).value,
      Vector3.toRaw(a.axis, 'meters')
    );

    export const fromRaw = (raw: RawAngleAxis): AngleAxis => {
      const angle = Angle.radians(raw.angle);
      const axis = Vector3.fromRaw(raw.axis, 'meters');
      return {
        type: 'angle-axis',
        angle,
        axis,
      };
    };
  }

  export const angleAxis = (angle: Angle, axis: Vector3): AngleAxis => ({
    type: 'angle-axis',
    angle,
    axis
  });

  export const euler = (x: Angle, y: Angle, z: Angle, order?: RawEuler.Order): Euler => ({
    type: 'euler',
    x,
    y,
    z,
    order
  });

  export const toRawQuaternion = (rotation: Rotation) => {
    if (!rotation) return Quaternion.IDENTITY;
    switch (rotation.type) {
      case 'euler': return RawEuler.toQuaternion(Euler.toRaw(rotation));
      case 'angle-axis': return RawAngleAxis.toQuaternion(AngleAxis.toRaw(rotation));
    }
  };

  export const toType = (rotation: Rotation, type: Type): Rotation => {
    switch (type) {
      case 'euler': return Euler.fromRaw(RawEuler.fromQuaternion(toRawQuaternion(rotation)));
      case 'angle-axis': return AngleAxis.fromRaw(RawAngleAxis.fromQuaternion(toRawQuaternion(rotation)));
    }
  };

  export const fromRawQuaternion = (q: Quaternion, type: Type): Rotation => {
    switch (type) {
      case 'euler': return Euler.fromRaw(RawEuler.fromQuaternion(q));
      case 'angle-axis': return AngleAxis.fromRaw(RawAngleAxis.fromQuaternion(q));
    }
  };

  export const angle = (lhs: Rotation, rhs: Rotation): Angle => Angle.radians(Quaternion.angle(toRawQuaternion(lhs), toRawQuaternion(rhs)));
  export const slerp = (lhs: Rotation, rhs: Rotation, t: number, newType: Type = 'euler'): Rotation => fromRawQuaternion(Quaternion.slerp(toRawQuaternion(lhs), toRawQuaternion(rhs), t), newType);
}

export type Rotation = Rotation.Euler | Rotation.AngleAxis;

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

  export const create = (position?: Vector3, orientation?: Rotation): ReferenceFrame => ({
    position,
    orientation
  });

  export const toRaw = (frame: ReferenceFrame): RawReferenceFrame => {
    return RawReferenceFrame.create(
      Vector3.toRaw(frame.position, 'meters'),
      Rotation.toRawQuaternion(frame.orientation)
    );
  };

}