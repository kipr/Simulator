import earcut from 'earcut';

type EarcutFn = (data: number[], holeIndices?: number[], dim?: number) => number[];
const earcutTriangles: EarcutFn = earcut as EarcutFn;
import {
  Color3,
  Color4,
  Matrix,
  Mesh,
  MeshBuilder,
  Quaternion,
  Scene as BabylonScene,
  StandardMaterial,
  TransformNode,
  Vector3,
  VertexData,
} from '@babylonjs/core';
import {
  MatPlayZone,
  matLocalToWorldCm,
  matPlayAreaRuntimePolygonPoints,
  ZONE_DISPLAY_COLORS,
} from '../../util/jbcMatPlayArea';
import { RawVector3 } from '../../util/math/math';

const ROOT_NAME = 'matPlayZoneSurfaceRoot';
const MESH_PREFIX = 'matPlayZoneSurface_';
const LINE_PREFIX = 'matPlayZoneOutline_';
/** World-space lift along surface normal (m) — avoids z-fighting, not visible as thickness. */
const SURFACE_LIFT_M = 0.00025;

function parseRgba_(rgba: string): Color4 {
  const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/.exec(rgba);
  if (!m) {
    return new Color4(0.3, 0.69, 0.31, 0.25);
  }
  return new Color4(
    Number(m[1]) / 255,
    Number(m[2]) / 255,
    Number(m[3]) / 255,
    m[4] !== undefined ? Number(m[4]) : 1
  );
}

function worldCmToMeters_(world: RawVector3): Vector3 {
  return new Vector3(world.x / 100, world.y / 100, world.z / 100);
}

/** Mat-local geometry fingerprint (stable while the mat mesh moves in the world). */
function zonesFingerprint_(zones: MatPlayZone[]): string {
  return zones
    .map(zone => {
      const pts = matPlayAreaRuntimePolygonPoints(zone.shape);
      const flat = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`);
      return `${zone.id}:${zone.shape.edgeMode}:${flat.join(';')}`;
    })
    .join('|');
}

function dedupeLocalPoints_(points: Vector3[]): Vector3[] {
  const out: Vector3[] = [];
  const eps = 1e-6;
  for (const p of points) {
    const prev = out[out.length - 1];
    if (prev && Math.abs(p.x - prev.x) < eps && Math.abs(p.z - prev.z) < eps) {
      continue;
    }
    out.push(p);
  }
  if (out.length > 1) {
    const first = out[0];
    const last = out[out.length - 1];
    if (Math.abs(first.x - last.x) < eps && Math.abs(first.z - last.z) < eps) {
      out.pop();
    }
  }
  return out;
}

function signedAreaXZ_(points: Vector3[]): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].z - points[j].x * points[i].z;
  }
  return area;
}

function triangulateLocalXZ_(points: Vector3[]): number[] {
  const flat: number[] = [];
  for (const p of points) {
    flat.push(p.x, p.z);
  }
  let indices = earcutTriangles(flat);
  if (signedAreaXZ_(points) < 0) {
    indices = indices.slice();
    for (let i = 0; i < indices.length; i += 3) {
      const tmp = indices[i + 1];
      indices[i + 1] = indices[i + 2];
      indices[i + 2] = tmp;
    }
  }
  return indices;
}

function surfaceFrame_(
  worldM: Vector3[]
): { centroid: Vector3; normal: Vector3; rotation: Quaternion } | null {
  const n = worldM.length;
  if (n < 3) return null;

  const centroid = worldM
    .reduce((acc, p) => acc.add(p), Vector3.Zero())
    .scale(1 / n);

  const edge0 = worldM[1].subtract(worldM[0]);
  const edge1 = worldM[2].subtract(worldM[0]);
  const normal = Vector3.Cross(edge0, edge1);
  if (normal.lengthSquared() < 1e-14) return null;
  normal.normalize();
  if (Vector3.Dot(normal, Vector3.Up()) < 0) {
    normal.scaleInPlace(-1);
  }

  const rotation = new Quaternion();
  Quaternion.FromUnitVectorsToRef(Vector3.Up(), normal, rotation);
  return { centroid, normal, rotation };
}

function createFillMaterial_(
  bScene: BabylonScene,
  zoneId: string,
  fill: Color4
): StandardMaterial {
  const material = new StandardMaterial(`${MESH_PREFIX}mat_${zoneId}`, bScene);
  const color = new Color3(fill.r, fill.g, fill.b);
  material.diffuseColor = color;
  material.emissiveColor = color;
  material.specularColor = Color3.Black();
  material.disableLighting = true;
  material.backFaceCulling = true;
  material.alpha = fill.a;
  material.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  material.forceDepthWrite = true;
  material.zOffset = -2;
  return material;
}

/**
 * Zero-thickness play-area fill and outline meshes coplanar with the mat / ground.
 */
export class MatPlayZoneSurfaceMeshes {
  private root_: TransformNode | null = null;
  private fingerprint_ = '';
  private fillMaterials_: StandardMaterial[] = [];

  sync(bScene: BabylonScene, zones: MatPlayZone[]): void {
    const fingerprint = zonesFingerprint_(zones);
    if (fingerprint === this.fingerprint_ && this.root_) {
      return;
    }
    this.dispose_(bScene);
    this.fingerprint_ = fingerprint;
    if (zones.length === 0) return;

    this.root_ = new TransformNode(ROOT_NAME, bScene);
    this.root_.metadata = { matPlayZoneOverlay: true };

    zones.forEach((zone, zoneIndex) => {
      const points = matPlayAreaRuntimePolygonPoints(zone.shape);
      if (points.length < 3) return;

      const worldPtsCm = points.map(p => matLocalToWorldCm(p));
      const worldM = worldPtsCm.map(worldCmToMeters_);
      const frame = surfaceFrame_(worldM);
      if (!frame) return;

      const colors = ZONE_DISPLAY_COLORS[zoneIndex % ZONE_DISPLAY_COLORS.length];
      const fill = parseRgba_(colors.fill);
      const stroke = parseRgba_(colors.stroke);
      const lift = frame.normal.scale(SURFACE_LIFT_M);

      const anchor = new TransformNode(`${MESH_PREFIX}anchor_${zone.id}`, bScene);
      anchor.parent = this.root_;
      anchor.position = frame.centroid.add(lift);
      anchor.rotationQuaternion = frame.rotation;
      anchor.computeWorldMatrix(true);

      const inv = Matrix.Invert(anchor.getWorldMatrix());
      const localPoints = dedupeLocalPoints_(
        worldM.map(wm => {
          const lifted = wm.add(lift);
          return Vector3.TransformCoordinates(lifted, inv);
        })
      );
      if (localPoints.length < 3) return;

      const indices = triangulateLocalXZ_(localPoints);
      if (indices.length < 3) return;

      const positions: number[] = [];
      const normals: number[] = [];
      for (const p of localPoints) {
        positions.push(p.x, p.y, p.z);
        normals.push(0, 1, 0);
      }

      const vertexData = new VertexData();
      vertexData.positions = positions;
      vertexData.indices = indices;
      vertexData.normals = normals;

      const surface = new Mesh(`${MESH_PREFIX}${zone.id}`, bScene);
      vertexData.applyToMesh(surface);
      surface.parent = anchor;
      surface.isPickable = false;
      surface.metadata = { matPlayZoneOverlay: true };

      const fillMaterial = createFillMaterial_(bScene, zone.id, fill);
      this.fillMaterials_.push(fillMaterial);
      surface.material = fillMaterial;
      surface.renderingGroupId = 2;

      const outlinePts = worldM.map(wm => wm.add(lift));
      const outline = MeshBuilder.CreateLines(
        `${LINE_PREFIX}${zone.id}`,
        { points: [...outlinePts, outlinePts[0]] },
        bScene
      );
      outline.color = new Color3(stroke.r, stroke.g, stroke.b);
      outline.alpha = 1;
      outline.isPickable = false;
      outline.metadata = { matPlayZoneOverlay: true };
      outline.parent = this.root_;
    });
  }

  private dispose_(bScene: BabylonScene): void {
    for (const material of this.fillMaterials_) {
      material.dispose();
    }
    this.fillMaterials_ = [];

    if (this.root_) {
      this.root_.dispose(false, true);
      this.root_ = null;
    } else {
      const existing = bScene.getTransformNodeByName(ROOT_NAME);
      existing?.dispose(false, true);
    }
    this.fingerprint_ = '';
  }
}
