import { RawVector2 } from "./math";

/**
 * A box in 2D space, defined by a top-left and bottom-right corner.
 */
export interface Box2 {
  topLeft: RawVector2,
  bottomRight: RawVector2
}

/**
 * Namespace for operations to create or manipulate Box2 objects.
 */
export namespace Box2 {
  export const ZERO: Box2 = {
    topLeft: RawVector2.ZERO,
    bottomRight: RawVector2.ZERO
  };

  export const create = (topLeft: RawVector2, bottomRight: RawVector2): Box2 => ({ topLeft, bottomRight });

  export const translate = (delta: RawVector2, box2: Box2): Box2 => ({
    topLeft: RawVector2.add(delta, box2.topLeft),
    bottomRight: RawVector2.add(delta, box2.bottomRight),
  });

  export const width = (box2: Box2): number => box2.bottomRight.x - box2.topLeft.x;
  export const height = (box2: Box2): number => box2.bottomRight.y - box2.topLeft.y;
}