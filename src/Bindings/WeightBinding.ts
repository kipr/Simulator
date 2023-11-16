
import { Scene as babylScene, CreateSphere, Vector3, Mesh, 
  PhysicsAggregate,   PhysicsShapeType, LockConstraint,  
} from '@babylonjs/core';

import Node from '../state/State/Robot/Node';
import { ReferenceFramewUnits } from '../util/math/UnitMath';
import { RENDER_SCALE } from '../components/Constants/renderConstants';
import { Mass } from '../util/math/Value';
import Robot from '../state/State/Robot';
import Dict from '../util/objectOps/Dict';

// Adds an invisible weight to a parent link.
export const createWeight_ = (id: string, weight: Node.Weight, bScene_: babylScene, robot_: Robot, links_: Dict<Mesh>) => {
  const ret = CreateSphere(id, { diameter: 1 }, bScene_);
  ret.visibility = 0;

  const parent = robot_.nodes[weight.parentId];
  if (!parent) throw new Error(`Missing parent: "${weight.parentId}" for weight "${id}"`);
  if (parent.type !== Node.Type.Link) throw new Error(`Invalid parent type: "${parent.type}" for weight "${id}"`);
  
  const aggregate = new PhysicsAggregate(ret, PhysicsShapeType.CYLINDER, {
    mass: Mass.toGramsValue(weight.mass),
    friction: 0,
    restitution: 0,
  }, bScene_);

  const bParent = links_[weight.parentId];
  if (!bParent) throw new Error(`Missing parent instantiation: "${weight.parentId}" for weight "${id}"`);

  const bOrigin = ReferenceFramewUnits.toBabylon(weight.origin, RENDER_SCALE);

  const constraint = new LockConstraint(
    bOrigin.position,
    new Vector3(0,0,0), // RawVector3.toBabylon(new Vector3(-8,10,0)), // updown, frontback
    Vector3.Up(),
    Vector3.Up().applyRotationQuaternion(bOrigin.rotationQuaternion.invert()),
    bScene_
  );

  bParent.physicsBody.addConstraint(ret.physicsBody, constraint);
  
  return ret;
};