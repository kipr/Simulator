import {
  Scene as babylonScene, Quaternion, Vector3, Mesh,
  PhysicsConstraintAxis, Physics6DoFConstraint,
  HingeConstraint, PhysicsConstraintAxisLimitMode,
  GizmoManager
} from '@babylonjs/core';

import Node from '../../../state/State/Robot/Node';
import { Vector3wUnits } from '../../../util/math/unitMath';
import { RENDER_SCALE } from '../../../components/constants/renderConstants';
import { RawVector3 } from '../../../util/math/math';




/**
 * Creates a hinge joint and 6DoF constraint between the parent and child meshes.
 * Adds a physics constraint between a parent and child link.
 *
 * @param id - The ID of the hinge joint. A string that likely uniquely identifies the hinge joint.
 * @param hinge - The hinge joint object containing parent and child information. An object that contains information about the hinge joint,
 *          including the parent's pivot point, the child's pivot point, and the axes of rotation for both the parent and child.
 * @param bScene_ - The Babylon scene in which the parent and child objects exist.
 * @param bParent - The parent mesh.
 * @param bChild - The child mesh.
 * @returns The created 6DoF constraint.
 */
export const createHinge = (
  id: string,
  hinge: Node.HingeJoint & { parentId: string },
  bScene_: babylonScene,
  bParent: Mesh,
  bChild: Mesh) => {
  // Begin by moving the child in place (this prevents inertial snap as the
  // physics engine applys the constraint).
  bChild.setParent(bParent);
  bChild.position.x = Vector3wUnits.toBabylon(hinge.parentPivot, 'meters')._x;
  bChild.position.y = Vector3wUnits.toBabylon(hinge.parentPivot, 'meters')._y;
  bChild.position.z = Vector3wUnits.toBabylon(hinge.parentPivot, 'meters')._z;
  bChild.rotationQuaternion = hinge.childRotationQuaternion ?? Quaternion.FromEulerAngles(0, 0, 0);

  // The 6DoF constraint is used for motorized joints. Unforunately, it is not possible to
  // completely lock these joints as hinges, so we also apply a hinge constraint.
  // Order appears to matter here, the hinge should come before the 6DoF constraint.
  // The 6DoF constraint uses ANGULAR_Z as the rotation axis, which is the cross
  // product of axisA (X) and perpAxisA (Y). We need to pass this computed hinge
  // axis to the HingeConstraint for rigidity.
  const hingeAxisParent = RawVector3.cross(hinge.parentAxis, hinge.parentPerpAxis);
  const hingeAxisChild = RawVector3.cross(hinge.childAxis, hinge.childPerpAxis);

  // Add HingeConstraint for rigidity (prevents rotation around non-hinge axes)
  const hingeJoint = new HingeConstraint(
    Vector3wUnits.toBabylon(hinge.parentPivot, RENDER_SCALE),
    Vector3wUnits.toBabylon(hinge.childPivot, RENDER_SCALE),
    RawVector3.toBabylon(hingeAxisParent),
    RawVector3.toBabylon(hingeAxisChild),
    bScene_
  );
  bParent.physicsBody.addConstraint(bChild.physicsBody, hingeJoint);
    
  const joint: Physics6DoFConstraint = new Physics6DoFConstraint({
    pivotA: Vector3wUnits.toBabylon(hinge.parentPivot, RENDER_SCALE),
    pivotB: Vector3wUnits.toBabylon(hinge.childPivot, RENDER_SCALE),
    axisA: RawVector3.toBabylon(hinge.parentAxis),
    axisB: RawVector3.toBabylon(hinge.childAxis),
    perpAxisA: RawVector3.toBabylon(hinge.parentPerpAxis),
    perpAxisB: RawVector3.toBabylon(hinge.childPerpAxis),
  },
  [
    {
      axis: PhysicsConstraintAxis.ANGULAR_Z,
      minLimit: -30 * Math.PI / 180, maxLimit: -30 * Math.PI / 180,
    }
  ],
  bScene_
  );

  // locks all axes of the Physics6DoFConstraint object, effectively making it behave like a hinge joint.
  // The function then returns the Physics6DoFConstraint object.
  bParent.physicsBody.addConstraint(bChild.physicsBody, joint);
  joint.setAxisMode(PhysicsConstraintAxis.LINEAR_X, PhysicsConstraintAxisLimitMode.LOCKED);
  joint.setAxisMode(PhysicsConstraintAxis.LINEAR_Y, PhysicsConstraintAxisLimitMode.LOCKED);
  joint.setAxisMode(PhysicsConstraintAxis.LINEAR_Z, PhysicsConstraintAxisLimitMode.LOCKED);
  joint.setAxisMode(PhysicsConstraintAxis.ANGULAR_X, PhysicsConstraintAxisLimitMode.LOCKED);
  joint.setAxisMode(PhysicsConstraintAxis.ANGULAR_Y, PhysicsConstraintAxisLimitMode.LOCKED);
  return joint;
};
