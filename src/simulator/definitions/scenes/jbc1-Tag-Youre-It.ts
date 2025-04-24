import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import { Distance } from '../../../util';
import Script from '../../../state/State/Scene/Script';
import { Color } from '../../../state/State/Scene/Color';
import { createCanNode, createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
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

const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When the can is intersecting circle9, the circle glows
scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  // console.log('Can 9 on circle!', type, otherNodeId);
  scene.setChallengeEventValue('can9Intersects', type === 'start');
}, 'circle9');
`;

const enterStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('returnStartBox', type === 'start');
  }
}, 'startBox');
`;

const robotTouches = `
scene.addOnCollisionListener('can9', (otherNodeId) => {
  // console.log('Robot touched Can 9!');
  scene.setChallengeEventValue('can9Touched', true);
}, 'robot');
`;

const uprightCans = `
// Upright Condition
const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));

scene.addOnRenderListener(() => {
  const upright9 = yAngle('can9') > 5;
  scene.setChallengeEventValue('can9Upright', upright9);
});
`;

export const JBC_1: Scene = {
  ...baseScene,
  name: tr('JBC 1'),
  description: tr('Junior Botball Challenge 1: Tag, You\'re It!'),
  scripts: {
    'notInStartBox': Script.ecmaScript('Not In Start Box', notInStartBox),
    'circleIntersects': Script.ecmaScript('Circle Intersects', circleIntersects),
    'uprightCans': Script.ecmaScript('Upright Cans', uprightCans),
    'robotTouches': Script.ecmaScript('Robot Touches', robotTouches),
    'enterStartBox': Script.ecmaScript('Robot Reentered Start', enterStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.inches(10),
      },
    },
    notStartBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    'startBox': {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(2),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(0, 255, 255),
        },
      },
    },
    notStartBox: {
      type: 'object',
      geometryId: 'notStartBox_geom',
      name: tr('Not Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-1.9),
          z: Distance.meters(1.208),
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
    can9: createCanNode(9),
    circle9: createCircleNode(9),
  }
};
