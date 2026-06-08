import {
  AbstractMesh,
  Camera,
  Matrix,
  Quaternion,
  TransformNode,
  Vector3,
  Viewport,
} from '@babylonjs/core';
import { RawQuaternion, RawVector3 } from './math/math';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from './math/unitMath';

/** True when a Babylon matrix has a usable coefficient array. */
export function matrixCoefficientsValid(matrix: Matrix | null | undefined): boolean {
  if (!matrix) return false;
  try {
    const m = matrix.m;
    return !!m && m.length >= 16 && Number.isFinite(m[0]) && Number.isFinite(m[15]);
  } catch {
    return false;
  }
}

/**
 * View × projection without mutating the camera's internal view matrix.
 * Prefer the camera composite matrix when Babylon has already computed it.
 */
export function getCameraViewProjectionMatrix(camera: Camera | null | undefined): Matrix | null {
  if (!camera) return null;
  try {
    const composite = camera.getTransformationMatrix?.();
    if (matrixCoefficientsValid(composite)) {
      return composite.clone();
    }
    const view = camera.getViewMatrix();
    const proj = camera.getProjectionMatrix();
    if (!matrixCoefficientsValid(view) || !matrixCoefficientsValid(proj)) {
      return null;
    }
    const vp = view.clone();
    vp.multiply(proj);
    return matrixCoefficientsValid(vp) ? vp : null;
  } catch {
    return null;
  }
}

/** Project world position to screen; returns null if matrices are not ready. */
export function safeVector3Project(
  world: Vector3,
  transform: Matrix,
  viewport: Viewport,
  worldMatrix: Matrix = Matrix.Identity()
): Vector3 | null {
  if (!matrixCoefficientsValid(transform) || !matrixCoefficientsValid(worldMatrix)) {
    return null;
  }
  try {
    const projected = Vector3.Project(world, worldMatrix, transform, viewport);
    if (!Number.isFinite(projected.x) || !Number.isFinite(projected.y)) {
      return null;
    }
    return projected;
  } catch {
    return null;
  }
}

function normalized_(x: number, y: number, z: number, fallback: Vector3): Vector3 {
  const dir = new Vector3(x, y, z);
  if (dir.lengthSquared() > 0) {
    dir.normalize();
  } else {
    return fallback.clone();
  }
  return dir;
}

/** Rotate unit +Z by quaternion without mutating engine singletons or the quaternion. */
export function unitZFromQuaternion(q: Quaternion | null | undefined): Vector3 {
  if (!q) {
    return new Vector3(0, 0, 1);
  }
  return normalized_(
    2 * (q.x * q.z + q.w * q.y),
    2 * (q.y * q.z - q.w * q.x),
    1 - 2 * (q.x * q.x + q.y * q.y),
    new Vector3(0, 0, 1)
  );
}

/** Rotate unit +Y by quaternion without mutating engine singletons or the quaternion. */
export function unitYFromQuaternion(q: Quaternion | null | undefined): Vector3 {
  if (!q) {
    return new Vector3(0, 1, 0);
  }
  return normalized_(
    2 * (q.x * q.y - q.w * q.z),
    1 - 2 * (q.x * q.x + q.z * q.z),
    2 * (q.y * q.z + q.w * q.x),
    new Vector3(0, 1, 0)
  );
}

/** Inverted copy of a quaternion (does not mutate the input). */
export function invertedQuaternion(q: Quaternion): Quaternion {
  const copy = q.clone();
  copy.invert();
  return copy;
}

/** Y tilt in degrees (0 = horizontal, 90 = upright) from a world rotation quaternion. */
export function yAngleDegreesFromQuaternion(q: Quaternion | null | undefined): number {
  if (!q) return 90;
  const uy = 1 - 2 * (q.x * q.x + q.z * q.z);
  return (180 / Math.PI) * Math.asin(Math.max(-1, Math.min(1, uy)));
}

/**
 * Read live position/orientation from a Babylon node (world pose) for script `nodeUpright()`.
 */
export function referenceOriginFromBabylonNode(
  bNode: TransformNode | AbstractMesh,
  currentOrigin: ReferenceFramewUnits = {}
): ReferenceFramewUnits {
  bNode.computeWorldMatrix(true);
  const ap = bNode.getAbsolutePosition();
  const bPositionConv = Vector3wUnits.fromRaw(
    RawVector3.fromBabylon(ap),
    'centimeters'
  );
  const position = Vector3wUnits.toTypeGranular(
    bPositionConv,
    currentOrigin.position?.x?.type ?? 'centimeters',
    currentOrigin.position?.y?.type ?? 'centimeters',
    currentOrigin.position?.z?.type ?? 'centimeters'
  );

  let bRotation: Quaternion | null = null;
  try {
    const worldMatrix = bNode.getWorldMatrix();
    const scale = new Vector3();
    const worldRot = new Quaternion();
    const pos = new Vector3();
    worldMatrix.decompose(scale, worldRot, pos);
    if (Number.isFinite(worldRot.x) && Number.isFinite(worldRot.w)) {
      bRotation = worldRot;
    }
  } catch {
    bRotation = null;
  }
  if (!bRotation) {
    bRotation =
      bNode.rotationQuaternion ??
      bNode.absoluteRotationQuaternion ??
      Quaternion.FromEulerAngles(bNode.rotation.x, bNode.rotation.y, bNode.rotation.z);
  }

  const bOrientationConv = RotationwUnits.fromRawQuaternion(
    RawQuaternion.fromBabylon(bRotation),
    'euler'
  );
  const orientation = RotationwUnits.toType(
    bOrientationConv,
    currentOrigin.orientation?.type ?? 'euler'
  );

  return {
    ...currentOrigin,
    position,
    orientation,
  };
}

/** Matches JBC `nodeUpright`: true when the node's local Y axis is within 5° of world up. */
export function isNodeUprightFromQuaternion(q: Quaternion | null | undefined): boolean {
  return yAngleDegreesFromQuaternion(q) > 5;
}

/** Stricter upright for custom-challenge "still standing" failure (within ~25° of vertical). */
export function isNodeClearlyUprightFromQuaternion(q: Quaternion | null | undefined): boolean {
  return yAngleDegreesFromQuaternion(q) > 70;
}

/** Knocked-over: inverse of JBC `nodeUpright` (yAngle ≤ 5°). */
export function isNodeKnockedOverFromQuaternion(q: Quaternion | null | undefined): boolean {
  return !isNodeUprightFromQuaternion(q);
}

export function isNodeUprightFromSceneOrientation(
  orientation: RotationwUnits | undefined
): boolean {
  if (!orientation) return true;
  const raw = RotationwUnits.toRawQuaternion(orientation);
  return isNodeUprightFromQuaternion(raw as unknown as Quaternion);
}

export function isNodeKnockedOverFromSceneOrientation(
  orientation: RotationwUnits | undefined
): boolean {
  return !isNodeUprightFromSceneOrientation(orientation);
}
