import Scene from '../../../../state/State/Scene';
import Script from '../../../../state/State/Scene/Script';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { offsetGamePiece, BOTGUY, LEFT_CONE, RIGHT_CONE, } from '../26botballExplorerSandbox';
import { loadingZone, loadingZone_geom, BLACK_LINE_GEOMETRY, blackLineNodes } from './bexCommonComponents';
import Dict from '../../../../util/objectOps/Dict';

const baseScene = createBaseSceneSurface();


const loadingZoneBlackLines = `
 const objects = ['RIGHT_CONE', 'LEFT_CONE', 'BOTGUY'];

  let objectsOnBlackLine = {
    RIGHT_CONE: new Set(),
    LEFT_CONE: new Set()
  }
 let objectsInLoadingZone = {
    RIGHT_CONE: false,
    LEFT_CONE: false,
    BOTGUY: false
  }

  objects.forEach((object,index) => {

    scene.addOnIntersectionListener(object, (type, otherNodeId) => {
      if(otherNodeId === 'loadingZone'){
        type === 'start' ? objectsInLoadingZone[object] = true : type === 'end' ? objectsInLoadingZone[object] = false : null;
      }
      else {
        type === 'start' && objectsOnBlackLine[object] ? objectsOnBlackLine[object].add(otherNodeId) : type === 'end' && objectsOnBlackLine[object] ? objectsOnBlackLine[object].delete(otherNodeId) : null;
      }
      const allObjectsInLoadingZone = Object.values(objectsInLoadingZone).every(value => value);
      const allObjectsOffBlackLine = Object.values(objectsOnBlackLine).every(set => set.size === 0);
      const oneConeFully = (objectsInLoadingZone['RIGHT_CONE'] && objectsOnBlackLine['RIGHT_CONE'].size === 0) || (objectsInLoadingZone['LEFT_CONE'] && objectsOnBlackLine['LEFT_CONE'].size === 0);
     
      const base = objectsInLoadingZone['BOTGUY'];
      const bonus = oneConeFully && base;
      const advancedBonus = bonus && (allObjectsOffBlackLine === true) && allObjectsInLoadingZone === true;

      scene.setChallengeEventValue('botguyInLoadingZone', base);
      scene.setChallengeEventValue('bonus', bonus);
      scene.setChallengeEventValue('advancedBonus', advancedBonus);
    
    }, ['blackLine1', 'blackLine2', 'blackLine3', 'blackLine4', 'blackLine5', 'loadingZone']); 
  
  });

`;

export const BEX_18: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 18'),
  description: tr('Botball Explorer Mission 18: Safety First, All Hands on Deck'),
  summary: {
    skill: tr('Precision driving and servo use for multi-object delivery.'),
    baseMission: tr('Botguy is in the Loading Zone.'),
    bonusMission: tr('Botguy is in the Loading Zone and least one Traffic Cone is fully within the Loading Zone.'),
    advancedBonusMission: tr('Botguy and both Traffic Cones are fully within the Loading Zone.')
  },
  scripts: {
    loadingZoneBlackLines: Script.ecmaScript('Loading Zone and Black Lines', loadingZoneBlackLines),
  },
  geometry: {
    ...baseScene.geometry,
    loadingZone_geom,
    BLACK_LINE_GEOMETRY
  },
  nodes: {
    ...baseScene.nodes,
    ...Dict.map({
      BOTGUY,
      LEFT_CONE,
      RIGHT_CONE,
    }, offsetGamePiece),
    loadingZone,
    ...blackLineNodes

  }

};