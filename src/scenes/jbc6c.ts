import Scene from "../state/State/Scene";
import { Color } from '../state/State/Scene/Color';
// import { Vector3, Quaternion, ReferenceFrame } from "../math";
// import { Color3, StandardMaterial, GlowLayer } from 'babylonjs';
import Script from '../state/State/Scene/Script';
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import tr from '@i18n';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
// import jbc6c from "../challenges/jbc6c";

const baseScene = createBaseSceneSurfaceA();

const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When the the green garage can is intersecting circle 2, the circle glows.

scene.addOnIntersectionListener('can1', (type, otherNodeId) => {
  console.log('Can 1 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('canAPlaced', visible);
  setNodeVisible('circle2', visible);
}, 'circle2');

// When the the blue garage can is intersecting circle 10, the circle glows.

scene.addOnIntersectionListener('can2', (type, otherNodeId) => {
  console.log('Can 2 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('canBPlaced', visible);
  setNodeVisible('circle10', visible);
}, 'circle10');

// When the the yellow garage can is intersecting circle 9, the circle glows.

scene.addOnIntersectionListener('can3', (type, otherNodeId) => {
  console.log('Can 3 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('canCPlaced', visible);
  setNodeVisible('circle9', visible);
}, 'circle9');
`;

const surfaceIntersect = `
// When a can is not intersecting the mat, the lift condition is met.

scene.addOnIntersectionListener('mainSurface', (type, otherNodeId) => {
  switch (otherNodeId) {
    case 'can1':
      // console.log('Can 1 lifted!', type, otherNodeId);
      if (scene.programStatus === 'running') {
        scene.setChallengeEventValue('canALifted', type === 'end');
      }
      break;
    case 'can2':
      // console.log('Can 2 lifted!', type, otherNodeId);
      if (scene.programStatus === 'running') {
        scene.setChallengeEventValue('canBLifted', type === 'end');
      }
      break;
    case 'can3':
      // console.log('Can 3 lifted!', type, otherNodeId);
      if (scene.programStatus === 'running') {
        scene.setChallengeEventValue('canCLifted', type === 'end');
      }
      break;
  }
}, ['can1', 'can2', 'can3']);
`;

const uprightCans = `
// When a can is standing upright, the upright condition is met.

// let startTime = Date.now();
const EULER_IDENTITY = Rotation.Euler.identity();
// const startingOrientationInv = (nodeId) => Quaternion.inverse(Rotation.toRawQuaternion(scene.nodes[nodeId].startingOrigin.orientation || EULER_IDENTITY));
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));


scene.addOnRenderListener(() => {
  // const currTime = Date.now();
  // const timeDiff = currTime - startTime;
  const upright1 = yAngle('can1') < 5;
  const upright2 = yAngle('can2') < 5;
  const upright3 = yAngle('can3') < 5;
  // if(timeDiff > 1000) {
  //   console.log('can1 angle: ', yAngle('can1'));
  //   startTime = currTime;
  // }
  scene.setChallengeEventValue('canAUpright', upright1);
  scene.setChallengeEventValue('canBUpright', upright2);
  scene.setChallengeEventValue('canCUpright', upright3);
});
`;

export const JBC_6C: Scene = {
  ...baseScene,
  name: tr('JBC 6C'),
  description: tr('Junior Botball Challenge 6C: Empty the Garage'),
  scripts: {
    'circleIntersects': Script.ecmaScript('Circle Intersects', circleIntersects),
    'surfaceIntersect': Script.ecmaScript('Surface Intersect', surfaceIntersect),
    'uprightCans': Script.ecmaScript('Upright Cans', uprightCans),
  },
  geometry: {
    ...baseScene.geometry,
    'circle2_geom': {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    'circle9_geom': {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    'circle10_geom': {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    'mainSurface_geom': {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    'circle2': {
      type: 'object',
      geometryId: 'circle2_geom',
      name: tr('Circle 2'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(28.8),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    'circle9': {
      type: 'object',
      geometryId: 'circle9_geom',
      name: tr('Circle 9'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(85.4),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    'circle10': {
      type: 'object',
      geometryId: 'circle10_geom',
      name: tr('Circle 10'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(19.3),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(96.9),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    'mainSurface': {
      type: 'object',
      geometryId: 'mainSurface_geom',
      name: tr('Mat Surface'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 0)
        }
      },
    },
    'can1': createCanNode(1, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(53.3) }),
    'can2': createCanNode(2, { x: Distance.centimeters(18.5), y: Distance.centimeters(0), z: Distance.centimeters(78) }),
    'can3': createCanNode(3, { x: Distance.centimeters(-12.3), y: Distance.centimeters(0), z: Distance.centimeters(93.9) }),
  }
};