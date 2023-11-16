
import { Scene as babylScene, Quaternion, Vector3, Mesh, 
  PhysicsConstraintAxis, Physics6DoFConstraint,
  HingeConstraint, PhysicsConstraintAxisLimitMode 
} from '@babylonjs/core';

import Node from '../state/State/Robot/Node';
import { Vector3wUnits } from '../util/math/UnitMath';
import { RENDER_SCALE } from '../components/Constants/renderConstants';
import { RawVector3 } from '../util/math/math';




// Adds a physics constraint between a parent and child link.
export const createHinge_ = (id: string, hinge: Node.HingeJoint & { parentId: string }, bScene_: babylScene, bParent: Mesh, bChild: Mesh) => {
  // Begin by moving the child in place (this prevents inertial snap as the physics engine applys the constraint)
//   const { bParent, bChild } = this.bParentChild_(id, hinge.parentId);
  bChild.setParent(bParent);
  bChild.position.x = Vector3wUnits.toBabylon(hinge.parentPivot, 'meters')._x;
  bChild.position.y = Vector3wUnits.toBabylon(hinge.parentPivot, 'meters')._y;
  bChild.position.z = Vector3wUnits.toBabylon(hinge.parentPivot, 'meters')._z;
  bChild.rotationQuaternion = Quaternion.FromEulerAngles(hinge.parentAxis.z * 3.1415 / 2, 0, 0);
  
  // The 6DoF constraint is used for motorized joints. Unforunately, it is not possible to
  // completely lock these joints as hinges, so we also apply a hinge constraint.
  // Order appears to matter here, the hinge should come before the 6DoF constraint.
  if (id.includes("claw")) {
    const hingeJoint = new HingeConstraint(
      Vector3wUnits.toBabylon(hinge.parentPivot, RENDER_SCALE),
      Vector3wUnits.toBabylon(hinge.childPivot, RENDER_SCALE),
      new Vector3(0,0,1), 
      new Vector3(0,1,0),
      bScene_
    );
    bParent.physicsBody.addConstraint(bChild.physicsBody, hingeJoint);
  } else if (id.includes("arm")) {
    const hingeJoint = new HingeConstraint(
      Vector3wUnits.toBabylon(hinge.parentPivot, RENDER_SCALE),
      Vector3wUnits.toBabylon(hinge.childPivot, RENDER_SCALE),
      new Vector3(0,0,1),
      new Vector3(0,-1,0),
      bScene_
    );
    bParent.physicsBody.addConstraint(bChild.physicsBody, hingeJoint);
  } else if (id.includes("wheel")) {
    const hingeJoint = new HingeConstraint(
      Vector3wUnits.toBabylon(hinge.parentPivot, RENDER_SCALE),
      Vector3wUnits.toBabylon(hinge.childPivot, RENDER_SCALE),
      new Vector3(0,1,0),
      undefined, 
      bScene_
    );
    bParent.physicsBody.addConstraint(bChild.physicsBody, hingeJoint);
  }
  const joint: Physics6DoFConstraint = new Physics6DoFConstraint({
    pivotA: Vector3wUnits.toBabylon(hinge.parentPivot, RENDER_SCALE),
    pivotB: Vector3wUnits.toBabylon(hinge.childPivot, RENDER_SCALE),
    axisA: new Vector3(1,0,0),
    axisB: new Vector3(1,0,0),
    perpAxisA: new Vector3(0,-1,0), // bChildAxis, //
    perpAxisB: RawVector3.toBabylon(hinge.parentAxis),
  },
  [
    {
      axis: PhysicsConstraintAxis.ANGULAR_Z,
      minLimit: -30 * Math.PI / 180, maxLimit: -30 * Math.PI / 180,
    }
  ],
  bScene_
  );
  
  bParent.physicsBody.addConstraint(bChild.physicsBody, joint);
  joint.setAxisMode(PhysicsConstraintAxis.LINEAR_X, PhysicsConstraintAxisLimitMode.LOCKED);
  joint.setAxisMode(PhysicsConstraintAxis.LINEAR_Y, PhysicsConstraintAxisLimitMode.LOCKED);
  joint.setAxisMode(PhysicsConstraintAxis.LINEAR_Z, PhysicsConstraintAxisLimitMode.LOCKED);
  joint.setAxisMode(PhysicsConstraintAxis.ANGULAR_X, PhysicsConstraintAxisLimitMode.LOCKED);
  joint.setAxisMode(PhysicsConstraintAxis.ANGULAR_Y, PhysicsConstraintAxisLimitMode.LOCKED);
  return joint;
};