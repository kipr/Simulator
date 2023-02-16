import Scene from '../state/State/Scene';
import { ReferenceFrame } from '../unit-math';
import { Distance } from '../util';
import LocalizedString from '../util/LocalizedString';
import Script from '../state/State/Scene/Script';
import { createBaseSceneSurfaceB, createCanNode } from './jbcBase';
import { Color } from '../state/State/Scene/Color';

const baseScene = createBaseSceneSurfaceB();

const lineBIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// If the robot touches Line B, failed challenge

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot Touching Line B!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('robotTouchingLine', visible);
}, 'lineB');

`;


const leftStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
  
}, 'startBox');
`;
const uprightCans = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = Rotation.Euler.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));

scene.addOnRenderListener(() => {

  const upright1 = yAngle('can1') < 5;
  scene.setChallengeEventValue('can1Upright', upright1);

});
`;
const ROBOT_ORIGIN: ReferenceFrame = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    x: Distance.centimeters(-15),
  },
};
export const JBC_10: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 10' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 10: Solo Joust',
  },
  scripts: {
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    leftStartBox: Script.ecmaScript('Robot Left Start', leftStartBox),
    lineBIntersects: Script.ecmaScript('Robot Line B', lineBIntersects),
  },
  geometry: {
    ...baseScene.geometry,
    mainSurface_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(1.77),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
      },
    },
    lineB_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(0.5),
        y: Distance.centimeters(0.1),
        z: Distance.meters(1.77),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    robot: {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN,
    },
    mainSurface: {
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
          color: Color.rgb(0, 0, 0),
        },
      },
    },
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(-90),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(-3),
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
    lineB: {
      type: 'object',
      geometryId: 'lineB_geom',
      name: { [LocalizedString.EN_US]: 'Line B' },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
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
    can1: {
      ...createCanNode(1,{
        x: Distance.centimeters(11),
        y: Distance.centimeters(0),
        z: Distance.centimeters(91),
      }),
      scriptIds: ["startBoxIntersects", "uprightCans", "lineBIntersects"],

    },
  },
};
