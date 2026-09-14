import { RawQuaternion, RawVector3 } from '../../util/math/math';

const normalizeQuaternion = (q: RawQuaternion): RawQuaternion => {
  const length = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
  return RawQuaternion.create(q.x / length, q.y / length, q.z / length, q.w / length);
};

const multiplyQuaternions = (lhs: RawQuaternion, rhs: RawQuaternion): RawQuaternion => RawQuaternion.create(
  lhs.w * rhs.x + lhs.x * rhs.w + lhs.y * rhs.z - lhs.z * rhs.y,
  lhs.w * rhs.y - lhs.x * rhs.z + lhs.y * rhs.w + lhs.z * rhs.x,
  lhs.w * rhs.z + lhs.x * rhs.y - lhs.y * rhs.x + lhs.z * rhs.w,
  lhs.w * rhs.w - lhs.x * rhs.x - lhs.y * rhs.y - lhs.z * rhs.z,
);

const inverseQuaternion = (q: RawQuaternion): RawQuaternion => {
  const lengthSquared = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
  return RawQuaternion.create(
    -q.x / lengthSquared,
    -q.y / lengthSquared,
    -q.z / lengthSquared,
    q.w / lengthSquared,
  );
};

/**
 * Returns the orientation of a child in its parent's coordinate system.
 * Unlike subtracting Euler angles, this is unaffected by the robot's world pose.
 */
export const parentRelativeOrientation = (
  parentOrientation: RawQuaternion,
  childOrientation: RawQuaternion,
): RawQuaternion => normalizeQuaternion(multiplyQuaternions(
  inverseQuaternion(parentOrientation),
  childOrientation,
));

/**
 * Measures the signed hinge rotation between two parent-relative orientations.
 * The quaternion delta is reduced to its twist around the hinge axis so small
 * amounts of swing introduced by the physics solver do not affect the encoder.
 */
export const incrementalHingeRotation = (
  previousOrientation: RawQuaternion,
  currentOrientation: RawQuaternion,
  hingeAxis: RawVector3,
): number => {
  let delta = normalizeQuaternion(multiplyQuaternions(
    currentOrientation,
    inverseQuaternion(previousOrientation),
  ));

  // q and -q describe the same orientation. Choose the representation whose
  // rotation is at most PI so a quaternion sign change cannot add a revolution.
  if (delta.w < 0) {
    delta = RawQuaternion.create(-delta.x, -delta.y, -delta.z, -delta.w);
  }

  const axis = RawVector3.normalize(hingeAxis);
  const projectedSinHalfAngle = RawVector3.dot(RawQuaternion.axis(delta), axis);

  return 2 * Math.atan2(projectedSinHalfAngle, delta.w);
};
