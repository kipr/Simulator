import { Vector3 as BabylonVector3, Quaternion as BabylonQuaternion } from '@babylonjs/core/Maths/math.vector';
import { TransformNode as BabylonTransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

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

  export const fromWidthHeight = <T extends { width: number, height: number }>(obj: T): Vector2 => ({
    x: obj.width,
    y: obj.height
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
  export const ONE: Vector3 = { x: 1, y: 1, z: 1 };

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
  export const multiply = (l: Vector3, r: Vector3): Vector3 => ({
    x: l.x * r.x,
    y: l.y * r.y,
    z: l.z * r.z
  });

  export const cross = (l: Vector3, r: Vector3): Vector3 => ({
    x: l.y * r.z - l.z * r.y,
    y: l.z * r.x - l.x * r.z,
    z: l.x * r.y - l.y * r.x
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

  export const lengthSquared = (vec: Vector3) => vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
  export const length = (vec: Vector3): number => Math.sqrt(lengthSquared(vec));

  export const toBabylon = (vec: Vector3): BabylonVector3 => new BabylonVector3(vec.x, vec.y, vec.z);
  export const fromBabylon = (vec: BabylonVector3): Vector3 => ({ x: vec.x, y: vec.y, z: vec.z });

  export const distance = (lhs: Vector3, rhs: Vector3): number => Math.sqrt(Math.pow(rhs.x - lhs.x, 2) + Math.pow(rhs.y - lhs.y, 2) + Math.pow(rhs.z - lhs.z, 2));

  export const dot = (lhs: Vector3, rhs: Vector3): number => lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;


  export const normalize = (vec: Vector3) => divideScalar(vec, length(vec));

  export const applyQuaternion = (v: Vector3, q: Quaternion): Vector3 => {
    const ix = q.w * v.x + q.y * v.z - q.z * v.y;
    const iy = q.w * v.y + q.z * v.x - q.x * v.z;
    const iz = q.w * v.z + q.x * v.y - q.y * v.x;
    const iw = -q.x * v.x - q.y * v.y - q.z * v.z;

    return {
      x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
      y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
      z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x
    };
  };

  export const project = (lhs: Vector3, rhs: Vector3): Vector3 => {
    const dot = Vector3.dot(lhs, rhs);
    const lengthSquared = Vector3.lengthSquared(rhs);
    return Vector3.multiplyScalar(rhs, dot / lengthSquared);
  };

  export const applyQuaternionTwist = (v: Vector3, q: Quaternion): { swing: Vector3, twist: Quaternion } => {
    const swing = applyQuaternion(v, q);
    const twist = Quaternion.multiply(q, Quaternion.fromVector3(swing));
    return { swing, twist };
  };

  export const rotate = (v: Vector3, orientation: Quaternion): Vector3 => {
    const q = Quaternion.multiply(orientation, Quaternion.fromVector3(v));
    return applyQuaternion(v, q);
  };

  export const angle = (lhs: Vector3, rhs: Vector3): number => {
    const dot = Vector3.dot(lhs, rhs);
    const length = Vector3.length(lhs) * Vector3.length(rhs);
    return Math.acos(dot / length);
  };

  export const clampVec = (min: Vector3, v: Vector3, max: Vector3): Vector3 => ({
    x: clamp(min.x, v.x, max.x),
    y: clamp(min.y, v.y, max.y),
    z: clamp(min.z, v.z, max.z)
  });
    
}

export interface Euler {
  x: number;
  y: number;
  z: number;
  order?: Euler.Order;
}

export namespace Euler {
  export type Order = 'xyz' | 'xzy' | 'yxz' | 'yzx' | 'zxy' | 'zyx';

  export const IDENTITY: Euler = { x: 0, y: 0, z: 0, order: 'yzx' };

  export const create = (x: number, y: number, z: number, order?: Euler.Order): Euler => ({ x, y, z, order });

  export const fromQuaternion = (q: Quaternion): Euler => {
    // I'm cheating here... FIXME.
    const q1 = new BabylonQuaternion(q.x, q.y, q.z, q.w);
    const e = q1.toEulerAngles();
    return { x: e.x, y: e.y, z: e.z, order: 'yzx' };
  };

  export const toQuaternion = (euler: Euler): Quaternion => {
    return Quaternion.fromBabylon(BabylonQuaternion.FromEulerAngles(euler.x, euler.y, euler.z));
  };
}

export interface AxisAngle {
  angle: number;
  axis: Vector3;
}

export namespace AxisAngle {
  export const fromQuaternion = (q: Quaternion): AxisAngle => {
    let s = Math.sqrt(1 - q.w * q.w);
    const angle = 2 * Math.atan2(s, Math.abs(q.w));
    if (s < 0.0001) {
      return {
        angle: 0,
        axis: Vector3.create(1, 0, 0)
      };
    }
    if (q.w < 0) s = -s;
    return {
      angle,
      axis: Vector3.create(q.x / s, q.y / s, q.z / s)
    };
  };

  export const fromEuler = (euler: Euler): AxisAngle => {
    const q = Euler.toQuaternion(euler);
    return fromQuaternion(q);
  };

  export const toQuaternion = (angleAxis: AxisAngle): Quaternion => {
    const { angle, axis } = angleAxis;
    const normalizedAxis = Vector3.normalize(axis);
    const s = Math.sin(angle / 2);
    const c = Math.cos(angle / 2);
    return Quaternion.create(normalizedAxis.x * s, normalizedAxis.y * s, normalizedAxis.z * s, c);
  };

  export const multiply = (a: AxisAngle, b: AxisAngle): AxisAngle => {
    return fromQuaternion(Quaternion.multiply(toQuaternion(a), toQuaternion(b)));
  };

  export const create = (angle: number, axis: Vector3): AxisAngle => ({
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
  };

  export const toBabylon = (quat: Quaternion): BabylonQuaternion => new BabylonQuaternion(quat.x, quat.y, quat.z, quat.w);
  export const fromBabylon = (quat: BabylonQuaternion): Quaternion => ({
    x: quat.x,
    y: quat.y,
    z: quat.z,
    w: quat.w
  });

  export const dot = (lhs: Quaternion, rhs: Quaternion): number => lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z + lhs.w * rhs.w;

  export const angle = (lhs: Quaternion, rhs: Quaternion) => Math.acos(Quaternion.multiply(lhs, conjugate(rhs)).w) * 2;

  export const signedAngle = (lhs: Quaternion, rhs: Quaternion, axis: Vector3) => {
    const q = Quaternion.multiply(lhs, inverse(rhs));
    const axisAngle = AxisAngle.fromQuaternion(q);
    if (Vector3.angle(axisAngle.axis, axis) > Math.PI / 2) return -axisAngle.angle;
    return axisAngle.angle;
  };

  export const slerp = (lhs: Quaternion, rhs: Quaternion, t: number): Quaternion => {
    // We're going to cheat
    const q = BabylonQuaternion.Slerp(toBabylon(lhs), toBabylon(rhs), t);
    return fromBabylon(q);
  };

  export const axis = (quat: Quaternion): Vector3 => ({
    x: quat.x,
    y: quat.y,
    z: quat.z
  });

  export const fromVector3 = (vec: Vector3): Quaternion => ({ x: vec.x, y: vec.y, z: vec.z, w: 0 });

  export const inverse = (quat: Quaternion): Quaternion => {
    const l = length(quat);
    return {
      x: -quat.x / l,
      y: -quat.y / l,
      z: -quat.z / l,
      w: quat.w / l
    };
  };

  export const shortestArc = (from: Vector3, to: Vector3): Quaternion => {
    
    const s = Math.sqrt((1 + Vector3.dot(from, to)) * 2);

    // from = -to
    if (s < 0.0001) {
      let axis = Vector3.cross(Vector3.X, from);
      if (Vector3.length(axis) < 0.0001) {
        axis = Vector3.cross(Vector3.Y, from);
      }
      axis = Vector3.normalize(axis);
      return AxisAngle.toQuaternion(AxisAngle.create(Math.PI, axis));
    }
    
    return normalize({
      ...Vector3.divideScalar(Vector3.cross(from, to), s),
      w: s / 2
    });
  };

  export const conjugate = (quat: Quaternion): Quaternion => ({
    x: -quat.x,
    y: -quat.y,
    z: -quat.z,
    w: quat.w
  });
}

export interface ReferenceFrame {
  position?: Vector3;
  orientation?: Quaternion;
  scale?: Vector3;
}

export namespace ReferenceFrame {
  export const IDENTITY: ReferenceFrame = {
    position: Vector3.ZERO,
    orientation: Quaternion.IDENTITY,
    scale: Vector3.ONE
  };

  export const create = (position: Vector3, orientation: Quaternion, scale: Vector3 = Vector3.ONE): ReferenceFrame => ({ position, orientation, scale });
  export const position = (frame: ReferenceFrame) => (frame ? (frame.position ? frame.position : Vector3.ZERO) : Vector3.ZERO);
  export const orientation = (frame: ReferenceFrame) => (frame ? (frame.orientation ? frame.orientation : Quaternion.IDENTITY) : Quaternion.IDENTITY);
  export const scale = (frame: ReferenceFrame) => (frame ?? {}).scale ?? Vector3.ONE;

  export const fill = (frame: ReferenceFrame): ReferenceFrame => ({
    position: frame.position ?? Vector3.ZERO,
    orientation: frame.orientation ?? Quaternion.IDENTITY,
    scale: frame.scale ?? Vector3.ONE
  });

  export interface ToBabylon {
    position: BabylonVector3;
    rotationQuaternion: BabylonQuaternion;
    scaling: BabylonVector3;
  }

  export const toBabylon = (frame: ReferenceFrame): ToBabylon => ({
    position: Vector3.toBabylon(frame.position || Vector3.ZERO),
    rotationQuaternion: Quaternion.toBabylon(frame.orientation),
    scaling: Vector3.toBabylon(frame.scale || Vector3.ONE)
  });

  export const syncBabylon = (frame: ReferenceFrame, bNode: BabylonTransformNode | BabylonAbstractMesh) => {
    const bFrame = toBabylon(frame || IDENTITY);
    bNode.position = bFrame.position;
    bNode.rotationQuaternion = bFrame.rotationQuaternion;
    bNode.scaling.copyFrom(bFrame.scaling);
  };

  export const compose = (parent: ReferenceFrame, child: ReferenceFrame): ReferenceFrame => ({
    position: Vector3.add(parent.position || Vector3.ZERO, Vector3.applyQuaternion(child.position || Vector3.ZERO, child.orientation)),
    orientation: Quaternion.normalize(Quaternion.multiply(parent.orientation || Quaternion.IDENTITY, child.orientation || Quaternion.IDENTITY)),
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