import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
// import { createBaseSceneSurfaceB } from './jbcBase';
// import { setNodeVisible } from './jbcCommonComponents';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { LO_BLUE_POMS, RIGHT_BASKET, LEFT_BASKET } from '../26botballExplorerSandbox';


const baseScene = createBaseSceneSurface();

const pomInBasket = `
const bluePoms = ['loBlue0', 'loBlue1', 'loBlue2', 'loBlue3', 'loBlue4', 'loBlue5'];

const blueInLeftBasket = new Set();
const blueInRightBasket = new Set();

function updateChallenge() {
  const blueInLeftBasketCount = blueInLeftBasket.size;
  const blueInRightBasketCount = blueInRightBasket.size

  const base = blueInLeftBasketCount >= 1 || blueInRightBasketCount >= 1;
  const bonus = blueInLeftBasketCount >= 2 || blueInRightBasketCount >= 2;

  scene.setChallengeEventValue('bluePomInBasket',base);

  scene.setChallengeEventValue('bonus',bonus);
};

bluePoms.forEach(pom => {
  scene.addOnIntersectionListener(pom, (type, otherNodeId) => {
    if (type === 'start') {
      otherNodeId === 'insideRightBasket' ? blueInRightBasket.add(pom) : blueInLeftBasket.add(pom);
    } else {
      otherNodeId === 'insideRightBasket' ? blueInRightBasket.delete(pom) : blueInLeftBasket.delete(pom);
    }

    updateChallenge();
  }, ['insideRightBasket', 'insideLeftBasket']);
});
`;

export const BEX_15: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 15'),
  description: tr('Botball Explorer Mission 15: Hazard Disposal #2'),
  scripts: {
    pomInBasket: Script.ecmaScript('Pom In Basket', pomInBasket),
  },
  geometry: {
    ...baseScene.geometry,
    insideBasket_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(16),
        y: Distance.centimeters(5),
        z: Distance.centimeters(25),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    ...LO_BLUE_POMS,
    RIGHT_BASKET,
    insideRightBasket: {
      type: 'object',
      geometryId: 'insideBasket_geom',
      name: tr('Inside Right Basket'),
      parentId: 'RIGHT_BASKET',
      origin: {
        position: {
          x: Distance.centimeters(-0.039),
          y: Distance.centimeters(2.781),
          z: Distance.centimeters(0),
        }

      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(84, 228, 132),
        },
      },
    },
    LEFT_BASKET,
    insideLeftBasket: {
      type: 'object',
      geometryId: 'insideBasket_geom',
      name: tr('Inside Left Basket'),
      parentId: 'LEFT_BASKET',
      origin: {
        position: {
          x: Distance.centimeters(-0.039),
          y: Distance.centimeters(2.781),
          z: Distance.centimeters(0),
        }

      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(84, 228, 132),
        },
      },
    },
  }
};