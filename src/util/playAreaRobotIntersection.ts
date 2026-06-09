import { RawVector2 } from './math/math';

export interface MatLocalAabb {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Mat-local axis-aligned bounds from points (cm). */
export function matLocalAabbFromSamples(
  samples: ReadonlyArray<RawVector2>
): MatLocalAabb | null {
  if (samples.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of samples) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

function cross2d_(o: RawVector2, a: RawVector2, b: RawVector2): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/** Andrew's monotone chain convex hull (mat-local cm). */
export function convexHull2d(points: ReadonlyArray<RawVector2>): RawVector2[] {
  if (points.length <= 2) return [...points];

  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const lower: RawVector2[] = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross2d_(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: RawVector2[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (
      upper.length >= 2 &&
      cross2d_(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/** Grid-snap dedupe to keep hull computation cheap on dense meshes. */
export function dedupeMatLocalPoints(
  points: ReadonlyArray<RawVector2>,
  gridCm = 0.25
): RawVector2[] {
  const seen = new Set<string>();
  const out: RawVector2[] = [];
  for (const p of points) {
    const key = `${Math.round(p.x / gridCm)}:${Math.round(p.y / gridCm)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

const MAX_HULL_INPUT_POINTS = 512;

/** Cap dense inputs before convex hull (keeps sort/hull off the stack). */
export function capMatLocalPointsForHull(
  points: ReadonlyArray<RawVector2>,
  maxPoints = MAX_HULL_INPUT_POINTS
): RawVector2[] {
  if (points.length <= maxPoints) return [...points];
  const stride = Math.ceil(points.length / maxPoints);
  const out: RawVector2[] = [];
  for (let i = 0; i < points.length; i += stride) {
    out.push(points[i]);
  }
  return out;
}

/** Ray-cast point-in-polygon (mat-local cm, x = width, y = length). */
export function pointInPlayAreaPolygon(
  px: number,
  py: number,
  poly: ReadonlyArray<{ x: number; y: number }>
): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    if (
      (yi > py) !== (yj > py) &&
      px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInConvexPolygon_(
  px: number,
  py: number,
  hull: ReadonlyArray<RawVector2>
): boolean {
  if (hull.length < 3) return false;
  let sign = 0;
  for (let i = 0; i < hull.length; i++) {
    const j = (i + 1) % hull.length;
    const cross =
      (hull[j].x - hull[i].x) * (py - hull[i].y) -
      (hull[j].y - hull[i].y) * (px - hull[i].x);
    if (Math.abs(cross) < 1e-9) continue;
    const s = cross > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return sign !== 0;
}

function segmentsIntersect_(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number
): boolean {
  const denom = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (Math.abs(denom) < 1e-12) return false;
  const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / denom;
  const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function convexPolygonIntersectsPolygon_(
  hull: ReadonlyArray<RawVector2>,
  poly: ReadonlyArray<{ x: number; y: number }>
): boolean {
  if (hull.length < 3 || poly.length < 3) return false;

  for (const p of hull) {
    if (pointInPlayAreaPolygon(p.x, p.y, poly)) return true;
  }

  for (const v of poly) {
    if (pointInConvexPolygon_(v.x, v.y, hull)) return true;
  }

  for (let i = 0; i < hull.length; i++) {
    const i2 = (i + 1) % hull.length;
    const ax = hull[i].x;
    const ay = hull[i].y;
    const bx = hull[i2].x;
    const by = hull[i2].y;
    for (let j = 0; j < poly.length; j++) {
      const k = (j + 1) % poly.length;
      if (segmentsIntersect_(ax, ay, bx, by, poly[j].x, poly[j].y, poly[k].x, poly[k].y)) {
        return true;
      }
    }
  }

  return false;
}

/** True when any robot footprint hull overlaps the play-area polygon. */
export function robotFootprintHullsIntersectPlayAreaPolygon(
  hulls: ReadonlyArray<ReadonlyArray<RawVector2>>,
  poly: ReadonlyArray<{ x: number; y: number }>
): boolean {
  for (const hull of hulls) {
    if (convexPolygonIntersectsPolygon_(hull, poly)) return true;
  }
  return false;
}

/**
 * @deprecated Use {@link robotFootprintHullsIntersectPlayAreaPolygon} with projected hulls.
 */
export function robotMatBoundsIntersectPlayAreaPolygon(
  samples: ReadonlyArray<RawVector2>,
  poly: ReadonlyArray<{ x: number; y: number }>
): boolean {
  const hull = convexHull2d(samples);
  return robotFootprintHullsIntersectPlayAreaPolygon([hull], poly);
}
