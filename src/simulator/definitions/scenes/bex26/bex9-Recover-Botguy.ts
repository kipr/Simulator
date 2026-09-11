import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { BOTGUY, offsetGamePiece } from '../26botballExplorerSandbox';
import Dict from '../../../../util/objectOps/Dict';
import { RotationwUnits } from '../../../../util/math/unitMath';


const baseScene = createBaseSceneSurface();

const robotTouchingBotguy = `
scene.addOnCollisionListener('robot', (type, otherNodeId) => {
  scene.setChallengeEventValue('robotTouchBotguy', true);
}, 'BOTGUY');
`;

const bonus = `
  let botguyOutsideEnclosure = false;
  let botguyTouchingWarehouseFloor = false;
  scene.addOnIntersectionListener('BOTGUY', (type, otherNodeId) => {

    (otherNodeId === 'warehouseFloor' && type === 'start') ? botguyTouchingWarehouseFloor = true : botguyTouchingWarehouseFloor = false;
    (otherNodeId === 'pvcEncloseLeft' || otherNodeId === 'pvcEncloseMiddle' || otherNodeId === 'pvcEncloseRight') && type === 'start' ? botguyOutsideEnclosure = false : botguyOutsideEnclosure = true;
    (botguyOutsideEnclosure && botguyTouchingWarehouseFloor) ? scene.setChallengeEventValue('bonus', true) : scene.setChallengeEventValue('bonus', false);

  }, ['warehouseFloor', 'pvcEncloseLeft', 'pvcEncloseMiddle', 'pvcEncloseRight']);
`;


export const BEX_9: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 9'),
  description: tr('Botball Explorer Mission 9: Recover Botguy'),
  summary: {
    skill: tr('Navigating to a known coordinate and extracting a high-mass object.'),
    baseMission: tr('The robot is touching Botguy.'),
    bonusMission: tr('Botguy is completely outside of the PVC enclosures and is touching the warehouse floor.'),
  },
  scripts: {
    robotTouchingBotguy: Script.ecmaScript('Robot Touching Botguy', robotTouchingBotguy),
    bonus: Script.ecmaScript('Bonus', bonus),
  },
  geometry: {
    ...baseScene.geometry,
    pvcEnclose_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(73),
        y: Distance.centimeters(10),
        z: Distance.centimeters(13),
      },
    },
    pvcEncloseRight_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(82),
        y: Distance.centimeters(10),
        z: Distance.centimeters(13),
      },
    },
    warehouseFloor_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(250),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(110),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    ...Dict.map({
      BOTGUY,
    }, offsetGamePiece),
    warehouseFloor: {
      type: 'object',
      geometryId: 'warehouseFloor_geom',
      name: tr('Warehouse Floor'),
      origin: {
        position: {
          x: Distance.centimeters(38.147),
          y: Distance.centimeters(-15.59),
          z: Distance.centimeters(17.287),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(130, 60, 223),
        },
      },
    },

    pvcEncloseLeft: {
      type: 'object',
      geometryId: 'pvcEnclose_geom',
      name: tr('PVC Enclosure Left'),
      origin: {
        position: {
          x: Distance.centimeters(99.43),
          y: Distance.centimeters(-16.15),
          z: Distance.centimeters(-56.669),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    pvcEncloseMiddle: {
      type: 'object',
      geometryId: 'pvcEnclose_geom',
      name: tr('PVC Enclosure Middle'),

      origin: {
        position: {
          x: Distance.centimeters(99.43),
          y: Distance.centimeters(-16.15),
          z: Distance.centimeters(16.568),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },

    pvcEncloseRight: {
      type: 'object',
      geometryId: 'pvcEncloseRight_geom',
      name: tr('PVC Enclosure Right'),
      origin: {
        position: {
          x: Distance.centimeters(99.43),
          y: Distance.centimeters(-16.15),
          z: Distance.centimeters(94.334),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),

      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },

  }
};