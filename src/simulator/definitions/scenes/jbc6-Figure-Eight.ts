import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import { Distance } from '../../../util';
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

// When the can (can4) is intersecting circle4, the circle glows

scene.addOnIntersectionListener('can4', (type, otherNodeId) => {
  // console.log('Can 4 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can4Intersects', visible);
  setNodeVisible('circle4', visible);
}, 'circle4');

// When the can (can9) is intersecting circle9, the circle glows

scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  // console.log('Can 9 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can9Intersects', visible);
  setNodeVisible('circle9', visible);
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

const passedSide = `

let count = 0;
let position = 0;

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {

  if(otherNodeId == 'startBox'){
    count = 0;
    position = 0;
  }

  if(type === 'start'){
    position++;
    // console.log(count + ':" + otherNodeId + ":" + type + ":Position:' +position );
  }

  //Sets values for second crossing in the middle
  if(count == 2 && (otherNodeId == 'n1')){
    count++;
    position = 3;
    // console.log(count + ':" + otherNodeId + ":' + type);
  }
  if(type==='start' && (otherNodeId == 'n' +position)){
    count++;
    // console.log(count + ':" + otherNodeId + ":' + type);
  }

  //Passed three checkmarks and recently passed the middle checkmark
  if(count == 3 && otherNodeId == 'n1'){
    scene.setChallengeEventValue('figureEight', true);
  }
  else{
    scene.setChallengeEventValue('figureEight', false);
  }

  if(position == 0 ){
    count = 0;
  }
}, ['startBox', 'n1', 'n2']);

`;
const uprightCans = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));

scene.addOnRenderListener(() => {
  const upright4 = Math.abs(yAngle('can4') + 90) < 5;
  const upright9 = Math.abs(yAngle('can9') + 90) < 5;

  scene.setChallengeEventValue('can4Upright', upright4);
  scene.setChallengeEventValue('can9Upright', upright9);
});
`;

export const JBC_6: Scene = {
  ...baseScene,
  name: tr('JBC 6'),
  description: tr('Junior Botball Challenge 6: Figure Eight'),
  scripts: {
    notInStartBox: Script.ecmaScript('Robot not in Start Box', notInStartBox),
    circleIntersects: Script.ecmaScript('Circle Intersects', circleIntersects),
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    passedSide: Script.ecmaScript('Passed Side', passedSide),
    enterStartBox: Script.ecmaScript('Robot Reentered Start', enterStartBox),
  },

  geometry: {
    ...baseScene.geometry,
    notStartBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(0),
      },
    },
    leftCan4_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(150),
        y: Distance.centimeters(1),
        z: Distance.centimeters(5),
      },
    },
    middle_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(-1),
        y: Distance.centimeters(-8),
        z: Distance.centimeters(30),
      },
    },
    rightCan9_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(150),
        y: Distance.centimeters(1),
        z: Distance.centimeters(5),
      },
    },
    topCan9_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(-1),
        y: Distance.centimeters(-8),
        z: Distance.centimeters(50),
      },
    },
    rightCan4_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(150),
        y: Distance.centimeters(1),
        z: Distance.centimeters(5),
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
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(0),
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
    n1: {
      type: 'object',
      geometryId: 'middle_geom',
      name: tr('Between cans 4 and 9'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(70),
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

    n2: {
      type: 'object',
      geometryId: 'topCan9_geom',
      name: tr('Top side of can 9'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(115),
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

    circle4: createCircleNode(4),
    circle9: createCircleNode(9),
    can4: createCanNode(4),
    can9: createCanNode(9),
  },
};
