import Scene from '../../../state/State/Scene';
import { RotationwUnits, ReferenceFramewUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import { Color } from '../../../state/State/Scene/Color';
import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
import Script from '../../../state/State/Scene/Script';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const startBoxIntersects = `
scene.addOnIntersectionListener('startBox', (type, otherNodeId) => {
  // console.log(otherNodeId + ' entered start box!', type);
  const visible = type === 'start';
  scene.setChallengeEventValue(otherNodeId + 'Intersects', visible);
}, ['can1', 'can2', 'can3']);
`;

const uprightCans = `
// When a can is standing upright on the ream, the upright condition is met.
const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));
scene.addOnRenderListener(() => {
  const upright1 = yAngle('can1') > 5;
  const upright2 = yAngle('can2') > 5;
  const upright3 = yAngle('can3') > 5;
 
  scene.setChallengeEventValue('can1Upright', upright1);
  scene.setChallengeEventValue('can2Upright', upright2);
  scene.setChallengeEventValue('can3Upright', upright3);
});
  
`;
const REAM_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(-10),
    y: Distance.centimeters(-3),
    z: Distance.centimeters(91.6),
  },
  orientation: RotationwUnits.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 4,
  }),
};

export const JBC_17: Scene = {
  ...baseScene,
  name: tr('JBC 17'),
  description: tr('Junior Botball Challenge 17: Mountain Rescue'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    startBoxIntersects: Script.ecmaScript('Start Box Intersects', startBoxIntersects),
  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(25),
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
  },
  nodes: {
    ...baseScene.nodes,
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box'),
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(3),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
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
    can1: {
      ...createCanNode(1, {
        x: Distance.centimeters(-3),
        y: Distance.centimeters(6),
        z: Distance.centimeters(98.6),
      }),
    },
    can2: {
      ...createCanNode(2, {
        x: Distance.centimeters(-10),
        y: Distance.centimeters(6),
        z: Distance.centimeters(91.6),
      }),
    },
    can3: {
      ...createCanNode(3, {
        x: Distance.centimeters(-17),
        y: Distance.centimeters(6),
        z: Distance.centimeters(84.6),
      }),
    },
    ream: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream'),
      startingOrigin: REAM_ORIGIN,
      origin: REAM_ORIGIN,
      visible: true,
    },
  },
};
