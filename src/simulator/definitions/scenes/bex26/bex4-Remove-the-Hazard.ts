import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { LO_ORANGE_POMS, LO_BLUE_POMS } from '../26botballExplorerSandbox';
import { RotationwUnits } from '../../../../util/math/unitMath';


const pomLeftBlackLine = `

const orangePoms = ['loOrange0', 'loOrange1', 'loOrange2', 'loOrange3', 'loOrange4', 'loOrange5', ];
const bluePoms = ['loBlue0', 'loBlue1', 'loBlue2', 'loBlue3', 'loBlue4', 'loBlue5'];
const orangeOffBlack = new Set();
const blueOffBlack = new Set();

function updateChallenge() {
  const orangeNotOnBlack = orangeOffBlack.size > 0;
  const blueNotOnBlack = blueOffBlack.size > 0;

  const bonus = orangeNotOnBlack && blueNotOnBlack;

  scene.setChallengeEventValue('orangePomNotTouchBlackLine',orangeNotOnBlack);

  scene.setChallengeEventValue('bluePomNotTouchBlackLine',blueNotOnBlack);

  scene.setChallengeEventValue('bonus',bonus);


};

orangePoms.forEach(pom => {
  scene.addOnIntersectionListener(pom, (type, otherNodeId) => {
    if (type === 'end') {
      orangeOffBlack.add(pom);
    } else {
      orangeOffBlack.delete(pom);
    }

    updateChallenge();
  }, ['blackLine1', 'blackLine2', 'blackLine3']);
});

bluePoms.forEach(pom => {
  scene.addOnIntersectionListener(pom, (type, otherNodeId) => {
    if (type === 'end') {
      blueOffBlack.add(pom);
    } else {
      blueOffBlack.delete(pom);
    }

    updateChallenge();
  }, ['blackLine1', 'blackLine2', 'blackLine3']);
});
`;


const baseScene = createBaseSceneSurface();

export const BEX_4: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 4'),
  description: tr('Botball Explorer Mission 4: Remove the Hazard'),
  scripts: {
    pomLeftBlackLine: Script.ecmaScript('Pom Left Black Line', pomLeftBlackLine),
  },
  geometry: {
    ...baseScene.geometry,
    blackLine_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(4),
        y: Distance.centimeters(1),
        z: Distance.meters(2),
      }
    },
  },
  nodes: {
    ...baseScene.nodes,
    ...LO_ORANGE_POMS,
    ...LO_BLUE_POMS,
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