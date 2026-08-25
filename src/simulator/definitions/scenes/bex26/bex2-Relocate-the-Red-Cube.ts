import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Node from '../../../../state/State/Scene/Node';
import Script from '../../../../state/State/Scene/Script';
// import { createBaseSceneSurfaceB } from './jbcBase';
// import { setNodeVisible } from './jbcCommonComponents';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../../util/math/unitMath';
const baseScene = createBaseSceneSurface();


const palletLeftBlackLine = `
scene.addOnIntersectionListener('redCubePallet', (type, otherNodeId) => {
  //console.log('Red Cube Pallet left black line!', type, otherNodeId, scene.programStatus);
  scene.setChallengeEventValue('palletNotTouchBlackLine', type === 'end');
},[ 'blackLine1', 'blackLine2', 'blackLine3']);
`;


const largeRedCubeLeftBlackLine = `
scene.addOnIntersectionListener('redCube', (type, otherNodeId) => {
  //console.log('Red Cube left black line!', type, otherNodeId, scene.programStatus);
   scene.setChallengeEventValue('largeRedCubeNotTouchBlackLine', type === 'end');
},[ 'blackLine1', 'blackLine2', 'blackLine3']);
`;


const lowRedCubeLeftBlackLine = `
scene.addOnIntersectionListener('lowRedCube', (type, otherNodeId) => {
  //console.log('Low Red Cube left black line!', type, otherNodeId, scene.programStatus);
   scene.setChallengeEventValue('lowRedCubeNotTouchBlackLine', type === 'end');
},[ 'blackLine1', 'blackLine2', 'blackLine3']);
`;

const highRedCubeLeftBlackLine = `
scene.addOnIntersectionListener('highRedCube', (type, otherNodeId) => {
  //console.log('High Red Cube left black line!', type, otherNodeId, scene.programStatus);
  scene.setChallengeEventValue('highRedCubeNotTouchBlackLine', type === 'end');
},[ 'blackLine1', 'blackLine2', 'blackLine3']);
`;


const LOW_2INCH_RED_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(66.7, -15, 21.9),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
const HIGH_2INCH_RED_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(66.7, -5, 21.7),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
const LOW_2INCH_RED_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Low Red Cube'),
  templateId: 'cubeRed2In',
  visible: true,
  editable: true,
  startingOrigin: LOW_2INCH_RED_CUBE_ORIGIN,
  origin: LOW_2INCH_RED_CUBE_ORIGIN
};
const HIGH_2INCH_RED_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('High Red Cube'),
  templateId: 'cubeRed2In',
  visible: true,
  editable: true,
  startingOrigin: HIGH_2INCH_RED_CUBE_ORIGIN,
  origin: HIGH_2INCH_RED_CUBE_ORIGIN
};
const RED_4INCH_CUBE_PALLET_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(39.5, -15, 6),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
const RED_4INCH_CUBE_PALLET: Node = {
  type: 'from-bb-template',
  name: tr('Red Cube Pallet'),
  templateId: 'pallet',
  visible: true,
  editable: true,
  startingOrigin: RED_4INCH_CUBE_PALLET_ORIGIN,
  origin: RED_4INCH_CUBE_PALLET_ORIGIN
};

const RED_4INCH_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(39.5, -5, 6),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
const RED_4INCH_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Red Cube'),
  templateId: 'cubeRed4In',
  visible: true,
  editable: true,
  startingOrigin: RED_4INCH_CUBE_ORIGIN,
  origin: RED_4INCH_CUBE_ORIGIN
};
export const BEX_2: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 2'),
  description: tr('Botball Explorer Mission 2: Relocate the Red Cube'),
  scripts: {
    largeRedCubeLeftBlackLine: Script.ecmaScript('Large Red Cube Left Black Line', largeRedCubeLeftBlackLine),
    lowRedCubeLeftBlackLine: Script.ecmaScript('Low Red Cube Left Black Line', lowRedCubeLeftBlackLine),
    highRedCubeLeftBlackLine: Script.ecmaScript('High Red Cube Left Black Line', highRedCubeLeftBlackLine),
    palletLeftBlackLine: Script.ecmaScript('Pallet Left Black Line', palletLeftBlackLine),
  },
  geometry: {
    ...baseScene.geometry,
    blackLine_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(5),
        y: Distance.centimeters(12),
        z: Distance.meters(2),
      }
    },

  },
  nodes: {
    ...baseScene.nodes,
    lowRedCube: LOW_2INCH_RED_CUBE,
    highRedCube: HIGH_2INCH_RED_CUBE,
    redCubePallet: RED_4INCH_CUBE_PALLET,
    redCube: RED_4INCH_CUBE,
    blackLine1: {
      type: 'object',
      geometryId: 'blackLine_geom',
      name: tr('Black Line 1'),
      origin: {
        position: {
          x: Distance.centimeters(34.1),
          y: Distance.centimeters(-22),
          z: Distance.meters(0.878),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(126, 2, 163),
        },
      },
    },
    blackLine2: {
      type: 'object',
      geometryId: 'blackLine_geom',
      name: tr('Black Line 2'),
      origin: {
        position: {
          x: Distance.centimeters(66.62),
          y: Distance.centimeters(-22),
          z: Distance.meters(0.878),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(126, 2, 163),
        },
      },
    },
    blackLine3: {
      type: 'object',
      geometryId: 'blackLine_geom',
      name: tr('Black Line 3'),
      origin: {
        position: {
          x: Distance.centimeters(66.62),
          y: Distance.centimeters(-22),
          z: Distance.meters(0.221),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(126, 2, 163),
        },
      },
    },
  }
};