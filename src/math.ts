export interface Vector2 {
  x: number;
  y: number;
}

export const TAU = Math.PI * 2;

export namespace Vector2 {
  export const ZERO: Vector2 = { x: 0, y: 0 };

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