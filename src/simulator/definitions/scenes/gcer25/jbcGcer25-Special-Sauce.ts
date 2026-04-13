import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import { RotationwUnits } from '../../../../util/math/unitMath';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import { canPositions, createBaseSceneSurfaceA } from '../jbcBase';
import Dict from '../../../../util/objectOps/Dict';
import { sprintf } from 'sprintf-js';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const pomPositions = new Map([
  [3, 'pom_orange'],
  [5, 'pom_orange'],
  [9, 'pom_orange'],
  [2, 'pom_red'],
  [7, 'pom_red'],
  [11, 'pom_red'],
  [1, 'pom_yellow'],
  [8, 'pom_yellow'],
  [10, 'pom_yellow'],
]);

const POMS = {};
const POM_SCRIPTS = {};
for (const [circle, id] of pomPositions) {
  POM_SCRIPTS[`pom${circle}_garage`] = Script.ecmaScript(`Pom #${circle} in garage`, `
const garages = ['garageBlue', 'garageGreen', 'garageOrange'];
scene.addOnIntersectionListener('pom${circle}', (type, otherNodeId) => {
  // console.log('pom${circle} in garage');
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('pom${circle}', type === 'start');
  }
}, [...garages]);
`);
  POMS[`pom${circle}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Pom #%d'), (str: string) => sprintf(str, circle)),

    templateId: id,
    visible: true,
    editable: false,
    startingOrigin: {
      position: canPositions[circle - 1],
    },
    origin: {
      position: canPositions[circle - 1],
    },
  };
}
const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

export const Special_Sauce: Scene = {
  ...baseScene,
  name: tr('GCER 2025: Special Sauce'),
  description: tr('GCER 2025 special event. Mix the ketchup (red), mustard (yellow), and hot sauce (orange) in the garages to create your own special blend!'),
  scripts: {
    'notInStartBox': Script.ecmaScript('Not In Start Box', notInStartBox),
    ...POM_SCRIPTS,
  },
  geometry: {
    ...baseScene.geometry,
    notStartBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
    garage_geom: {
      type: 'box',
      size: {
        x: Distance.inches(9),
        y: Distance.centimeters(1),
        z: Distance.inches(8.75),
      },
    },
    orangeGarage_geom: {
      type: 'box',
      size: {
        x: Distance.inches(7.5),
        y: Distance.centimeters(1),
        z: Distance.inches(7.25),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    'garageGreen': {
      type: 'object',
      geometryId: 'garage_geom',
      name: tr('Green Garage'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-7),
          z: Distance.centimeters(53),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(0, 255, 0),
        },
      },
    },
    'garageOrange': {
      type: 'object',
      geometryId: 'orangeGarage_geom',
      name: tr('Orange Garage'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(19),
          y: Distance.centimeters(-7),
          z: Distance.centimeters(78),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(234, 139, 29),
        },
      },
    },
    'garageBlue': {
      type: 'object',
      geometryId: 'orangeGarage_geom',
      name: tr('Blue Garage'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-12),
          y: Distance.centimeters(-7),
          z: Distance.centimeters(95),
        },
        orientation: RotationwUnits.eulerDegrees(0, 45, 0),
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(234, 139, 29),
        },
      },
    },
    notStartBox: {
      type: 'object',
      geometryId: 'notStartBox_geom',
      name: tr('Not Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-1.9),
          z: Distance.meters(1.208),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },
    ...POMS,
  }
};
