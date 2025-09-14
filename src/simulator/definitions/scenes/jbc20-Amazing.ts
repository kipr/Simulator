import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const inStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot started in start box!', type, otherNodeId, scene.programStatus);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('inStartBox', true);
  }
}, 'startBox');
`;

const bumpReams = `
// Checks if reams are bumped in order

let reamTouchedList = [false, false, false, false];

scene.addOnCollisionListener('ream1', (otherNodeId) => {
  //If front bumper is pressed
  if(scene.nodes['robot'].state.getDigitalValue(0) == 1) {
    scene.setChallengeEventValue('ream1Touched', true);
    reamTouchedList[0] = true;
  }
}, 'robot');

scene.addOnCollisionListener('ream2', (otherNodeId) => {
  //If front bumper is pressed
  if(scene.nodes['robot'].state.getDigitalValue(0) == 1 && reamTouchedList[0]) {
    scene.setChallengeEventValue('ream2Touched', true);
    reamTouchedList[1] = true;
  }
}, 'robot');

scene.addOnCollisionListener('ream3', (otherNodeId) => {
  //If front bumper is pressed
  if(scene.nodes['robot'].state.getDigitalValue(0) == 1 && reamTouchedList[1]) {
    scene.setChallengeEventValue('ream3Touched', true);
    reamTouchedList[2] = true;
  }
}, 'robot');

scene.addOnCollisionListener('ream4', (otherNodeId) => {
  //If front bumper is pressed
  if(scene.nodes['robot'].state.getDigitalValue(0) == 1 && reamTouchedList[2]) {
    scene.setChallengeEventValue('ream4Touched', true);
    reamTouchedList[3] = true;
  }
}, 'robot');
`;

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    x: Distance.inches(18),
  },
};

const MATA_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['matA'].origin,
  position: {
    ...baseScene.nodes['matA'].origin.position,
    x: Distance.inches(12),
  },
};

const MATB_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.inches(-12),
    y: Distance.centimeters(-7),
    z: Distance.centimeters(50),
  },
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

const REAM1_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.inches(18.5),
    y: Distance.inches(2),
    z: Distance.inches(43),
  },
  orientation: RotationwUnits.eulerDegrees(90, 0, 0)
};

const REAM2_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.inches(-23),
    y: Distance.inches(2),
    z: Distance.inches(38.5),
  },
  orientation: RotationwUnits.eulerDegrees(90, 90, 0)
};

const REAM3_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.inches(-18.5),
    y: Distance.inches(2),
    z: Distance.inches(-3),
  },
  orientation: RotationwUnits.eulerDegrees(90, 0, 0)
};

const REAM4_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.inches(23),
    y: Distance.inches(2),
    z: Distance.inches(1.5),
  },
  orientation: RotationwUnits.eulerDegrees(90, 90, 0)
};

export const JBC_20: Scene = {
  ...baseScene,
  name: tr('JBC 20'),
  description: tr('Junior Botball Challenge 20: A\'mazing'),
  scripts: {
    inStartBox: Script.ecmaScript('In Start Box', inStartBox),
    bumpReams: Script.ecmaScript('Bump Reams', bumpReams),
  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(16),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(10),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    robot: {
      ...baseScene.nodes.robot,
      origin: ROBOT_ORIGIN,
      startingOrigin: ROBOT_ORIGIN,
    },
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.inches(17.85),
          y: Distance.centimeters(-6.89),
          z: Distance.centimeters(10.685),
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
    matA: {
      ...baseScene.nodes.matA,
      origin: MATA_ORIGIN,
      startingOrigin: MATA_ORIGIN,
    },
    matB: {
      type: 'from-jbc-template',
      templateId: 'matB',
      name: tr('JBC Mat B'),
      startingOrigin: MATB_ORIGIN,
      origin: MATB_ORIGIN,
      visible: true,
    },
    ream1: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 1'),
      startingOrigin: REAM1_ORIGIN,
      origin: REAM1_ORIGIN,
      visible: true,
    },
    ream2: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 2'),
      startingOrigin: REAM2_ORIGIN,
      origin: REAM2_ORIGIN,
      visible: true,
    },
    ream3: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 3'),
      startingOrigin: REAM3_ORIGIN,
      origin: REAM3_ORIGIN,
      visible: true,
    },
    ream4: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 4'),
      startingOrigin: REAM4_ORIGIN,
      origin: REAM4_ORIGIN,
      visible: true,
    },
  },
};
