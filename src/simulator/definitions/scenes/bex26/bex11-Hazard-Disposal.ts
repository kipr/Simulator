import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
// import { createBaseSceneSurfaceB } from './jbcBase';
// import { setNodeVisible } from './jbcCommonComponents';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { LO_ORANGE_POMS, RIGHT_BASKET, LEFT_BASKET } from '../26botballExplorerSandbox';

const baseScene = createBaseSceneSurface();

const pomInBasket = `
const orangePoms = ['loOrange0', 'loOrange1', 'loOrange2', 'loOrange3', 'loOrange4', 'loOrange5', ];

const orangeInLeftBasket = new Set();
const orangeInRightBasket = new Set();

function updateChallenge() {
  const orangeInLeftBasketCount = orangeInLeftBasket.size;
  const orangeInRightBasketCount = orangeInRightBasket.size

  const base = orangeInLeftBasketCount >= 1 || orangeInRightBasketCount >= 1;
  const bonus = orangeInLeftBasketCount >= 2 || orangeInRightBasketCount >= 2;

  scene.setChallengeEventValue('orangePomInBasket',base);

  scene.setChallengeEventValue('bonus',bonus);
};

orangePoms.forEach(pom => {
  scene.addOnIntersectionListener(pom, (type, otherNodeId) => {
    if (type === 'start') {
      otherNodeId === 'insideRightBasket' ? orangeInRightBasket.add(pom) : orangeInLeftBasket.add(pom);
    } else {
      otherNodeId === 'insideRightBasket' ? orangeInRightBasket.delete(pom) : orangeInLeftBasket.delete(pom);
    }

    updateChallenge();
  }, ['insideRightBasket', 'insideLeftBasket']);
});
`;



export const BEX_11: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 11'),
  description: tr('Botball Explorer Mission 11: Hazard Disposal'),
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
    ...LO_ORANGE_POMS,
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