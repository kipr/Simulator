import Scene from '../../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits } from '../../../../util/math/unitMath';
import { canPositions } from '../jbcBase';
import { JBC_23 } from '../jbc23-Find-the-Black-Line';

import tr from '@i18n';

const selectedCircle = canPositions[Math.floor(Math.random() * canPositions.length)];

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: { ...selectedCircle },
  orientation: RotationwUnits.eulerDegrees(0, 180, 0)
};

export const Find_The_Black_Line: Scene = {
  ...JBC_23,
  name: tr('GCER 2025: Find the Black Line'),
  description: tr('GCER 2025 special event. Your robot is randomly placed on one of the red circles. Find the black starting line and stop. Bonus points for returning to the original starting circle.'),
  nodes: {
    ...JBC_23.nodes,
    robot: {
      ...JBC_23.nodes['robot'],
      origin: ROBOT_ORIGIN,
      startingOrigin: ROBOT_ORIGIN,
    },
    circle: {
      ...JBC_23.nodes['circle'],
      origin: {
        position: {
          ...selectedCircle,
        },
      },
    },
  },
};
