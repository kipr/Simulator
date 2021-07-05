import { Vector2 } from "./math";

export interface Box2 {
  topLeft: Vector2,
  bottomRight: Vector2
}

export namespace Box2 {
  export const ZERO: Box2 = {
    topLeft: Vector2.ZERO,
    bottomRight: Vector2.ZERO
  };

  export const create = (topLeft: Vector2, bottomRight: Vector2): Box2 => ({ topLeft, bottomRight });

  export const translate = (delta: Vector2, box2: Box2): Box2 => ({
    topLeft: Vector2.add(delta, box2.topLeft),
    bottomRight: Vector2.add(delta, box2.bottomRight),
  });

  export const width = (box2: Box2): number => box2.bottomRight.x - box2.topLeft.x;
  export const height = (box2: Box2): number => box2.bottomRight.y - box2.topLeft.y;
}