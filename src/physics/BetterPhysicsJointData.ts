import { PhysicsJointData } from 'babylonjs';
import { ReferenceFrame } from '../math';
import construct from '../util/construct';

interface BetterPhysicsJointData {
  type: 'BetterPhysicsJointData';

  a: ReferenceFrame;
  b: ReferenceFrame;

  collision?: boolean;
}

namespace BetterPhysicsJointData {
  export const create = construct<BetterPhysicsJointData>('BetterPhysicsJointData');
  export const toBabylon = (data: BetterPhysicsJointData): PhysicsJointData => data as PhysicsJointData;
  export const isBetterPhysicsJointData = (data: any): data is BetterPhysicsJointData => data.type === 'BetterPhysicsJointData';
}

export default BetterPhysicsJointData;