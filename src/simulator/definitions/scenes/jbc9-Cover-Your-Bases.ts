import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCanNode, createCircleNode } from './jbcBase';
import tr from '@i18n';
import { matAStartGeoms, matAStartNodes, nodeUpright, setNodeVisible, notInStartBox } from './jbcCommonComponents';

const baseScene = createBaseSceneSurfaceA();

const circleIntersectsUpright = `
${setNodeVisible}
${nodeUpright}
const cans = new Map([
['can1', false],
['can2', false],
['can3', false],
['can4', false],
['can5', false],
['can6', false],
['can7', false],
]);

// Rules for jbc9 are updated:
// There may be more that one circle on a can.
scene.addOnRenderListener(() => {
  if(scene.programStatus === 'running'){
    const covered = new Map(cans.entries().filter((c) => c[1]));
    scene.setChallengeEventValue('baseACovered', covered.size > 0);
    scene.setChallengeEventValue('baseBCovered', covered.size > 1);
    scene.setChallengeEventValue('baseCCovered', covered.size > 2);
    scene.setChallengeEventValue('baseDCovered', covered.size > 3);
    scene.setChallengeEventValue('baseECovered', covered.size > 4);
    const notUpright = covered.keys().reduce((count, k) => !nodeUpright(k) ? ++count : count, 0);
    scene.setChallengeEventValue('canANotUpright', notUpright > 0);
    scene.setChallengeEventValue('canBNotUpright', notUpright > 1);
    scene.setChallengeEventValue('canCNotUpright', notUpright > 2);
    scene.setChallengeEventValue('canDNotUpright', notUpright > 3);
    scene.setChallengeEventValue('canENotUpright', notUpright > 4);
  }
  // Users must complete challenge in one run
  else {
    for (const k of cans.keys()) {
      cans.set(k, false);
    }
  }
});

for (let i = 0; i < cans.size; i++) {
  const circleName = 'circle' + (i + 1);
  scene.addOnIntersectionListener(circleName, (type, otherNodeId) => {
    cans.set(otherNodeId, type === 'start');
    //console.log(circleName, otherNodeId, type, cans);
  }, cans.keys().toArray());
}
`;

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    z: Distance.centimeters(-10),
  },
};

export const JBC_9: Scene = {
  ...baseScene,
  name: tr('JBC 9'),
  description: tr('Junior Botball Challenge 9: Cover Your Bases'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    circleIntersectsUpright: Script.ecmaScript('Circle Intersects Upright', circleIntersectsUpright),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
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
  },
};
