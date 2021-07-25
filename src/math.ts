import * as Babylon from 'babylonjs';

export interface Vector2 {
  x: number;
  y: number;
}

export const TAU = Math.PI * 2;

export namespace Vector2 {
  export const ZERO: Vector2 = { x: 0, y: 0 };

  export const X: Vector2 = { x: 1, y: 0 };
  export const Y: Vector2 = { x: 0, y: 1 };
  export const NEGATIVE_X: Vector2 = { x: -1, y: 0 };
  export const NEGATIVE_Y: Vector2 = { x: 0, y: -1 };

  export const create = (x: number, y: number): Vector2 => ({ x, y });

  export const x = (vec: Vector2) => (vec ? vec.x : 0);
  export const y = (vec: Vector2) => (vec ? vec.y : 0);

  export const eq = (lhs: Vector2, rhs: Vector2) => lhs.x === rhs.x && lhs.y === rhs.y;
  export const neq = (lhs: Vector2, rhs: Vector2) => lhs.x !== rhs.x || lhs.y !== rhs.y;

  export const add = (l: Vector2, r: Vector2): Vector2 => ({
    x: l.x + r.x,
    y: l.y + r.y
  });

  export const subtract = (l: Vector2, r: Vector2): Vector2 => ({
    x: l.x - r.x,
    y: l.y - r.y
  });

  export const fromClient = <T extends { clientX: number, clientY: number }>(obj: T): Vector2 => ({
    x: obj.clientX,
    y: obj.clientY
  });

  export const fromTopLeft = <T extends { top: number, left: number }>(obj: T): Vector2 => ({
    x: obj.left,
    y: obj.top
  });

  export const fromX = (x: number): Vector2 => ({ x, y: 0 });
  export const fromY = (y: number): Vector2 => ({ x: 0, y });

  export const distance = (l: Vector2, r: Vector2) => Math.sqrt(Math.pow(r.x - l.x, 2) + Math.pow(r.y - l.y, 2));
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export namespace Vector3 {
  export const ZERO: Vector3 = { x: 0, y: 0, z: 0 };

  export const X: Vector3 = { x: 1, y: 0, z: 0 };
  export const Y: Vector3 = { x: 0, y: 1, z: 0 };
  export const Z: Vector3 = { x: 0, y: 0, z: 1 };
  export const NEGATIVE_X: Vector3 = { x: -1, y: 0, z: 0 };
  export const NEGATIVE_Y: Vector3 = { x: 0, y: -1, z: 0 };
  export const NEGATIVE_Z: Vector3 = { x: 0, y: 0, z: -1 };

  export const create = (x: number, y: number, z: number): Vector3 => ({ x, y, z });
  export const x = (vec: Vector3) => (vec ? vec.x : 0);
  export const y = (vec: Vector3) => (vec ? vec.y : 0);
  export const z = (vec: Vector3) => (vec ? vec.z : 0);
  export const eq = (lhs: Vector3, rhs: Vector3) => lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z;
  export const neq = (lhs: Vector3, rhs: Vector3) => lhs.x !== rhs.x || lhs.y !== rhs.y || lhs.z !== rhs.z;
  export const add = (l: Vector3, r: Vector3): Vector3 => ({
    x: l.x + r.x,
    y: l.y + r.y,
    z: l.z + r.z
  });
  export const subtract = (l: Vector3, r: Vector3): Vector3 => ({
    x: l.x - r.x,
    y: l.y - r.y,
    z: l.z - r.z
  });
  export const multiply = (l: Vector3, r: number): Vector3 => ({
    x: l.x * r,
    y: l.y * r,
    z: l.z * r
  });
  export const multiplyScalar = (vec: Vector3, scalar: number): Vector3 => ({
    x: vec.x * scalar,
    y: vec.y * scalar,
    z: vec.z * scalar
  });
  export const divideScalar = (vec: Vector3, scalar: number): Vector3 => ({
    x: vec.x / scalar,
    y: vec.y / scalar,
    z: vec.z / scalar
  });
  export const length = (vec: Vector3): number => Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2) + Math.pow(vec.z, 2));

  export const toBabylon = (vec: Vector3): Babylon.Vector3 => new Babylon.Vector3(vec.x, vec.y, vec.z);
  export const fromBabylon = (vec: Babylon.Vector3): Vector3 => ({ x: vec.x, y: vec.y, z: vec.z });
}

export interface Euler {
  x: number;
  y: number;
  z: number;
  order?: Euler.Order;
}

export namespace Euler {
  export type Order = 'xyz' | 'xzy' | 'yxz' | 'yzx' | 'zxy' | 'zyx';

  export const IDENTITY: Euler = { x: 0, y: 0, z: 0, order: 'xyz' };

  export const create = (x: number, y: number, z: number, order?: Euler.Order): Euler => ({ x, y, z, order });

  export const fromQuaternion = (q: Quaternion): Euler => {
    const x = Math.atan2(2 * (q.w * q.x + q.y * q.z), 1 - 2 * (q.x * q.x + q.y * q.y));
    const y = Math.asin(2 * (q.w * q.y - q.z * q.x));
    const z = Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z));
    return { x, y, z, order: 'xyz' };
  };

  export const toQuaternion = (euler: Euler): Quaternion => {
    const x = euler.x * 0.5;
    const y = euler.y * 0.5;
    const z = euler.z * 0.5;
    const order = euler.order || 'xyz';

    const cos = Math.cos;
    const sin = Math.sin;

    const q = {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    };

    switch (order) {
      case 'xyz':
        q.x = cos(x) * cos(y) * cos(z) - sin(x) * sin(y) * sin(z);
        q.y = sin(x) * cos(y) * cos(z) + cos(x) * sin(y) * sin(z);
        q.z = cos(x) * sin(y) * cos(z) - cos(y) * sin(x) * sin(z);
        q.w = cos(x) * cos(y) * sin(z) + cos(z) * sin(x) * sin(y);
        break;
      case 'xzy':
        q.x = cos(x) * cos(y) * cos(z) - sin(x) * sin(z) * sin(y);
        q.y = sin(x) * cos(y) * cos(z) + cos(x) * sin(z) * sin(y);
        q.z = cos(x) * sin(y) * cos(z) - cos(y) * sin(x) * sin(z);
        q.w = cos(x) * cos(y) * sin(z) + cos(z) * sin(x) * sin(y);
        break;
      case 'yxz':
        q.x = cos(y) * cos(x) * cos(z) - sin(y) * sin(z) * sin(x);
        q.y = sin(y) * cos(x) * cos(z) + cos(y) * sin(z) * sin(x);
        q.z = cos(y) * sin(x) * cos(z) - cos(x) * sin(y) * sin(z);
        q.w = cos(y) * cos(x) * sin(z) + cos(z) * sin(x) * sin(y);
        break;
      case 'yzx':
        q.x = cos(y) * cos(z) * cos(x) - sin(y) * sin(x) * sin(z);
        q.y = sin(y) * cos(z) * cos(x) + cos(y) * sin(x) * sin(z);
        q.z = cos(y) * sin(z) * cos(x) - cos(z) * sin(x) * sin(y);
        q.w = cos(y) * cos(z) * sin(x) + cos(x) * sin(y) * sin(z);
        break;
      case 'zxy':
        q.x = cos(z) * cos(x) * cos(y) - sin(z) * sin(y) * sin(x);
        q.y = sin(z) * cos(x) * cos(y) + cos(z) * sin(y) * sin(x);
        q.z = cos(z) * sin(x) * cos(y) - cos(x) * sin(z) * sin(y);
        q.w = cos(z) * cos(x) * sin(y) + cos(y) * sin(x) * sin(z);
        break;
      case 'zyx':
        q.x = cos(z) * cos(y) * cos(x) - sin(z) * sin(x) * sin(y);
        q.y = sin(z) * cos(y) * cos(x) + cos(z) * sin(x) * sin(y);
        q.z = cos(z) * sin(y) * cos(x) - cos(y) * sin(x) * sin(z);
        q.w = cos(z) * cos(y) * sin(x) + cos(x) * sin(y) * sin(z);
        break;
      case 'zxy':
        q.x = cos(z) * cos(y) * cos(x) - sin(z) * sin(x) * sin(y);
        q.y = sin(z) * cos(y) * cos(x) + cos(z) * sin(x) * sin(y);
        q.z = cos(z) * sin(y) * cos(x) - cos(y) * sin(x) * sin(z);
        q.w = cos(z) * cos(y) * sin(x) + cos(x) * sin(y) * sin(z);
        break;
      default:
        throw new Error('Invalid order: ' + order);
    }
    return q;
  };
}

export interface AngleAxis {
  angle: number;
  axis: Vector3;
}

export namespace AngleAxis {
  export const fromQuaternion = (q: Quaternion): AngleAxis => {
    const angle = 2 * Math.acos(q.w);
    const s = Math.sqrt(1 - q.w * q.w);
    if (s < 0.0001) {
      return {
        angle,
        axis: Vector3.create(1, 0, 0)
      };
    }
    return {
      angle,
      axis: Vector3.create(q.x / s, q.y / s, q.z / s)
    };
  };

  export const fromEuler = (euler: Euler): AngleAxis => {
    const q = Euler.toQuaternion(euler);
    return fromQuaternion(q);
  };

  export const toQuaternion = (angleAxis: AngleAxis): Quaternion => {
    const { angle, axis } = angleAxis;
    const s = Math.sin(angle / 2);
    const c = Math.cos(angle / 2);
    return Quaternion.create(axis.x * s, axis.y * s, axis.z * s, c);
  };

  export const create = (angle: number, axis: Vector3): AngleAxis => ({
    angle,
    axis
  });
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export namespace Quaternion {
  export const IDENTITY: Quaternion = { x: 0, y: 0, z: 0, w: 1 };

  export const create = (x: number, y: number, z: number, w: number): Quaternion => ({ x, y, z, w });
  export const x = (quat: Quaternion) => (quat ? quat.x : 0);
  export const y = (quat: Quaternion) => (quat ? quat.y : 0);
  export const z = (quat: Quaternion) => (quat ? quat.z : 0);
  export const w = (quat: Quaternion) => (quat ? quat.w : 0);
  export const eq = (lhs: Quaternion, rhs: Quaternion) => lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z && lhs.w === rhs.w;
  export const neq = (lhs: Quaternion, rhs: Quaternion) => lhs.x !== rhs.x || lhs.y !== rhs.y || lhs.z !== rhs.z || lhs.w !== rhs.w;
  export const multiply = (lhs: Quaternion, rhs: Quaternion): Quaternion => {
    const x = lhs.x * rhs.w + lhs.y * rhs.z - lhs.z * rhs.y + lhs.w * rhs.x;
    const y = lhs.w * rhs.x + lhs.z * rhs.y + lhs.x * rhs.z - lhs.y * rhs.w;
    const z = lhs.y * rhs.w + lhs.x * rhs.z + lhs.z * rhs.x - lhs.w * rhs.y;
    const w = lhs.w * rhs.w - lhs.x * rhs.x - lhs.y * rhs.y - lhs.z * rhs.z;
    return { x, y, z, w };
  };
  export const length = (quat: Quaternion): number => Math.sqrt(Math.pow(quat.x, 2) + Math.pow(quat.y, 2) + Math.pow(quat.z, 2) + Math.pow(quat.w, 2));
  export const normalize = (quat: Quaternion): Quaternion => {
    const l = length(quat);
    return {
      x: quat.x / l,
      y: quat.y / l,
      z: quat.z / l,
      w: quat.w / l
    };
  }

  export const toBabylon = (quat: Quaternion): Babylon.Quaternion => new Babylon.Quaternion(quat.x, quat.y, quat.z, quat.w);
  export const fromBabylon = (quat: Babylon.Quaternion): Quaternion => ({
    x: quat.x,
    y: quat.y,
    z: quat.z,
    w: quat.w
  });
}

export interface ReferenceFrame {
  position?: Vector3;
  orientation?: Quaternion;
}

export namespace ReferenceFrame {
  export const IDENTITY: ReferenceFrame = {
    position: Vector3.ZERO,
    orientation: Quaternion.IDENTITY
  };

  export const create = (position: Vector3, orientation: Quaternion): ReferenceFrame => ({ position, orientation });
  export const position = (frame: ReferenceFrame) => (frame ? (frame.position ? frame.position : Vector3.ZERO) : Vector3.ZERO);
  export const orientation = (frame: ReferenceFrame) => (frame ? (frame.orientation ? frame.orientation : Quaternion.IDENTITY) : Quaternion.IDENTITY);

  export const fill = (frame: ReferenceFrame): ReferenceFrame => ({
    position: frame.position || Vector3.ZERO,
    orientation: frame.orientation || Quaternion.IDENTITY
  });
}

export const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);

export interface Rectangle {
  topLeft: Vector2;
  bottomRight: Vector2;
}

export namespace Rectangle {
  export const create = (topLeft: Vector2, bottomRight: Vector2): Rectangle => ({
    topLeft,
    bottomRight
  });

  export const topLeft = (rect: Rectangle) => rect.topLeft;
  export const bottomRight = (rect: Rectangle) => rect.bottomRight;

  export const top = (rect: Rectangle) => rect.topLeft.y;
  export const left = (rect: Rectangle) => rect.topLeft.x;
  export const bottom = (rect: Rectangle) => rect.bottomRight.y;
  export const right = (rect: Rectangle) => rect.bottomRight.x;

  export const width = (rect: Rectangle) => rect.bottomRight.x - rect.topLeft.x;
  export const height = (rect: Rectangle) => rect.bottomRight.y - rect.topLeft.y;

  export const topRight = (rect: Rectangle): Vector2 => ({
    x: rect.bottomRight.x,
    y: rect.topLeft.y
  });

  export const bottomLeft = (rect: Rectangle): Vector2 => ({
    x: rect.topLeft.x,
    y: rect.bottomRight.y
  });

  export const center = (rect: Rectangle): Vector2 => ({
    x: (rect.topLeft.x + rect.bottomRight.x) / 2,
    y: (rect.topLeft.y + rect.bottomRight.y) / 2
  });

  export const contains = (rect: Rectangle, point: Vector2): boolean => {
    return point.x >= rect.topLeft.x && point.x <= rect.bottomRight.x && point.y >= rect.topLeft.y && point.y <= rect.bottomRight.y;
  };

  export const fromBoundingRect = <T extends { top: number; left: number; bottom: number; right: number }>(obj: T): Rectangle => ({
    topLeft: { x: obj.left, y: obj.top },
    bottomRight: { x: obj.right, y: obj.bottom }
  });

  export const grow = (rect: Rectangle, amount: number): Rectangle => ({
    topLeft: {
      x: rect.topLeft.x - amount / 2,
      y: rect.topLeft.y - amount / 2
    },
    bottomRight: {
      x: rect.bottomRight.x + amount / 2,
      y: rect.bottomRight.y + amount / 2
    }
  });

  export const shrink = (rect: Rectangle, amount: number): Rectangle => ({
    topLeft: {
      x: rect.topLeft.x + amount / 2,
      y: rect.topLeft.y + amount / 2
    },
    bottomRight: {
      x: rect.bottomRight.x - amount / 2,
      y: rect.bottomRight.y - amount / 2
    }
  });
}