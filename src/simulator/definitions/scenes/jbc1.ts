import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import { Distance } from "../../../util";
import Script from '../../../state/State/Scene/Script';
import { Color } from '../../../state/State/Scene/Color';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When the can (can9) is intersecting circle9, the circle glows

scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  console.log('Can 9 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can9Intersects', visible);
  setNodeVisible('circle9', visible);
}, 'circle9');

`;

const leftStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
  
}, 'startBox');
`;

const enterStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('returnStartBox', type === 'start');
  }
}, 'startBox');
`;

const robotTouches = `
// scene.onBind = nodeId => {
//   scene.addOnCollisionListener(nodeId, (otherNodeId, point)=> {
//     console.log('Can 9 touched!', otherNodeId, point);
//     scene.setChallengeEventValue(nodeId + 'Touched', true);
//   }, 'robot');
// };
scene.addOnCollisionListener('can9', (otherNodeId) => {
  console.log('Robot touched Can 9!');
  scene.setChallengeEventValue('can9Touched', true);
}, 'robot');
`;

const uprightCans = `
// When a can is standing upright, the upright condition is met.

// let startTime = Date.now();
const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
// const startingOrientationInv = (nodeId) => Quaternion.inverse(RotationwUnits.toRawQuaternion(scene.nodes[nodeId].startingOrigin.orientation || EULER_IDENTITY));
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));


scene.addOnRenderListener(() => {
  const upright9 = yAngle('can9') > 5;
  // console.log('can9 angle: ', yAngle('can9'));
  scene.setChallengeEventValue('can9Upright', upright9);

});
`;

export const JBC_1: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 1' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 1: Tag, You're It!` },
  scripts: {
    'circleIntersects': Script.ecmaScript('Circle Intersects', circleIntersects),
    'uprightCans': Script.ecmaScript('Upright Cans', uprightCans),
    'robotTouches': Script.ecmaScript('Robot Touches', robotTouches),
    'leftStartBox': Script.ecmaScript('Robot Left Start', leftStartBox),
    'enterStartBox': Script.ecmaScript('Robot Reentered Start',enterStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    'circle9_geom': {
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
    'startBox_geom': {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.inches(10),
      },
    },
  },
  
  nodes: {
    ...baseScene.nodes,
    'mainSurface': {
      type: 'object',
      geometryId: 'mainSurface_geom',
      name: { [LocalizedString.EN_US]: 'Mat Surface' },
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
    'circle9': {
      type: 'object',
      geometryId: 'circle9_geom',
      name: { [LocalizedString.EN_US]: 'Circle 9' },
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
    'startBox': {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
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
    'can9': {
      ...createCanNode(9, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(85.4) }),
      scriptIds: ['robotTouches']
    }
    
  }
  
};
