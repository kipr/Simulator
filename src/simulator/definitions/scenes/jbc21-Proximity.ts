import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, canPositions } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import tr from '@i18n';
import { matAStartGeoms, matAStartNodes, notInStartBox } from './jbcCommonComponents';

const baseScene = createBaseSceneSurfaceA();

const stopAtReam = `
scene.addOnIntersectionListener('claw_link', (type, otherNodeId) => {
  console.log('Robot close enough to ream', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('stopAtReam', type === 'start');
  }
}, 'reamFrontBoundary');
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
    ...matAStartGeoms,
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
    ...matAStartNodes,
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
