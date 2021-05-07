export interface Vector2 {
  x: number;
  y: number;
}

export namespace Vector2 {
  export const x = (vec: Vector2) => vec ? vec.x : 0;
  export const y = (vec: Vector2) => vec ? vec.y : 0;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);