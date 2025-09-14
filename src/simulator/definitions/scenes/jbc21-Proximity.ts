import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, canPositions } from './jbcBase';
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

const stopAtReam = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot close enough to ream', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('stopAtReam', type === 'start');
  }
}, 'reamFrontBoundary');
// scene.addOnCollisionListener('reamFrontBoundary', (otherNodeId) => {
//   if(scene.programStatus === 'running'){
//     scene.setChallengeEventValue('stopAtReam', true);
//   }
// }, 'claw');
`;

const bumpReam = `
// console.log('Bump Ream script loaded');
scene.addOnCollisionListener('ream1', (otherNodeId) => {
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('touchedReam', true);
  }
}, 'robot');
`;

function randomCircle(): [Vector3wUnits, Vector3wUnits] {
  const circles = [3, 5, 8, 10];
  const randomCircle = circles[Math.floor(Math.random() * circles.length)];
  const circle: Vector3wUnits = {
    ...canPositions[randomCircle],
    y: Distance.centimeters(5),
  };
  const boundary: Vector3wUnits = {
    ...canPositions[randomCircle],
    y: Distance.centimeters(3.825),
    z: Distance.subtract(canPositions[randomCircle].z, Distance.inches(3.125), 'inches'),
  };
  return [circle, boundary];
}

const newRandomCircle = randomCircle();

const REAM1_ORIGIN: ReferenceFramewUnits = {
  position: {
    ...newRandomCircle[0],
  },
  orientation: RotationwUnits.eulerDegrees(90, 0, 0)
};

const REAM_FRONT_BOUNDARY_ORIGIN: ReferenceFramewUnits = {
  position: {
    ...newRandomCircle[1],
  },
  orientation: RotationwUnits.eulerDegrees(90, 0, 0)
};

export const JBC_21: Scene = {
  ...baseScene,
  name: tr('JBC 21'),
  description: tr('Junior Botball Challenge 21: Proximity'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    stopAtReam: Script.ecmaScript('Stop at Ream', stopAtReam),
    bumpReam: Script.ecmaScript('Bump Ream', bumpReam),
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
    reamFrontBoundary_geom: {
      type: 'box',
      size: {
        x: Distance.inches(11),
        y: Distance.inches(4.25),
        z: Distance.inches(8.5),
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
    reamFrontBoundary: {
      type: 'object',
      geometryId: 'reamFrontBoundary_geom',
      name: tr('Ream Front Boundary'),
      visible: true,
      origin: REAM_FRONT_BOUNDARY_ORIGIN,
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },
    ream1: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 1'),
      startingOrigin: REAM1_ORIGIN,
      origin: REAM1_ORIGIN,
      visible: true,
    },
  },
};
