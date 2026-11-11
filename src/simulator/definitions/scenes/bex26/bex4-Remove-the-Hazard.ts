import Scene from '../../../../state/State/Scene';
import Script from '../../../../state/State/Scene/Script';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { LO_ORANGE_POMS, LO_BLUE_POMS, offsetGamePiece } from '../26botballExplorerSandbox';
import { BLACK_LINE_GEOMETRY, blackLineNodes } from './bexCommonComponents';
import Dict from '../../../../util/objectOps/Dict';


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
  summary: {
    skill: tr('Object displacement, maniulation, and simultaneous task completion.'),
    baseMission: tr('An Orange Pom is off the black line.'),
    bonusMission: tr('An Orange Pom and a Blue Pom simultaneously off the black line.'),
  },
  scripts: {
    pomLeftBlackLine: Script.ecmaScript('Pom Left Black Line', pomLeftBlackLine),
  },
  geometry: {
    ...baseScene.geometry,
    BLACK_LINE_GEOMETRY
  },
  nodes: {
    ...baseScene.nodes,
    ...blackLineNodes,
    ...Dict.map({
      ...LO_ORANGE_POMS,
      ...LO_BLUE_POMS,
    }, offsetGamePiece)
  }
};