import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { blackLineNodes, BLACK_LINE_GEOMETRY, startBoxB, startBox_geom } from './bexCommonComponents';
import { RotationwUnits } from '../../../../util/math/unitMath';


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

}, ['startBoxB']);

`;
export const BEX_10: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 10'),
  description: tr('Botball Explorer Mission 10: Waypoint Bravo'),
  summary: {
    skill: tr('Basic autonomous navigation and stopping at a specific location.'),
    baseMission: tr('The robot enters the zone adjacent to Starting Box B and comes to a clear and complete stop.'),
    bonusMission: tr('The robot subsequently returns fully within Starting Box B and comes to a clear and complete stop.'),
  },
  scripts: {
    noStop: Script.ecmaScript('No Stop', noStop),
    touchingBlackLine: Script.ecmaScript('Touching Black Line', touchingBlackLine),
  },
  geometry: {
    ...baseScene.geometry,
    BLACK_LINE_GEOMETRY,
    startBox_geom,
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
          z: Distance.meters(0.428),
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
          z: Distance.meters(0.794),
        }

      },
    },

    startBoxB,

    endBox: {
      type: 'object',
      geometryId: 'endBox_geom',
      name: tr('End Box'),
      origin: {
        position: {
          x: Distance.centimeters(45.276),
          y: Distance.centimeters(-15),
          z: Distance.centimeters(60.995),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
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
          x: Distance.centimeters(63.744),
          y: Distance.centimeters(-10.6),
          z: Distance.centimeters(60.974),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
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