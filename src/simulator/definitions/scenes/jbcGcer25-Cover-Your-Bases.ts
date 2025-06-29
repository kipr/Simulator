import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCanNode, createCircleNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';

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

const circleIntersectsUpright = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));

const cans = ['can1', 'can2', 'can3', 'can4', 'can5', 'can6', 'can7'];
let circles = [false, false, false, false, false, false, false, false, false, false, false, false];
let uprights = [false, false, false, false, false, false, false, false, false, false, false, false];

scene.addOnRenderListener(() => {
  let circleCount = 0;
  let uprightCount = 0;

  for (const circle of circles) {
    if (circle) {
      circleCount++;
    }
  }
  scene.setChallengeEventValue('baseACovered', circleCount > 0);
  scene.setChallengeEventValue('baseBCovered', circleCount > 1);
  scene.setChallengeEventValue('baseCCovered', circleCount > 2);
  scene.setChallengeEventValue('baseDCovered', circleCount > 3);
  scene.setChallengeEventValue('baseECovered', circleCount > 4);
  scene.setChallengeEventValue('baseFCovered', circleCount > 5);
  scene.setChallengeEventValue('baseGCovered', circleCount > 6);

  for (const upright of uprights) {
    if (upright) {
      uprightCount++;
    }
  }
  scene.setChallengeEventValue('canAUpright', uprightCount > 0);
  scene.setChallengeEventValue('canBUpright', uprightCount > 1);
  scene.setChallengeEventValue('canCUpright', uprightCount > 2);
  scene.setChallengeEventValue('canDUpright', uprightCount > 3);
  scene.setChallengeEventValue('canEUpright', uprightCount > 4);
});

scene.addOnIntersectionListener('circle1', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[0] = visible;
  setNodeVisible('circle1', visible);
  uprights[0] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle2', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[1] = visible;
  setNodeVisible('circle2', visible);
  uprights[1] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle3', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[2] = visible;
  setNodeVisible('circle3', visible);
  uprights[2] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle4', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[3] = visible;
  setNodeVisible('circle4', visible);
  uprights[3] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle5', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[4] = visible;
  setNodeVisible('circle5', visible);
  uprights[4] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle6', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[5] = visible;
  setNodeVisible('circle6', visible);
  uprights[5] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle7', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[6] = visible;
  setNodeVisible('circle7', visible);
  uprights[6] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle8', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[7] = visible;
  setNodeVisible('circle8', visible);
  uprights[7] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle9', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[8] = visible;
  setNodeVisible('circle9', visible);
  uprights[8] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle10', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[9] = visible;
  setNodeVisible('circle10', visible);
  uprights[9] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle11', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[10] = visible;
  setNodeVisible('circle11', visible);
  uprights[10] = yAngle(otherNodeId) > 5;
}, [...cans]);

scene.addOnIntersectionListener('circle12', (type, otherNodeId) => {
  const visible = type === 'start';
  circles[11] = visible;
  setNodeVisible('circle12', visible);
  uprights[11] = yAngle(otherNodeId) > 5;
}, [...cans]);
`;

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    z: Distance.centimeters(-8),
  },
};

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
      type: "box",
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
      type: "object",
      geometryId: "notStartBox_geom",
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
        type: "basic",
        color: {
          type: "color3",
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
    can1: createCanNode(1, {
      x: Distance.centimeters(24),
      y: Distance.centimeters(0),
      z: Distance.centimeters(15.5),
    }),
    can2: createCanNode(2, {
      x: Distance.centimeters(16),
      y: Distance.centimeters(0),
      z: Distance.centimeters(15.5),
    }),
    can3: createCanNode(3, {
      x: Distance.centimeters(8),
      y: Distance.centimeters(0),
      z: Distance.centimeters(15.5),
    }),
    can4: createCanNode(4, {
      x: Distance.centimeters(0),
      y: Distance.centimeters(0),
      z: Distance.centimeters(15.5),
    }),
    can5: createCanNode(5, {
      x: Distance.centimeters(-8),
      y: Distance.centimeters(0),
      z: Distance.centimeters(15.5),
    }),
    can6: createCanNode(5, {
      x: Distance.centimeters(-16),
      y: Distance.centimeters(0),
      z: Distance.centimeters(15.5),
    }),
    can7: createCanNode(7, {
      x: Distance.centimeters(-24),
      y: Distance.centimeters(0),
      z: Distance.centimeters(15.5),
    }),
    circle1: createCircleNode(1),
    circle2: createCircleNode(2),
    circle3: createCircleNode(3),
    circle4: createCircleNode(4),
    circle5: createCircleNode(5),
    circle6: createCircleNode(6),
    circle7: createCircleNode(7),
    circle8: createCircleNode(8),
    circle9: createCircleNode(9),
    circle10: createCircleNode(10),
    circle11: createCircleNode(11),
    circle12: createCircleNode(12),
  },
};
