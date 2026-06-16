import {
  AbstractMesh,
  Camera,
  Matrix,
  Plane,
  Scene as BabylonScene,
  Ray,
  Vector3,
} from '@babylonjs/core';
import { SceneMeshMetadata } from '../simulator/babylonBindings/SceneBinding';
import { JBC_MAT_ORIGIN } from '../simulator/definitions/scenes/jbcBase';
import Dict from '../util/objectOps/Dict';
import Scene, { MatPlayZoneDefinition } from '../state/State/Scene';
import Node from '../state/State/Scene/Node';
import LocalizedString from './LocalizedString';
import { Space } from '../simulator/Space';
import { Vector3wUnits } from './math/unitMath';
import { RawVector2, RawVector3 } from './math/math';
import { Distance } from './math/Value';
import { JBC_CATALOG_SUCCESS_GOALS } from './jbcChallengeCatalog';
import { ConditionGoalInput, mergeConditionGoals } from './customChallengePredicates';
import {
  getCameraViewProjectionMatrix,
  safeVector3Project,
} from './babylonMath';

/** @deprecated Four-corner rectangle; use {@link MatPlayAreaShape}. */
export interface MatPlayAreaCorners {
  topLeft: RawVector2;
  topRight: RawVector2;
  bottomRight: RawVector2;
  bottomLeft: RawVector2;
}

export type MatPlayAreaEdgeMode = 'straight' | 'curved';

/** Polygon on the JBC mat surface in mat-local centimeters (x = width, y = length). */
export interface MatPlayAreaShape {
  points: RawVector2[];
  edgeMode: MatPlayAreaEdgeMode;
}

/** Mat region for grouping success rules (items on the mat are separate). */
export interface MatPlayZone {
  id: string;
  name: string;
  shape: MatPlayAreaShape;
  /** Keys from {@link JBC_CATALOG_SUCCESS_GOALS}. */
  successGoalKeys: string[];
}

export const MIN_PLAY_AREA_POINTS = 3;
export const MAX_PLAY_AREA_POINTS = 32;
/** Control-point offset as a fraction of edge length (curved mode). */
export const PLAY_AREA_CURVE_BULGE = 0.35;

/** World items and script geometries on the mat (not tied to play zones). */
export interface MatPlacementSelection {
  worldItemKeys: string[];
  geometryKeys: string[];
}

export const ZONE_DISPLAY_COLORS = [
  { fill: 'rgba(76, 175, 80, 0.2)', stroke: 'rgba(76, 175, 80, 0.95)' },
  { fill: 'rgba(33, 150, 243, 0.2)', stroke: 'rgba(33, 150, 243, 0.95)' },
  { fill: 'rgba(255, 152, 0, 0.2)', stroke: 'rgba(255, 152, 0, 0.95)' },
  { fill: 'rgba(156, 39, 176, 0.2)', stroke: 'rgba(156, 39, 176, 0.95)' },
  { fill: 'rgba(244, 67, 54, 0.2)', stroke: 'rgba(244, 67, 54, 0.95)' },
  { fill: 'rgba(0, 188, 212, 0.2)', stroke: 'rgba(0, 188, 212, 0.95)' },
];

const MAT_HALF_WIDTH_CM = Distance.feet(1).value;
const MAT_HALF_LENGTH_CM = Distance.feet(2).value;
const MAT_SURFACE_Y_CM = Distance.centimeters(-6.9).value;

/** Fraction of the visible mat used for the default play-area square. */
export const DEFAULT_ZONE_MAT_FRACTION = 0.55;

/** Minimum width and height of a play area on the mat (centimeters). */
export const MIN_ZONE_SPAN_CM = Distance.centimeters(15).value;

export const JBC_MAT_HALF_WIDTH_CM = MAT_HALF_WIDTH_CM;
export const JBC_MAT_HALF_LENGTH_CM = MAT_HALF_LENGTH_CM;

export interface MatSurfaceBoundsCm {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  surfaceY: number;
}

/** World-space mat origin (cm); uses the live mat mesh when the simulator is running. */
export function getLiveMatOriginCm(): RawVector3 {
  const frame = getMatSurfaceFrame_();
  if (frame) {
    return { ...frame.origin };
  }
  const mesh = findJbcMatMesh_();
  if (mesh) {
    mesh.computeWorldMatrix(true);
    const ap = mesh.getAbsolutePosition();
    return { x: ap.x * 100, y: ap.y * 100, z: ap.z * 100 };
  }
  return matOriginCm();
}

interface MatSurfaceFrame {
  /** World cm at mat-local (0, 0) on the top surface. */
  origin: RawVector3;
  /** World cm offset per 1 cm along mat-local x (width). */
  tangentX: RawVector3;
  /** World cm offset per 1 cm along mat-local y (length). */
  tangentZ: RawVector3;
}

function vecDot3_(a: RawVector3, b: RawVector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function vecCross3_(a: RawVector3, b: RawVector3): RawVector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function babylonToRawCm_(v: Vector3): RawVector3 {
  return { x: v.x * 100, y: v.y * 100, z: v.z * 100 };
}

function isOverMatSurface_(local: RawVector2): boolean {
  const bounds = resolveMatSurfaceBoundsCm();
  return (
    local.x >= bounds.minX &&
    local.x <= bounds.maxX &&
    local.y >= bounds.minY &&
    local.y <= bounds.maxY
  );
}

function getMatSurfaceFrame_(): MatSurfaceFrame | null {
  const mesh = findJbcMatMesh_();
  if (!mesh) return null;

  mesh.computeWorldMatrix(true);
  const wm = mesh.getWorldMatrix();
  const bb = mesh.getBoundingInfo().boundingBox;
  const yTop = bb.maximum.y;
  const o = Vector3.TransformCoordinates(new Vector3(0, yTop, 0), wm);
  const px = Vector3.TransformCoordinates(new Vector3(0.01, yTop, 0), wm);
  const pz = Vector3.TransformCoordinates(new Vector3(0, yTop, 0.01), wm);
  const origin = babylonToRawCm_(o);
  const tangentX = babylonToRawCm_(px.subtract(o));
  const tangentZ = babylonToRawCm_(pz.subtract(o));
  if (
    !Number.isFinite(origin.x) ||
    vecDot3_(tangentX, tangentX) < 1e-6 ||
    vecDot3_(tangentZ, tangentZ) < 1e-6
  ) {
    return null;
  }
  return { origin, tangentX, tangentZ };
}

function getGroundSurfaceYCm_(): number | null {
  const mesh = findGroundMesh_();
  if (!mesh) return null;
  mesh.computeWorldMatrix(true);
  const y = mesh.getBoundingInfo().boundingBox.maximumWorld.y * 100;
  return Number.isFinite(y) ? y : null;
}

function findGroundMesh_(): AbstractMesh | null {
  const bScene = getBabylonScene();
  if (!bScene) return null;

  const byId = bScene.getMeshById('ground') ?? bScene.getMeshByName('ground');
  if (byId) return byId;

  for (const mesh of bScene.meshes) {
    const md = mesh.metadata as SceneMeshMetadata | undefined;
    const id = md?.id ?? mesh.name ?? '';
    if (id === 'ground') return mesh;
  }
  return null;
}

function worldOnMatSurface_(local: RawVector2, frame: MatSurfaceFrame): RawVector3 {
  return {
    x: frame.origin.x + frame.tangentX.x * local.x + frame.tangentZ.x * local.y,
    y: frame.origin.y + frame.tangentX.y * local.x + frame.tangentZ.y * local.y,
    z: frame.origin.z + frame.tangentX.z * local.x + frame.tangentZ.z * local.y,
  };
}

function fallbackMatLocalToWorldCm_(local: RawVector2): RawVector3 {
  const origin = matOriginCm();
  const bounds = fallbackMatBounds_();
  const worldX = origin.x + local.x;
  const worldZ = origin.z + local.y;
  const y =
    isOverMatSurface_(local)
      ? bounds.surfaceY
      : (getGroundSurfaceYCm_() ?? bounds.surfaceY);
  return { x: worldX, y, z: worldZ };
}

function worldCmToMatLocalRaw(world: RawVector3): RawVector2 {
  const frame = getMatSurfaceFrame_();
  if (frame) {
    const offset = {
      x: world.x - frame.origin.x,
      y: world.y - frame.origin.y,
      z: world.z - frame.origin.z,
    };
    const lenX = vecDot3_(frame.tangentX, frame.tangentX);
    const lenZ = vecDot3_(frame.tangentZ, frame.tangentZ);
    return {
      x: vecDot3_(offset, frame.tangentX) / lenX,
      y: vecDot3_(offset, frame.tangentZ) / lenZ,
    };
  }
  const origin = matOriginCm();
  return {
    x: world.x - origin.x,
    y: world.z - origin.z,
  };
}

function findJbcMatMesh_(): AbstractMesh | null {
  const bScene = getBabylonScene();
  if (!bScene) return null;

  const byId = bScene.getMeshById('matA') ?? bScene.getMeshByName('matA');
  if (byId) return byId;

  for (const mesh of bScene.meshes) {
    if (isJbcMatMesh(mesh)) return mesh;
  }
  return null;
}

/** Mat playable bounds from the live mat mesh (matches what you see in the simulator). */
export function getMatSurfaceBoundsCm(): MatSurfaceBoundsCm | null {
  try {
    const mesh = findJbcMatMesh_();
    if (!mesh) return null;

    mesh.computeWorldMatrix(true);
    const box = mesh.getBoundingInfo().boundingBox;
    const yCm = box.maximumWorld.y * 100;
    const xCorners = [box.minimumWorld.x, box.maximumWorld.x].map(x => x * 100);
    const zCorners = [box.minimumWorld.z, box.maximumWorld.z].map(z => z * 100);

    const locals: RawVector2[] = [];
    for (const x of xCorners) {
      for (const z of zCorners) {
        locals.push(worldCmToMatLocalRaw({ x, y: yCm, z }));
      }
    }

    const xs = locals.map(p => p.x);
    const ys = locals.map(p => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      surfaceY: yCm,
    };
  } catch {
    return null;
  }
}

function fallbackMatBounds_(): MatSurfaceBoundsCm {
  return {
    minX: -MAT_HALF_WIDTH_CM,
    maxX: MAT_HALF_WIDTH_CM,
    minY: -MAT_HALF_LENGTH_CM,
    maxY: MAT_HALF_LENGTH_CM,
    surfaceY: MAT_SURFACE_Y_CM,
  };
}

export function resolveMatSurfaceBoundsCm(): MatSurfaceBoundsCm {
  return getMatSurfaceBoundsCm() ?? fallbackMatBounds_();
}

/** Default play-area side length from current mat bounds (centimeters). */
export function defaultZoneSideCm(bounds = resolveMatSurfaceBoundsCm()): number {
  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  return Math.min(spanX, spanY) * DEFAULT_ZONE_MAT_FRACTION;
}

export function cloneMatPlayAreaShape(shape: MatPlayAreaShape): MatPlayAreaShape {
  return {
    edgeMode: shape.edgeMode,
    points: shape.points.map(p => ({ ...p })),
  };
}

export function cloneMatPlayZone(zone: MatPlayZone): MatPlayZone {
  return {
    ...zone,
    shape: cloneMatPlayAreaShape(zone.shape),
    successGoalKeys: [...zone.successGoalKeys],
  };
}

function playAreaBoundingSpan_(points: RawVector2[]): { spanX: number; spanY: number } {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  return {
    spanX: Math.max(...xs) - Math.min(...xs),
    spanY: Math.max(...ys) - Math.min(...ys),
  };
}

function playAreaMeetsMinSpan_(points: RawVector2[]): boolean {
  const { spanX, spanY } = playAreaBoundingSpan_(points);
  return spanX >= MIN_ZONE_SPAN_CM && spanY >= MIN_ZONE_SPAN_CM;
}

/** Default square centered on the mat; same size for every new area. */
export function defaultMatPlayAreaShape(): MatPlayAreaShape {
  const bounds = resolveMatSurfaceBoundsCm();
  const half = defaultZoneSideCm(bounds) / 2;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return {
    edgeMode: 'straight',
    points: [
      clampMatLocalPoint({ x: centerX - half, y: centerY - half }),
      clampMatLocalPoint({ x: centerX + half, y: centerY - half }),
      clampMatLocalPoint({ x: centerX + half, y: centerY + half }),
      clampMatLocalPoint({ x: centerX - half, y: centerY + half }),
    ],
  };
}

/** @deprecated Use {@link defaultMatPlayAreaShape}. */
export function defaultMatPlayAreaCorners(): MatPlayAreaCorners {
  const shape = defaultMatPlayAreaShape();
  return matPlayAreaFromCornerList(shape.points);
}

export function matPlayAreaPointList(shape: MatPlayAreaShape): RawVector2[] {
  return shape.points;
}

/** Denser polygon for runtime hit tests; curved edges match the SVG outline. */
export function matPlayAreaRuntimePolygonPoints(
  shape: MatPlayAreaShape,
  segmentsPerCurvedEdge = 12
): RawVector2[] {
  const pts = shape.points.map(p => ({ ...p }));
  if (pts.length < MIN_PLAY_AREA_POINTS) {
    return pts;
  }
  if (shape.edgeMode === 'straight') {
    return pts;
  }

  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const centroid = { x: cx, y: cy };
  const n = pts.length;
  const out: RawVector2[] = [];

  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    if ((midX - centroid.x) * nx + (midY - centroid.y) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    const bulge = len * PLAY_AREA_CURVE_BULGE;
    const ctrlX = midX + nx * bulge;
    const ctrlY = midY + ny * bulge;

    for (let s = 0; s < segmentsPerCurvedEdge; s++) {
      const t = s / segmentsPerCurvedEdge;
      const u = 1 - t;
      out.push({
        x: u * u * a.x + 2 * u * t * ctrlX + t * t * b.x,
        y: u * u * a.y + 2 * u * t * ctrlY + t * t * b.y,
      });
    }
  }

  return out;
}

/** @deprecated Use {@link matPlayAreaPointList}. */
export function matPlayAreaCornerList(corners: MatPlayAreaCorners): RawVector2[] {
  return [corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft];
}

/** @deprecated Use point list on {@link MatPlayAreaShape}. */
export function matPlayAreaFromCornerList(points: RawVector2[]): MatPlayAreaCorners {
  return {
    topLeft: points[0],
    topRight: points[1],
    bottomRight: points[2],
    bottomLeft: points[3],
  };
}

export function normalizeMatPlayAreaPoints(points: RawVector2[]): RawVector2[] {
  if (points.length < MIN_PLAY_AREA_POINTS) {
    return defaultMatPlayAreaShape().points;
  }
  return points.slice(0, MAX_PLAY_AREA_POINTS).map(p => ({ ...p }));
}

export function matPlayAreaShapeFromDefinition(def: {
  points?: RawVector2[];
  corners?: RawVector2[];
  edgeMode?: MatPlayAreaEdgeMode;
}): MatPlayAreaShape {
  const raw = def.points ?? def.corners ?? defaultMatPlayAreaShape().points;
  return {
    edgeMode: def.edgeMode ?? 'straight',
    points: normalizeMatPlayAreaPoints(raw.map(p => ({ ...p }))),
  };
}

export function translateMatPlayAreaShape(
  shape: MatPlayAreaShape,
  delta: RawVector2
): MatPlayAreaShape {
  return {
    edgeMode: shape.edgeMode,
    points: shape.points.map(p => ({
      x: p.x + delta.x,
      y: p.y + delta.y,
    })),
  };
}

/** @deprecated Use {@link translateMatPlayAreaShape}. */
export function translateMatPlayAreaCorners(
  corners: MatPlayAreaCorners,
  delta: RawVector2
): MatPlayAreaCorners {
  return matPlayAreaFromCornerList(
    translateMatPlayAreaShape(
      { points: matPlayAreaCornerList(corners), edgeMode: 'straight' },
      delta
    ).points
  );
}

/** Move one vertex; keeps at least {@link MIN_ZONE_SPAN_CM} width and height. */
export function updateMatPlayAreaPoint(
  shape: MatPlayAreaShape,
  pointIndex: number,
  point: RawVector2
): MatPlayAreaShape {
  if (pointIndex < 0 || pointIndex >= shape.points.length) {
    return shape;
  }
  const nextPoints = shape.points.map((p, i) =>
    (i === pointIndex ? { ...point } : p)
  );
  if (!playAreaMeetsMinSpan_(nextPoints)) {
    return shape;
  }
  return { ...shape, points: nextPoints };
}

/** @deprecated Use {@link updateMatPlayAreaPoint}. */
export function updateMatPlayAreaCorner(
  corners: MatPlayAreaCorners,
  cornerKey: keyof MatPlayAreaCorners,
  point: RawVector2
): MatPlayAreaCorners {
  const keys: (keyof MatPlayAreaCorners)[] = [
    'topLeft',
    'topRight',
    'bottomRight',
    'bottomLeft',
  ];
  const index = keys.indexOf(cornerKey);
  const next = updateMatPlayAreaPoint(
    { points: matPlayAreaCornerList(corners), edgeMode: 'straight' },
    index,
    point
  );
  return matPlayAreaFromCornerList(next.points);
}

/** Insert a vertex on the edge after {@code afterIndex} (wraps on last edge). */
export function insertMatPlayAreaPointAfter(
  shape: MatPlayAreaShape,
  afterIndex: number
): MatPlayAreaShape {
  if (shape.points.length >= MAX_PLAY_AREA_POINTS) {
    return shape;
  }
  const n = shape.points.length;
  if (n < MIN_PLAY_AREA_POINTS) {
    return shape;
  }
  const i = ((afterIndex % n) + n) % n;
  const j = (i + 1) % n;
  const a = shape.points[i];
  const b = shape.points[j];
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const nextPoints = [...shape.points];
  nextPoints.splice(j, 0, mid);
  return { ...shape, points: nextPoints };
}

/** Remove a vertex (requires at least {@link MIN_PLAY_AREA_POINTS}). */
export function removeMatPlayAreaPoint(
  shape: MatPlayAreaShape,
  pointIndex: number
): MatPlayAreaShape {
  if (shape.points.length <= MIN_PLAY_AREA_POINTS) {
    return shape;
  }
  if (pointIndex < 0 || pointIndex >= shape.points.length) {
    return shape;
  }
  const nextPoints = shape.points.filter((_, i) => i !== pointIndex);
  if (!playAreaMeetsMinSpan_(nextPoints)) {
    return shape;
  }
  return { ...shape, points: nextPoints };
}

export function setMatPlayAreaEdgeMode(
  shape: MatPlayAreaShape,
  edgeMode: MatPlayAreaEdgeMode
): MatPlayAreaShape {
  return { ...shape, edgeMode };
}

export function newPlayZone(index: number, id?: string): MatPlayZone {
  return {
    id: id ?? `play-zone-${index}-${Date.now()}`,
    name: `Area ${index + 1}`,
    shape: defaultMatPlayAreaShape(),
    successGoalKeys: ['robotIntersecting'],
  };
}

export function defaultPlayZones(): MatPlayZone[] {
  return [];
}

/** SVG path for a closed play-area outline (screen coordinates). */
export function matPlayAreaOutlinePathD(
  screenPts: { x: number; y: number }[],
  edgeMode: MatPlayAreaEdgeMode
): string {
  if (screenPts.length < MIN_PLAY_AREA_POINTS) {
    return '';
  }
  if (edgeMode === 'straight') {
    const first = screenPts[0];
    let d = `M ${first.x} ${first.y}`;
    for (let i = 1; i < screenPts.length; i++) {
      d += ` L ${screenPts[i].x} ${screenPts[i].y}`;
    }
    return `${d} Z`;
  }

  const cx = screenPts.reduce((s, p) => s + p.x, 0) / screenPts.length;
  const cy = screenPts.reduce((s, p) => s + p.y, 0) / screenPts.length;
  const n = screenPts.length;
  let d = `M ${screenPts[0].x} ${screenPts[0].y}`;
  for (let i = 0; i < n; i++) {
    const a = screenPts[i];
    const b = screenPts[(i + 1) % n];
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    if ((midX - cx) * nx + (midY - cy) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    const bulge = len * PLAY_AREA_CURVE_BULGE;
    d += ` Q ${midX + nx * bulge} ${midY + ny * bulge} ${b.x} ${b.y}`;
  }
  return `${d} Z`;
}

/** Clamp to the visible mat rectangle (used for default new-area placement only). */
export function clampMatLocalPoint(point: RawVector2): RawVector2 {
  const bounds = resolveMatSurfaceBoundsCm();
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, point.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, point.y)),
  };
}

export function clampMatPlayAreaShapeToBounds(shape: MatPlayAreaShape): MatPlayAreaShape {
  return {
    edgeMode: shape.edgeMode,
    points: shape.points.map(p => clampMatLocalPoint(p)),
  };
}

function matOriginCm(): RawVector3 {
  return Vector3wUnits.toRaw(JBC_MAT_ORIGIN.position, 'centimeters');
}

export function matLocalToWorldCm(local: RawVector2): RawVector3 {
  const frame = getMatSurfaceFrame_();
  if (frame) {
    const onMat = worldOnMatSurface_(local, frame);
    if (isOverMatSurface_(local)) {
      return onMat;
    }
    const groundY = getGroundSurfaceYCm_();
    if (groundY !== null) {
      return { x: onMat.x, y: groundY, z: onMat.z };
    }
    return onMat;
  }
  return fallbackMatLocalToWorldCm_(local);
}

/** Mat corners projected into simulator-area-root coordinates (for SVG clipping). */
export function matBoundsSimulatorClipPoints(
  simRoot: HTMLElement
): { x: number; y: number }[] | null {
  const bounds = resolveMatSurfaceBoundsCm();
  const corners: RawVector2[] = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY },
  ];
  const projected = corners.map(local => {
    const world = matLocalToWorldCm(local);
    return projectWorldCmToSimulatorOverlay(world, simRoot);
  });
  if (
    projected.some(
      p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y)
    )
  ) {
    return null;
  }
  return projected as { x: number; y: number }[];
}

/** Simulator Babylon pose → physical world cm (1 Babylon unit = 1 cm for robots and mat items). */
export function babylonPoseToWorldCm(ap: RawVector3): RawVector3 {
  return { x: ap.x, y: ap.y, z: ap.z };
}

/** @deprecated Use {@link babylonPoseToWorldCm}. */
export function robotLinkBabylonToWorldCm(ap: RawVector3): RawVector3 {
  return babylonPoseToWorldCm(ap);
}

/** @deprecated Use {@link babylonPoseToWorldCm}. */
export function sceneMeshBabylonToWorldCm(ap: RawVector3): RawVector3 {
  return babylonPoseToWorldCm(ap);
}

export interface WorldCmBounds {
  min: RawVector3;
  max: RawVector3;
}

/** Horizontal (mat-plane) distance from a world point to an axis-aligned box. */
export function horizontalDistPointToBoundsCm(
  point: RawVector3,
  bounds: WorldCmBounds
): number {
  const cx = Math.max(bounds.min.x, Math.min(bounds.max.x, point.x));
  const cz = Math.max(bounds.min.z, Math.min(bounds.max.z, point.z));
  const dx = point.x - cx;
  const dz = point.z - cz;
  return Math.hypot(dx, dz);
}

/** Horizontal distance (cm) between two world positions on the mat plane (X/Z). */
export function horizontalWorldDistCm(a: RawVector3, b: RawVector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

/** Mat-local cm from scene world position (subtract mat origin; matches ScriptManager fallback). */
export function sceneWorldCmToMatLocalCm(scene: Scene, world: RawVector3): RawVector2 | null {
  const matId = scene.nodes['matA'] ? 'matA' : scene.nodes['matB'] ? 'matB' : null;
  if (!matId) return null;
  const mat = scene.nodes[matId];
  if (!mat?.origin?.position) return null;
  return {
    x: world.x - Distance.toCentimetersValue(mat.origin.position.x),
    y: world.z - Distance.toCentimetersValue(mat.origin.position.z),
  };
}

/** Mat-local cm for a live mat item mesh (scene-object Babylon units are already cm). */
export function matItemMeshMatLocalCm(ap: RawVector3): RawVector2 {
  return worldCmToMatLocal({ x: ap.x, y: ap.y, z: ap.z });
}

/** Mat-local cm for a scene node from script-graph world pose (fallback when mesh missing). */
export function scriptSceneNodeMatLocalCm(scene: Scene, nodeId: string): RawVector2 | null {
  const node = scene.nodes[nodeId];
  if (!node?.origin?.position) return null;
  return matItemMeshMatLocalCm({
    x: Distance.toCentimetersValue(node.origin.position.x),
    y: Distance.toCentimetersValue(node.origin.position.y),
    z: Distance.toCentimetersValue(node.origin.position.z),
  });
}

/** Mat-local cm from world position (not clamped to the mat rectangle). */
export function worldCmToMatLocal(world: RawVector3): RawVector2 {
  return worldCmToMatLocalRaw(world);
}

/** View × projection with valid .m (safe for Vector3.Project). */
export function getSimulatorViewProjectionMatrix(
  camera: Camera | null | undefined,
  bScene: BabylonScene | null | undefined
): Matrix | null {
  if (!camera || !bScene) return null;
  return getCameraViewProjectionMatrix(camera);
}

export function simulatorProjectionReady(): boolean {
  try {
    const binding = Space.getInstance().sceneBinding;
    const canvas = binding?.canvas;
    if (!canvas || canvas.width <= 0) return false;
    const bScene = binding?.bScene;
    const camera = binding?.camera ?? bScene?.activeCamera ?? null;
    return !!getSimulatorViewProjectionMatrix(camera, bScene);
  } catch {
    return false;
  }
}

/** Viewport client coordinates (aligned with SimulatorArea canvas projection). */
export function projectWorldCmToClient(world: RawVector3): { x: number; y: number } | null {
  try {
    const binding = Space.getInstance().sceneBinding;
    const canvas = binding?.canvas;
    const bScene = binding?.bScene;
    const camera = binding?.camera ?? bScene?.activeCamera;
    if (!canvas || !bScene || !camera) return null;

    const canvasRect = canvas.getBoundingClientRect();
    if (canvasRect.width <= 0 || canvas.width <= 0) return null;

    const worldM = new Vector3(world.x / 100, world.y / 100, world.z / 100);
    const transformMatrix = getSimulatorViewProjectionMatrix(camera, bScene);
    if (!transformMatrix) return null;

    const projected = safeVector3Project(
      worldM,
      transformMatrix,
      camera.viewport.toGlobal(canvas.width, canvas.height)
    );
    if (!projected) {
      return null;
    }

    return {
      x: canvasRect.left + (projected.x / canvas.width) * canvasRect.width,
      y: canvasRect.top + (projected.y / canvas.height) * canvasRect.height,
    };
  } catch {
    return null;
  }
}

/**
 * Repaint mat play-area SVG overlays after the simulator renders (so projection
 * uses the current camera matrix, not a stale one from a separate rAF loop).
 */
export function subscribeSimulatorOverlayRepaint(onRepaint: () => void): () => void {
  let disposed = false;
  const cleanups: (() => void)[] = [];

  const attach = (): boolean => {
    try {
      const binding = Space.getInstance().sceneBinding;
      const bScene = binding?.bScene;
      if (!bScene) return false;

      const renderObs = bScene.onAfterRenderObservable.add(onRepaint);
      cleanups.push(() => renderObs.remove());

      const camera = binding.camera ?? bScene.activeCamera;
      if (camera && 'onViewMatrixChangedObservable' in camera) {
        const cam = camera as Camera & {
          onViewMatrixChangedObservable: {
            add: (cb: () => void) => { remove: () => void };
          };
        };
        const camObs = cam.onViewMatrixChangedObservable.add(() => {
          if (!disposed) onRepaint();
        });
        cleanups.push(() => camObs.remove());
      }

      return true;
    } catch {
      return false;
    }
  };

  if (!attach()) {
    let raf = 0;
    const retry = () => {
      if (disposed) return;
      if (attach()) return;
      raf = window.requestAnimationFrame(retry);
    };
    raf = window.requestAnimationFrame(retry);
    cleanups.push(() => window.cancelAnimationFrame(raf));
  }

  return () => {
    disposed = true;
    cleanups.forEach(fn => fn());
  };
}

export function projectShapeToOverlay(
  shape: MatPlayAreaShape,
  simRoot: HTMLElement
): ({ x: number; y: number } | null)[] {
  return matPlayAreaPointList(shape).map(local => {
    const world = matLocalToWorldCm(local);
    return projectWorldCmToSimulatorOverlay(world, simRoot);
  });
}

/** @deprecated Use {@link projectShapeToOverlay}. */
export function projectZoneCornersToOverlay(
  corners: MatPlayAreaCorners,
  simRoot: HTMLElement
): ({ x: number; y: number } | null)[] {
  return projectShapeToOverlay(
    { points: matPlayAreaCornerList(corners), edgeMode: 'straight' },
    simRoot
  );
}

/** Client coordinates relative to the simulator-area-root bounding box. */
export function projectWorldCmToSimulatorOverlay(
  world: RawVector3,
  simRoot: HTMLElement
): { x: number; y: number } | null {
  const client = projectWorldCmToClient(world);
  if (!client) return null;
  const rect = simRoot.getBoundingClientRect();
  return {
    x: client.x - rect.left,
    y: client.y - rect.top,
  };
}

function getBabylonScene() {
  try {
    return Space.getInstance().sceneBinding?.bScene ?? null;
  } catch {
    return null;
  }
}

function getSceneCamera() {
  try {
    return Space.getInstance().sceneBinding?.camera ?? null;
  } catch {
    return null;
  }
}

function clientToPickBuffer(
  clientX: number,
  clientY: number
): { x: number; y: number } | null {
  const bScene = getBabylonScene();
  if (!bScene) return null;

  const engine = bScene.getEngine();
  if (engine.views.length <= 0) return null;

  const viewTarget = engine.views[0].target as HTMLElement;
  const rect = viewTarget.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  return {
    x: ((clientX - rect.left) / rect.width) * engine.getRenderWidth(),
    y: ((clientY - rect.top) / rect.height) * engine.getRenderHeight(),
  };
}

function isJbcMatMesh(mesh: AbstractMesh): boolean {
  const md = mesh.metadata as { matPlayZoneOverlay?: boolean } & SceneMeshMetadata | undefined;
  if (md?.matPlayZoneOverlay) return false;
  const id = md?.id ?? mesh.name ?? '';
  if (id === 'matA' || id === 'matB') return true;
  if (id.startsWith('matPlayZone')) return false;
  return id === 'mat' || /^mat[A-Z]/.test(id);
}

function pickRayOnScenePlaySurface_(
  ray: Ray
): RawVector3 | null {
  let bestDist: number | null = null;
  let bestWorld: RawVector3 | null = null;

  const tryPlane = (pointM: Vector3, normalM: Vector3) => {
    const plane = Plane.FromPositionAndNormal(pointM, normalM);
    const distance: number | null = ray.intersectsPlane(plane);
    if (distance === null || distance < 0) return;
    if (bestDist !== null && distance >= bestDist) return;
    const hit: Vector3 = ray.origin.add(ray.direction.scale(distance));
    bestDist = distance;
    bestWorld = babylonToRawCm_(hit);
  };

  const frame = getMatSurfaceFrame_();
  if (frame) {
    const normal = vecCross3_(frame.tangentX, frame.tangentZ);
    const len = Math.hypot(normal.x, normal.y, normal.z);
    if (len > 1e-6) {
      tryPlane(
        new Vector3(frame.origin.x / 100, frame.origin.y / 100, frame.origin.z / 100),
        new Vector3(normal.x / len, normal.y / len, normal.z / len)
      );
    }
  }

  const groundY = getGroundSurfaceYCm_();
  if (groundY !== null) {
    tryPlane(new Vector3(0, groundY / 100, 0), Vector3.Up());
  } else {
    const bounds = fallbackMatBounds_();
    const origin = matOriginCm();
    tryPlane(
      new Vector3(origin.x / 100, bounds.surfaceY / 100, origin.z / 100),
      Vector3.Up()
    );
  }

  return bestWorld;
}

function pickMatLocalOnPlaneWithCoords(
  coords: { x: number; y: number },
  flipY: boolean
): RawVector2 | null {
  const bScene = getBabylonScene();
  const camera = getSceneCamera();
  if (!bScene || !camera) return null;

  const engine = bScene.getEngine();
  const pickY = flipY ? engine.getRenderHeight() - coords.y : coords.y;

  const ray = bScene.createPickingRay(coords.x, pickY, Matrix.Identity(), camera, false);
  const hit = pickRayOnScenePlaySurface_(ray);
  if (!hit) return null;

  return worldCmToMatLocal(hit);
}

function pickMatLocalOnPlane(clientX: number, clientY: number): RawVector2 | null {
  const coords = clientToPickBuffer(clientX, clientY);
  if (!coords) return null;
  return (
    pickMatLocalOnPlaneWithCoords(coords, false) ??
    pickMatLocalOnPlaneWithCoords(coords, true)
  );
}

/** Map a screen pointer to mat-local cm on the mat surface plane (not limited to the mat mesh). */
export function pickMatLocalFromClient(clientX: number, clientY: number): RawVector2 | null {
  return pickMatLocalOnPlane(clientX, clientY);
}

let controlsSuspendedForMatZoneEdit_ = false;

/** Suspend camera orbit / scene pointer handlers (play-area drag, etc.). */
export function detachSimulatorControls(): void {
  try {
    Space.getInstance().sceneBinding?.detachSimulatorControls();
    controlsSuspendedForMatZoneEdit_ = true;
  } catch {
    // simulator not initialized
  }
}

/** Re-enable camera after play-area drag (no-op if controls were not suspended). */
export function restoreSimulatorControls(): void {
  if (!controlsSuspendedForMatZoneEdit_) return;
  try {
    Space.getInstance().sceneBinding?.attachSimulatorControls();
    controlsSuspendedForMatZoneEdit_ = false;
  } catch {
    // simulator not initialized
  }
}

/** (Re)bind camera input — use when the simulator view is shown, not during play-area drag. */
export function rebindSimulatorControls(): void {
  try {
    Space.getInstance().sceneBinding?.attachSimulatorControls();
    controlsSuspendedForMatZoneEdit_ = false;
  } catch {
    // simulator not initialized
  }
}

/** Mat-local centimeters per screen pixel at a corner (for 1:1 handle dragging). */
export function cmPerPixelAtCorner(corner: RawVector2): { x: number; y: number } {
  const refCm = Distance.feet(1).value;
  const p0 = projectWorldCmToClient(matLocalToWorldCm(corner));
  const pX = projectWorldCmToClient(
    matLocalToWorldCm({ x: corner.x + refCm, y: corner.y })
  );
  const pY = projectWorldCmToClient(
    matLocalToWorldCm({ x: corner.x, y: corner.y + refCm })
  );
  if (!p0 || !pX || !pY) {
    return { x: 0.2, y: 0.2 };
  }

  const dPxX = pX.x - p0.x;
  const dPxY = pY.y - p0.y;
  return {
    x: Math.abs(dPxX) < 1 ? refCm : refCm / dPxX,
    y: Math.abs(dPxY) < 1 ? refCm : refCm / dPxY,
  };
}

export function matLocalFromPixelDelta(
  baseCorner: RawVector2,
  pixelDx: number,
  pixelDy: number,
  scale?: { x: number; y: number }
): RawVector2 {
  const cmPerPx = scale ?? cmPerPixelAtCorner(baseCorner);
  return {
    x: baseCorner.x + pixelDx * cmPerPx.x,
    y: baseCorner.y + pixelDy * cmPerPx.y,
  };
}

/** Restore wizard play zones from a saved custom-challenge scene. */
export function matPlayZonesFromScene(scene: Scene): MatPlayZone[] {
  if (!scene.matPlayZones?.length) {
    return [];
  }
  return scene.matPlayZones.map(def => ({
    id: def.id,
    name: def.name,
    shape: matPlayAreaShapeFromDefinition(def),
    successGoalKeys: [...(def.successGoalKeys ?? [])],
  }));
}

export function zoneToSceneDefinition(zone: MatPlayZone): MatPlayZoneDefinition {
  const shape = cloneMatPlayAreaShape(zone.shape);
  return {
    id: zone.id,
    name: zone.name,
    points: shape.points.map(p => ({ ...p })),
    edgeMode: shape.edgeMode,
    successGoalKeys: [...zone.successGoalKeys],
  };
}

export function conditionGoalsFromCatalogKeys(keys: string[]): ConditionGoalInput[] {
  const goals: ConditionGoalInput[] = [];
  for (const key of keys) {
    const entry = JBC_CATALOG_SUCCESS_GOALS.find(g => g.key === key);
    if (!entry) continue;
    if (goals.some(g => g.eventId === entry.eventId && g.label === entry.label)) continue;
    goals.push({
      eventId: entry.eventId,
      label: entry.label,
      latchOnce: entry.latchOnce,
    });
  }
  return goals;
}

/** @deprecated Use {@link allZoneSuccessGoals} from `playAreaSuccessGoals`. */
export function allZoneSuccessGoalsFromCatalog(zones: MatPlayZone[]): ConditionGoalInput[] {
  const keys = new Set<string>();
  zones.forEach(z => z.successGoalKeys.forEach(k => keys.add(k)));
  return mergeConditionGoals(conditionGoalsFromCatalogKeys(Array.from(keys)));
}

export { allZoneSuccessGoals } from './playAreaSuccessGoals';

function stripCustomPlayZoneSceneObjects_(scene: Scene): Scene {
  const nodes: Dict<Node> = { ...scene.nodes };
  const next: Scene = {
    ...scene,
    geometry: { ...scene.geometry },
    nodes,
  };
  for (const nodeId of Object.keys(nodes)) {
    if (!nodeId.startsWith('customPlayZone_')) continue;
    const node: Node = nodes[nodeId];
    const geomId = 'geometryId' in node ? node.geometryId : undefined;
    delete nodes[nodeId];
    if (typeof geomId === 'string' && geomId.startsWith('customPlayZone_geom_')) {
      delete next.geometry[geomId];
    }
  }
  for (const geomId of Object.keys(next.geometry)) {
    if (geomId.startsWith('customPlayZone_geom_')) {
      delete next.geometry[geomId];
    }
  }
  return next;
}

export function matPlacementFromScene(scene: Scene): MatPlacementSelection {
  const p = scene.customChallengePlacement;
  return {
    worldItemKeys: [...(p?.worldItemNodeIds ?? [])],
    geometryKeys: [...(p?.scriptGeometryIds ?? [])],
  };
}

export function applyMatPlayZonesToScene(
  scene: Scene,
  zones: MatPlayZone[],
  placement?: MatPlacementSelection
): Scene {
  let next: Scene = stripCustomPlayZoneSceneObjects_(scene);
  next = {
    ...next,
    matPlayZones: zones.map(zoneToSceneDefinition),
    customChallengePlacement: placement
      ? {
        worldItemNodeIds: [...placement.worldItemKeys],
        scriptGeometryIds: [...placement.geometryKeys],
      }
      : scene.customChallengePlacement,
  };
  delete next.matPlayArea;

  return next;
}

/** @deprecated Use applyMatPlayZonesToScene */
export function applyMatPlayAreaToScene(scene: Scene, corners: MatPlayAreaCorners): Scene {
  return applyMatPlayZonesToScene(scene, [
    {
      id: 'play-zone-legacy',
      name: 'Play Area',
      shape: {
        points: matPlayAreaCornerList(corners),
        edgeMode: 'straight',
      },
      successGoalKeys: [],
    },
  ]);
}

/** Draw play areas as coplanar 3D meshes (flush with mat / ground, not screen overlays). */
export function syncMatPlayZoneSurfaceMeshes(
  zones: MatPlayZone[],
  options?: { fill?: boolean; fillAlpha?: number }
): void {
  try {
    Space.getInstance().sceneBinding?.syncMatPlayZoneSurfaceMeshes(zones, options);
  } catch {
    // Simulator not initialized.
  }
}

export function ensureJbcMatMeshesInSimulator(scene: Scene): void {
  try {
    void Space.getInstance().sceneBinding?.ensureJbcMatMeshes(scene);
  } catch {
    // Simulator not initialized.
  }
}
