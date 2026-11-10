import { TORUS_SEGMENTS, torusCapsuleSegments } from '../../src/simulator/babylonBindings/torusCollider';

const ZERO = { x: 0, y: 0, z: 0 };
// ring.glb's bounding box, in centimeters.
const RING = { x: 5.417, y: 0.9132, z: 5.417 };

const radial = (p: { x: number; z: number }) => Math.hypot(p.x, p.z);

describe('torusCapsuleSegments', () => {
  it('returns a closed loop of segments', () => {
    const segments = torusCapsuleSegments(RING, ZERO);
    expect(segments).toHaveLength(TORUS_SEGMENTS);
    segments.forEach((segment, k) => {
      expect(segments[(k + 1) % segments.length].pointA).toEqual(segment.pointB);
    });
  });

  it('matches the ring geometry and keeps the hole size', () => {
    const segments = torusCapsuleSegments(RING, ZERO);
    for (const { pointA, pointB, radius } of segments) {
      expect(radius).toBeCloseTo(0.4566, 3);
      expect(radial(pointA)).toBeCloseTo(2.4374, 3);
      const midpoint = { x: (pointA.x + pointB.x) / 2, z: (pointA.z + pointB.z) / 2 };
      expect(radial(midpoint) - radius).toBeCloseTo(1.7953, 3);
    }
  });

  it('places every point at the center height and offsets by the center', () => {
    const center = { x: 1, y: -2, z: 3 };
    const centered = torusCapsuleSegments(RING, ZERO);
    const offset = torusCapsuleSegments(RING, center);
    offset.forEach((segment, k) => {
      for (const key of ['pointA', 'pointB'] as const) {
        expect(segment[key].y).toBe(center.y);
        expect(segment[key].x).toBeCloseTo(centered[k][key].x + center.x, 10);
        expect(segment[key].z).toBeCloseTo(centered[k][key].z + center.z, 10);
      }
    });
  });

  it('uses separate x and z radii for non-uniform scale', () => {
    const segments = torusCapsuleSegments({ x: 8, y: 1, z: 4 }, ZERO);
    const correction = 1 / Math.cos(Math.PI / TORUS_SEGMENTS);
    // Segment 0 starts at theta = 0 (on x); segment N/4 starts at theta = PI/2 (on z).
    expect(segments[0].pointA.x).toBeCloseTo(3.5 * correction, 10);
    expect(segments[TORUS_SEGMENTS / 4].pointA.z).toBeCloseTo(1.5 * correction, 10);
  });

  it.each([
    ['a disc whose hole would close', { x: 2, y: 1, z: 2 }],
    ['zero thickness', { x: 5, y: 0, z: 5 }],
    ['a ring standing on edge', { x: 5, y: 5, z: 1 }],
  ])('returns null for %s', (_, extents) => {
    expect(torusCapsuleSegments(extents, ZERO)).toBeNull();
  });
});
