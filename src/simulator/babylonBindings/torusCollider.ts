import { RawVector3 } from '../../util/math/math';

/** Eight capsules keep the ring hollow while limiting compound collision work. */
export const TORUS_SEGMENTS = 8;

export interface CapsuleSegment {
  pointA: RawVector3;
  pointB: RawVector3;
  radius: number;
}

/**
 * Build a closed loop of capsules that approximates a torus (a ring lying flat,
 * with its axis along local y), sized from the mesh's scaled bounding box.
 *
 * Returns `null` when the box isn't ring-shaped: no thickness, or a hole that
 * would close (the thin axis must be local y).
 *
 * @param extents Full size of the bounding box, already scaled and non-negative.
 * @param center Center of the bounding box, already scaled.
 * @param segments Number of capsules.
 */
export const torusCapsuleSegments = (
  extents: RawVector3,
  center: RawVector3,
  segments = TORUS_SEGMENTS,
): CapsuleSegment[] | null => {
  const r = extents.y / 2;
  const rx = extents.x / 2 - r;
  const rz = extents.z / 2 - r;
  if (!(r > 0) || !(rx > r) || !(rz > r) || segments < 3) return null;

  // A chord between two points on a circle of radius R comes in to
  // R * cos(PI / N) at its midpoint, which would shrink the hole. Pushing the
  // endpoints out to R / cos(PI / N) keeps the innermost point of each capsule
  // at the true hole radius R - r. The joints stick out a little at the outer
  // edge instead.
  const correction = 1 / Math.cos(Math.PI / segments);
  const rxOut = rx * correction;
  const rzOut = rz * correction;

  const points: RawVector3[] = [];
  for (let k = 0; k < segments; k++) {
    const theta = (2 * Math.PI * k) / segments;
    points.push({
      x: center.x + rxOut * Math.cos(theta),
      y: center.y,
      z: center.z + rzOut * Math.sin(theta),
    });
  }

  return points.map((pointA, k) => ({
    pointA,
    pointB: points[(k + 1) % segments],
    radius: r,
  }));
};
