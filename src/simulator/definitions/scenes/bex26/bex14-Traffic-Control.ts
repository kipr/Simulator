import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
// import { createBaseSceneSurfaceB } from './jbcBase';
// import { setNodeVisible } from './jbcCommonComponents';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { blackLineNodes, BLACK_LINE_GEOMETRY } from './bexCommonComponents';
import { RIGHT_CONE, LEFT_CONE } from '../26botballExplorerSandbox';


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
  scripts: {
    conesOnBlackLine: Script.ecmaScript('Cones On Black Line', conesOnBlackLine),
    coneInLoadingZone: Script.ecmaScript('Cones In Loading Zone', coneInLoadingZone),
  },
  geometry: {
    ...baseScene.geometry,
    BLACK_LINE_GEOMETRY,
    loadingZone_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(57),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(43)
      },
    }
  },
  nodes: {
    ...baseScene.nodes,
    ...blackLineNodes,
    RIGHT_CONE,
    LEFT_CONE,
    loadingZone: {
      type: 'object',
      geometryId: 'loadingZone_geom',
      name: tr('Loading Zone'),
      visible: true,
      editable: true,
      origin: {
        position: {
          x: Distance.meters(-0.927),
          y: Distance.meters(-0.156),
          z: Distance.centimeters(-5.168)
        },

      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(84, 228, 132),
        },
      },
    }
  }
};