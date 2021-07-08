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

  export const fromX = (x: number): Vector2 => ({ x, y: 0 });
  export const fromY = (y: number): Vector2 => ({ x: 0, y });
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);