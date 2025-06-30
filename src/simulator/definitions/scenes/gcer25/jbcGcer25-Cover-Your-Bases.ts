import Scene from '../../../../state/State/Scene';
import { ReferenceFramewUnits } from '../../../../util/math/unitMath';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCanNode, createCircleNode } from '../jbcBase';
import { Color } from '../../../../state/State/Scene/Color';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

// Required for nested template strings
/* eslint-disable no-useless-escape */
const circleIntersectsUpright = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));

const cans = ['can1', 'can2', 'can3', 'can4', 'can5', 'can6', 'can7'];
let circles = [];
let uprights = [];

scene.addOnRenderListener(() => {
  let circleCount = 0;
  let uprightCount = 0;

  circleCount = circles.reduce((sum, circle) => circle ? sum + 1 : sum, circleCount);

  scene.setChallengeEventValue('baseACovered', circleCount > 0);
  scene.setChallengeEventValue('baseBCovered', circleCount > 1);
  scene.setChallengeEventValue('baseCCovered', circleCount > 2);
  scene.setChallengeEventValue('baseDCovered', circleCount > 3);
  scene.setChallengeEventValue('baseECovered', circleCount > 4);
  scene.setChallengeEventValue('baseFCovered', circleCount > 5);
  scene.setChallengeEventValue('baseGCovered', circleCount > 6);

  uprightCount = uprights.reduce((sum, upright) => upright ? sum + 1 : sum, uprightCount);

  scene.setChallengeEventValue('canAUpright', uprightCount > 0);
  scene.setChallengeEventValue('canBUpright', uprightCount > 1);
  scene.setChallengeEventValue('canCUpright', uprightCount > 2);
  scene.setChallengeEventValue('canDUpright', uprightCount > 3);
  scene.setChallengeEventValue('canEUpright', uprightCount > 4);
  scene.setChallengeEventValue('canFUpright', uprightCount > 5);
  scene.setChallengeEventValue('canGUpright', uprightCount > 6);
});

for (let i = 0; i < 12; i++) {
  scene.addOnIntersectionListener(\`circle\$\{i + 1\}\`, (type, otherNodeId) => {
    const visible = type === 'start';
    circles[i] = visible;
    setNodeVisible(\`circle\$\{i + 1\}\`, visible);
    uprights[i] = yAngle(otherNodeId) > 5;
  }, [...cans]);
}
`;
/* eslint-enable no-useless-escape */

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    z: Distance.centimeters(-8),
  },
};

const CANS = {};
for (let i = 1; i < 8; i++) {
  CANS[`can${i}`] = createCanNode(i, {
    x: Distance.centimeters(24 - (8 * (i - 1))),
    y: Distance.centimeters(0),
    z: Distance.centimeters(15.5),
  });
}
const CIRCLES = {};
for (let i = 1; i < 13; i++) {
  CIRCLES[`circle${i}`] = createCircleNode(i);
}

export const Cover_Your_Bases: Scene = {
  ...baseScene,
  name: tr('GCER 2025: Cover Your Bases'),
  description: tr('GCER 2025 special edition. All circles are now open for business!'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    circleIntersectsUpright: Script.ecmaScript('Circle Intersects Upright', circleIntersectsUpright),
  },
  geometry: {
    ...baseScene.geometry,
    notStartBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.14),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    notStartBox: {
      type: 'object',
      geometryId: 'notStartBox_geom',
      name: tr('Not Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-1.9),
          z: Distance.meters(1.188),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },
    // The normal starting position of the robot covers the tape
    // Start the robot back a bit so that a can fits on the tape in front of the robot
    robot: {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN,
    },
    ...CANS,
    ...CIRCLES,
  },
};
