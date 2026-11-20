import Scene from '../../../../state/State/Scene';
import Script from '../../../../state/State/Scene/Script';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { blackLineNodes, BLACK_LINE_GEOMETRY, loadingZone, loadingZone_geom } from './bexCommonComponents';
import { RIGHT_CONE, LEFT_CONE, offsetGamePiece } from '../26botballExplorerSandbox';
import Dict from '../../../../util/objectOps/Dict';


const baseScene = createBaseSceneSurface();

const conesOnBlackLine = `

  const cones = ['RIGHT_CONE', 'LEFT_CONE'];
  let conesOnBlackLine = {
    RIGHT_CONE: true,
    LEFT_CONE: true
  }

  cones.forEach((cone,index) => {
    scene.addOnIntersectionListener(cone, (type, otherNodeId) => {
      type === 'start' ? conesOnBlackLine[cone] = true : type === 'end' ? conesOnBlackLine[cone] = false : null;

      const bothConesOffBlackLine =
        Object.values(conesOnBlackLine).some(value => value);
      scene.setChallengeEventValue('bothConesOffBlackLine', bothConesOffBlackLine === false);

    }, ['blackLine1', 'blackLine2', 'blackLine3', 'blackLine4', 'blackLine5']);
  });

`;

const coneInLoadingZone = `
  const cones = ['RIGHT_CONE', 'LEFT_CONE'];
  let coneInLoadingZone = [];

  cones.forEach((cone,index) => {
    scene.addOnIntersectionListener(cone, (type, otherNodeId) => {
      type === 'start' ? coneInLoadingZone.push(cone) : type === 'end' ? coneInLoadingZone = coneInLoadingZone.filter(c => c !== cone) : null;

      const oneConeInLoadingZone =
        coneInLoadingZone.length > 0;
      scene.setChallengeEventValue('bonus', (scene.getChallengeEventValue('bothConesOffBlackLine') && oneConeInLoadingZone));

    }, 'loadingZone');
  });

`;


export const BEX_14: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 14'),
  description: tr('Botball Explorer Mission 14: Traffic Control'),
  summary: {
    skill: tr('Precision bulldozing and object delivery.'),
    baseMission: tr('Both Traffic Cones are off the black line.'),
    bonusMission: tr('A Traffic Cone is in the Loading Zone.')
  },
  scripts: {
    conesOnBlackLine: Script.ecmaScript('Cones On Black Line', conesOnBlackLine),
    coneInLoadingZone: Script.ecmaScript('Cones In Loading Zone', coneInLoadingZone),
  },
  geometry: {
    ...baseScene.geometry,
    BLACK_LINE_GEOMETRY,
    loadingZone_geom,
  },
  nodes: {
    ...baseScene.nodes,
    ...blackLineNodes,
    RIGHT_CONE,
    LEFT_CONE,
    loadingZone,
    ...Dict.map({
      RIGHT_CONE,
      LEFT_CONE,
    }, offsetGamePiece),

  },
};