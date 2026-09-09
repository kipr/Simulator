import Scene from '../../../../state/State/Scene';
import Script from '../../../../state/State/Scene/Script';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { RED_4INCH_CUBE, LOW_2INCH_RED_CUBE, HIGH_2INCH_RED_CUBE, RED_4INCH_CUBE_PALLET, offsetGamePiece } from '../26botballExplorerSandbox';
import { BLACK_LINE_GEOMETRY, blackLineNodes } from './bexCommonComponents';
import Dict from '../../../../util/objectOps/Dict';

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
    BLACK_LINE_GEOMETRY

  },
  nodes: {
    ...baseScene.nodes,
    ...blackLineNodes,
    ...Dict.map({
      lowRedCube: LOW_2INCH_RED_CUBE,
      highRedCube: HIGH_2INCH_RED_CUBE,
      redCubePallet: RED_4INCH_CUBE_PALLET,
      redCube: RED_4INCH_CUBE,

    }, offsetGamePiece)
  }
};