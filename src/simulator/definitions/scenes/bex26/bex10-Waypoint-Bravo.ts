import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { blackLineNodes, BLACK_LINE_GEOMETRY } from './bexCommonComponents';


const baseScene = createBaseSceneSurface();


const noStop = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  if(type === 'start'){
    scene.setChallengeEventValue('noStop', true);
  }
}, 'stopBox');
`;

const touchingBlackLine = `
  let blackLineDict = {
    blackLine1: false,
    blackLine2: false,
    blackLine3: false,
    blackLine4: false,
    blackLine5: false
  };

  let insideEndBox = false;
  let insideStartBox = false;
  let isTouchingBlackLine = false;

  let baseMissionCompleteOnce = false;
  let returnedFromEndBox = false;

  function resetChallengeState() {
    blackLineDict = {
      blackLine1: false,
      blackLine2: false,
      blackLine3: false,
      blackLine4: false,
      blackLine5: false
    };

    insideEndBox = false;
    insideStartBox = false;
    isTouchingBlackLine = false;

    baseMissionCompleteOnce = false;
    returnedFromEndBox = false;

    scene.setChallengeEventValue(
      'robotInEndBoxNotTouchingBlackLine',
      false
    );

    scene.setChallengeEventValue('bonus', false);

  }

  function updateChallengeState() {
    isTouchingBlackLine =
      Object.values(blackLineDict).some(value => value);

    const baseMissionComplete =
      insideEndBox &&
      !isTouchingBlackLine;

    if (baseMissionComplete) {
      baseMissionCompleteOnce = true;
    }

    const bonusComplete =
      baseMissionCompleteOnce &&
      returnedFromEndBox &&
      insideStartBox &&
      !isTouchingBlackLine;

    scene.setChallengeEventValue(
      'robotInEndBoxNotTouchingBlackLine',
      baseMissionComplete
    );

    scene.setChallengeEventValue(
      'bonus',
      bonusComplete
    );
  }

  scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
    blackLineDict[otherNodeId] = type === 'start';

    updateChallengeState();
  }, [
    'blackLine1',
    'blackLine2',
    'blackLine3',
    'blackLine4',
    'blackLine5'
  ]);

  scene.addOnIntersectionListener('robot', (type) => {
    insideEndBox = type === 'start';

    if (
      type === 'end' &&
      baseMissionCompleteOnce
    ) {
      returnedFromEndBox = true;
    }

    updateChallengeState();
  }, ['endBox']);

  scene.addOnIntersectionListener('robot', (type) => {
  if (scene.programStatus === 'stopped') {
    resetChallengeState();
    return;
  }

  insideStartBox = type === 'start';
  updateChallengeState();

}, ['startBox']);

`;
export const BEX_10: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 10'),
  description: tr('Botball Explorer Mission 10: Waypoint Bravo'),
  scripts: {
    // notInStartBox: Script.ecmaScript('Not In Start Box', notInStartBox),
    // reachedEnd: Script.ecmaScript('Robot Reached End', reachedEnd),
    noStop: Script.ecmaScript('No Stop', noStop),
    //enterStartBox: Script.ecmaScript('Bonus Return', enterStartBox),
    touchingBlackLine: Script.ecmaScript('Touching Black Line', touchingBlackLine),
  },
  geometry: {
    ...baseScene.geometry,
    BLACK_LINE_GEOMETRY,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(32),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(43),
      },
    },
    notStartBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
    endBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(31.5),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(27),
      },
    },
    stopBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(32),
        y: Distance.centimeters(10),
        z: Distance.centimeters(1),
      }
    }
  },
  nodes: {
    ...baseScene.nodes,
    ...blackLineNodes,
    blackLine4:
    {
      ...blackLineNodes.blackLine4,
      origin: {
        orientation: blackLineNodes.blackLine4.origin.orientation,
        position: {
          x: Distance.centimeters(-5.46),
          y: Distance.centimeters(-14.4),
          z: Distance.meters(0.186),
        }

      },

    },
    blackLine5: {
      ...blackLineNodes.blackLine5,
      origin: {
        orientation: blackLineNodes.blackLine5.origin.orientation,
        position: {
          x: Distance.centimeters(-5.46),
          y: Distance.centimeters(-14.4),
          z: Distance.meters(0.519),
        }

      },
    },

    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box'),
      origin: {
        position: {
          x: Distance.centimeters(-45.26),
          y: Distance.centimeters(-15.83),
          z: Distance.centimeters(-5.17),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 255),
        },
      },
    },

    endBox: {
      type: 'object',
      geometryId: 'endBox_geom',
      name: tr('End Box'),
      origin: {
        position: {
          x: Distance.centimeters(-45.5),
          y: Distance.centimeters(-15.8),
          z: Distance.centimeters(35.24),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 71, 133),
        },
      },
    },
    stopBox: {
      type: 'object',
      geometryId: 'stopBox_geom',
      name: tr('Stop Box'),
      origin: {
        position: {
          x: Distance.centimeters(-45.9),
          y: Distance.centimeters(-10.28),
          z: Distance.centimeters(54.34),
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