// Raw math types means they have no units
import { Vector3 as BabylonVector3, Quaternion as BabylonQuaternion } from '@babylonjs/core/Maths/math.vector';
import { TransformNode as BabylonTransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

export interface RawVector2 {
  x: number;
  y: number;
}

export const TAU = Math.PI * 2;

export namespace RawVector2 {
  export const ZERO: RawVector2 = { x: 0, y: 0 };

  export const X: RawVector2 = { x: 1, y: 0 };
  export const Y: RawVector2 = { x: 0, y: 1 };
  export const NEGATIVE_X: RawVector2 = { x: -1, y: 0 };
  export const NEGATIVE_Y: RawVector2 = { x: 0, y: -1 };

  export const create = (x: number, y: number): RawVector2 => ({ x, y });

  export const x = (vec: RawVector2) => (vec ? vec.x : 0);
  export const y = (vec: RawVector2) => (vec ? vec.y : 0);

  export const eq = (lhs: RawVector2, rhs: RawVector2) => lhs.x === rhs.x && lhs.y === rhs.y;
  export const neq = (lhs: RawVector2, rhs: RawVector2) => lhs.x !== rhs.x || lhs.y !== rhs.y;

  export const add = (l: RawVector2, r: RawVector2): RawVector2 => ({
    x: l.x + r.x,
    y: l.y + r.y
  });

  export const subtract = (l: RawVector2, r: RawVector2): RawVector2 => ({
    x: l.x - r.x,
    y: l.y - r.y
  });

  export const fromClient = <T extends { clientX: number, clientY: number }>(obj: T): RawVector2 => ({
    x: obj.clientX,
    y: obj.clientY
  });

  export const fromTopLeft = <T extends { top: number, left: number }>(obj: T): RawVector2 => ({
    x: obj.left,
    y: obj.top
  });

  export const fromWidthHeight = <T extends { width: number, height: number }>(obj: T): RawVector2 => ({
    x: obj.width,
    y: obj.height
  });

  export const fromX = (x: number): RawVector2 => ({ x, y: 0 });
  export const fromY = (y: number): RawVector2 => ({ x: 0, y });

  export const distance = (l: RawVector2, r: RawVector2) => Math.sqrt(Math.pow(r.x - l.x, 2) + Math.pow(r.y - l.y, 2));
}

export interface RawVector3 {
  x: number;
  y: number;
  z: number;
}

export namespace RawVector3 {
  export const ZERO: RawVector3 = { x: 0, y: 0, z: 0 };
  export const ONE: RawVector3 = { x: 1, y: 1, z: 1 };

  export const X: RawVector3 = { x: 1, y: 0, z: 0 };
  export const Y: RawVector3 = { x: 0, y: 1, z: 0 };
  export const Z: RawVector3 = { x: 0, y: 0, z: 1 };
  export const NEGATIVE_X: RawVector3 = { x: -1, y: 0, z: 0 };
  export const NEGATIVE_Y: RawVector3 = { x: 0, y: -1, z: 0 };
  export const NEGATIVE_Z: RawVector3 = { x: 0, y: 0, z: -1 };

  export const create = (x: number, y: number, z: number): RawVector3 => ({ x, y, z });
  export const x = (vec: RawVector3) => (vec ? vec.x : 0);
  export const y = (vec: RawVector3) => (vec ? vec.y : 0);
  export const z = (vec: RawVector3) => (vec ? vec.z : 0);
  export const eq = (lhs: RawVector3, rhs: RawVector3) => lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z;
  export const neq = (lhs: RawVector3, rhs: RawVector3) => lhs.x !== rhs.x || lhs.y !== rhs.y || lhs.z !== rhs.z;
  export const add = (l: RawVector3, r: RawVector3): RawVector3 => ({
    x: l.x + r.x,
    y: l.y + r.y,
    z: l.z + r.z
  });
  export const subtract = (l: RawVector3, r: RawVector3): RawVector3 => ({
    x: l.x - r.x,
    y: l.y - r.y,
    z: l.z - r.z
  });
  export const multiply = (l: RawVector3, r: RawVector3): RawVector3 => ({
    x: l.x * r.x,
    y: l.y * r.y,
    z: l.z * r.z
  });

  export const cross = (l: RawVector3, r: RawVector3): RawVector3 => ({
    x: l.y * r.z - l.z * r.y,
    y: l.z * r.x - l.x * r.z,
    z: l.x * r.y - l.y * r.x
  });

  export const multiplyScalar = (vec: RawVector3, scalar: number): RawVector3 => ({
    x: vec.x * scalar,
    y: vec.y * scalar,
    z: vec.z * scalar
  });
  export const divideScalar = (vec: RawVector3, scalar: number): RawVector3 => ({
    x: vec.x / scalar,
    y: vec.y / scalar,
    z: vec.z / scalar
  });

  export const lengthSquared = (vec: RawVector3) => vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
  export const length = (vec: RawVector3): number => Math.sqrt(lengthSquared(vec));

  export const toBabylon = (vec: RawVector3): BabylonVector3 => new BabylonVector3(vec.x, vec.y, vec.z);
  export const fromBabylon = (vec: BabylonVector3): RawVector3 => ({ x: vec.x, y: vec.y, z: vec.z });

  export const distance = (lhs: RawVector3, rhs: RawVector3): number => Math.sqrt(Math.pow(rhs.x - lhs.x, 2) + Math.pow(rhs.y - lhs.y, 2) + Math.pow(rhs.z - lhs.z, 2));

  export const dot = (lhs: RawVector3, rhs: RawVector3): number => lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;


  export const normalize = (vec: RawVector3) => divideScalar(vec, length(vec));

  export const applyQuaternion = (v: RawVector3, q: RawQuaternion): RawVector3 => {
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

  export const project = (lhs: RawVector3, rhs: RawVector3): RawVector3 => {
    const dot = RawVector3.dot(lhs, rhs);
    const lengthSquared = RawVector3.lengthSquared(rhs);
    return RawVector3.multiplyScalar(rhs, dot / lengthSquared);
  };

  export const applyQuaternionTwist = (v: RawVector3, q: RawQuaternion): { swing: RawVector3, twist: RawQuaternion } => {
    const swing = applyQuaternion(v, q);
    const twist = RawQuaternion.multiply(q, RawQuaternion.fromVector3(swing));
    return { swing, twist };
  };

  export const rotate = (v: RawVector3, orientation: RawQuaternion): RawVector3 => {
    const q = RawQuaternion.multiply(orientation, RawQuaternion.fromVector3(v));
    return applyQuaternion(v, q);
  };

  export const angle = (lhs: RawVector3, rhs: RawVector3): number => {
    const dot = RawVector3.dot(lhs, rhs);
    const length = RawVector3.length(lhs) * RawVector3.length(rhs);
    return Math.acos(dot / length);
  };

  export const clampVec = (min: RawVector3, v: RawVector3, max: RawVector3): RawVector3 => ({
    x: clamp(min.x, v.x, max.x),
    y: clamp(min.y, v.y, max.y),
    z: clamp(min.z, v.z, max.z)
  });
    
}

export interface RawEuler {
  x: number;
  y: number;
  z: number;
  order?: RawEuler.Order;
}

export namespace RawEuler {
  export type Order = 'xyz' | 'xzy' | 'yxz' | 'yzx' | 'zxy' | 'zyx';

  export const IDENTITY: RawEuler = { x: 0, y: 0, z: 0, order: 'yzx' };

  export const create = (x: number, y: number, z: number, order?: RawEuler.Order): RawEuler => ({ x, y, z, order });

  export const fromQuaternion = (q: RawQuaternion): RawEuler => {
    // I'm cheating here... FIXME.
    const q1 = new BabylonQuaternion(q.x, q.y, q.z, q.w);
    const e = q1.toEulerAngles();
    return { x: e.x, y: e.y, z: e.z, order: 'yzx' };
  };

  export const toQuaternion = (euler: RawEuler): RawQuaternion => {
    return RawQuaternion.fromBabylon(BabylonQuaternion.FromEulerAngles(euler.x, euler.y, euler.z));
  };
}

export interface RawAxisAngle {
  angle: number;
  axis: RawVector3;
}

export namespace RawAxisAngle {
  export const fromQuaternion = (q: RawQuaternion): RawAxisAngle => {
    let s = Math.sqrt(1 - q.w * q.w);
    const angle = 2 * Math.atan2(s, Math.abs(q.w));
    if (s < 0.0001) {
      return {
        angle: 0,
        axis: RawVector3.create(1, 0, 0)
      };
    }
    if (q.w < 0) s = -s;
    return {
      angle,
      axis: RawVector3.create(q.x / s, q.y / s, q.z / s)
    };
  };

  export const fromEuler = (euler: RawEuler): RawAxisAngle => {
    const q = RawEuler.toQuaternion(euler); 
    return fromQuaternion(q);
  };

  export const toQuaternion = (angleAxis: RawAxisAngle): RawQuaternion => {
    const { angle, axis } = angleAxis;
    const normalizedAxis = RawVector3.normalize(axis);
    const s = Math.sin(angle / 2);
    const c = Math.cos(angle / 2);
    return RawQuaternion.create(normalizedAxis.x * s, normalizedAxis.y * s, normalizedAxis.z * s, c);
  };

  export const multiply = (a: RawAxisAngle, b: RawAxisAngle): RawAxisAngle => {
    return fromQuaternion(RawQuaternion.multiply(toQuaternion(a), toQuaternion(b)));
  };

  export const create = (angle: number, axis: RawVector3): RawAxisAngle => ({
    angle,
    axis
  });
}

export interface RawQuaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export namespace RawQuaternion {
  export const IDENTITY: RawQuaternion = { x: 0, y: 0, z: 0, w: 1 };

  export const create = (x: number, y: number, z: number, w: number): RawQuaternion => ({ x, y, z, w });
  export const x = (quat: RawQuaternion) => (quat ? quat.x : 0);
  export const y = (quat: RawQuaternion) => (quat ? quat.y : 0);
  export const z = (quat: RawQuaternion) => (quat ? quat.z : 0);
  export const w = (quat: RawQuaternion) => (quat ? quat.w : 0);
  export const eq = (lhs: RawQuaternion, rhs: RawQuaternion) => lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z && lhs.w === rhs.w;
  export const neq = (lhs: RawQuaternion, rhs: RawQuaternion) => lhs.x !== rhs.x || lhs.y !== rhs.y || lhs.z !== rhs.z || lhs.w !== rhs.w;
  export const multiply = (lhs: RawQuaternion, rhs: RawQuaternion): RawQuaternion => {
    const x = lhs.x * rhs.w + lhs.y * rhs.z - lhs.z * rhs.y + lhs.w * rhs.x;
    const y = lhs.w * rhs.x + lhs.z * rhs.y + lhs.x * rhs.z - lhs.y * rhs.w;
    const z = lhs.y * rhs.w + lhs.x * rhs.z + lhs.z * rhs.x - lhs.w * rhs.y;
    const w = lhs.w * rhs.w - lhs.x * rhs.x - lhs.y * rhs.y - lhs.z * rhs.z;
    return { x, y, z, w };
  };
  export const length = (quat: RawQuaternion): number => Math.sqrt(Math.pow(quat.x, 2) + Math.pow(quat.y, 2) + Math.pow(quat.z, 2) + Math.pow(quat.w, 2));
  export const normalize = (quat: RawQuaternion): RawQuaternion => {
    const l = length(quat);
    return {
      x: quat.x / l,
      y: quat.y / l,
      z: quat.z / l,
      w: quat.w / l
    };
  };

  export const toBabylon = (quat: RawQuaternion): BabylonQuaternion => new BabylonQuaternion(quat.x, quat.y, quat.z, quat.w);
  export const fromBabylon = (quat: BabylonQuaternion): RawQuaternion => ({
    x: quat.x,
    y: quat.y,
    z: quat.z,
    w: quat.w
  });

  export const dot = (lhs: RawQuaternion, rhs: RawQuaternion): number => lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z + lhs.w * rhs.w;

  export const angle = (lhs: RawQuaternion, rhs: RawQuaternion) => Math.acos(RawQuaternion.multiply(lhs, conjugate(rhs)).w) * 2;

  export const signedAngle = (lhs: RawQuaternion, rhs: RawQuaternion, axis: RawVector3) => {
    const q = RawQuaternion.multiply(lhs, inverse(rhs));
    const axisAngle = RawAxisAngle.fromQuaternion(q);
    if (RawVector3.angle(axisAngle.axis, axis) > Math.PI / 2) return -axisAngle.angle;
    return axisAngle.angle;
  };

  export const slerp = (lhs: RawQuaternion, rhs: RawQuaternion, t: number): RawQuaternion => {
    // We're going to cheat
    const q = BabylonQuaternion.Slerp(toBabylon(lhs), toBabylon(rhs), t);
    return fromBabylon(q);
  };

  export const axis = (quat: RawQuaternion): RawVector3 => ({
    x: quat.x,
    y: quat.y,
    z: quat.z
  });

  export const fromVector3 = (vec: RawVector3): RawQuaternion => ({ x: vec.x, y: vec.y, z: vec.z, w: 0 });

  export const inverse = (quat: RawQuaternion): RawQuaternion => {
    const l = length(quat);
    return {
      x: -quat.x / l,
      y: -quat.y / l,
      z: -quat.z / l,
      w: quat.w / l
    };
  };

  export const shortestArc = (from: RawVector3, to: RawVector3): RawQuaternion => {
    
    const s = Math.sqrt((1 + RawVector3.dot(from, to)) * 2);

    // from = -to
    if (s < 0.0001) {
      let axis = RawVector3.cross(RawVector3.X, from);
      if (RawVector3.length(axis) < 0.0001) {
        axis = RawVector3.cross(RawVector3.Y, from);
      }
      axis = RawVector3.normalize(axis);
      return RawAxisAngle.toQuaternion(RawAxisAngle.create(Math.PI, axis));
    }
    
    return normalize({
      ...RawVector3.divideScalar(RawVector3.cross(from, to), s),
      w: s / 2
    });
  };

  export const conjugate = (quat: RawQuaternion): RawQuaternion => ({
    x: -quat.x,
    y: -quat.y,
    z: -quat.z,
    w: quat.w
  });
}

export interface RawReferenceFrame {
  position?: RawVector3;
  orientation?: RawQuaternion;
  scale?: RawVector3;
}

export namespace RawReferenceFrame {
  export const IDENTITY: RawReferenceFrame = {
    position: RawVector3.ZERO,
    orientation: RawQuaternion.IDENTITY,
    scale: RawVector3.ONE
  };

  export const create = (position: RawVector3, orientation: RawQuaternion, scale: RawVector3 = RawVector3.ONE): RawReferenceFrame => ({ position, orientation, scale });
  export const position = (frame: RawReferenceFrame) => (frame ? (frame.position ? frame.position : RawVector3.ZERO) : RawVector3.ZERO);
  export const orientation = (frame: RawReferenceFrame) => (frame ? (frame.orientation ? frame.orientation : RawQuaternion.IDENTITY) : RawQuaternion.IDENTITY);
  export const scale = (frame: RawReferenceFrame) => (frame ?? {}).scale ?? RawVector3.ONE;

  export const fill = (frame: RawReferenceFrame): RawReferenceFrame => ({
    position: frame.position ?? RawVector3.ZERO,
    orientation: frame.orientation ?? RawQuaternion.IDENTITY,
    scale: frame.scale ?? RawVector3.ONE
  });

  export interface ToBabylon {
    position: BabylonVector3;
    rotationQuaternion: BabylonQuaternion;
    scaling: BabylonVector3;
  }

  export const toBabylon = (frame: RawReferenceFrame): ToBabylon => ({
    position: RawVector3.toBabylon(frame.position || RawVector3.ZERO),
    rotationQuaternion: RawQuaternion.toBabylon(frame.orientation),
    scaling: RawVector3.toBabylon(frame.scale || RawVector3.ONE)
  });

  export const syncBabylon = (frame: RawReferenceFrame, bNode: BabylonTransformNode | BabylonAbstractMesh) => {
    const bFrame = toBabylon(frame || IDENTITY);
    bNode.position = bFrame.position;
    bNode.rotationQuaternion = bFrame.rotationQuaternion;
    bNode.scaling.copyFrom(bFrame.scaling);
  };

  export const compose = (parent: RawReferenceFrame, child: RawReferenceFrame): RawReferenceFrame => ({
    position: RawVector3.add(parent.position || RawVector3.ZERO, RawVector3.applyQuaternion(child.position || RawVector3.ZERO, child.orientation)),
    orientation: RawQuaternion.normalize(RawQuaternion.multiply(parent.orientation || RawQuaternion.IDENTITY, child.orientation || RawQuaternion.IDENTITY)),
  });
}

export const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);

export interface Rectangle {
  topLeft: RawVector2;
  bottomRight: RawVector2;
}

export namespace Rectangle {
  export const create = (topLeft: RawVector2, bottomRight: RawVector2): Rectangle => ({
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

  export const topRight = (rect: Rectangle): RawVector2 => ({
    x: rect.bottomRight.x,
    y: rect.topLeft.y
  });

  export const bottomLeft = (rect: Rectangle): RawVector2 => ({
    x: rect.topLeft.x,
    y: rect.bottomRight.y
  });

  export const center = (rect: Rectangle): RawVector2 => ({
    x: (rect.topLeft.x + rect.bottomRight.x) / 2,
    y: (rect.topLeft.y + rect.bottomRight.y) / 2
  });

  export const contains = (rect: Rectangle, point: RawVector2): boolean => {
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