import Scene from '../../../../state/State/Scene';
import { RotationwUnits, ReferenceFramewUnits } from '../../../../util/math/unitMath';
import { Distance } from '../../../../util';
import { Color } from '../../../../state/State/Scene/Color';
import Script from '../../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCanNode } from '../jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

/**
 * Though not explicitly imported, this scene is mostly copied from
 * `../jbc17-Mountain-Rescue.ts`, with minor modifications to work
 * with five cans instead of three.
 */

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
}, ['can1', 'can2', 'can3', 'can4', 'can5']);
`;

const uprightCans = `
// When a can is standing upright on the ream, the upright condition is met.
const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));
scene.addOnRenderListener(() => {
  const upright1 = yAngle('can1') > 5;
  const upright2 = yAngle('can2') > 5;
  const upright3 = yAngle('can3') > 5;
  const upright4 = yAngle('can4') > 5;
  const upright5 = yAngle('can5') > 5;

  scene.setChallengeEventValue('can1Upright', upright1);
  scene.setChallengeEventValue('can2Upright', upright2);
  scene.setChallengeEventValue('can3Upright', upright3);
  scene.setChallengeEventValue('can4Upright', upright4);
  scene.setChallengeEventValue('can5Upright', upright5);
});
`;
const REAM_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(-10),
    y: Distance.centimeters(-3),
    z: Distance.centimeters(91.6),
  },
  orientation: RotationwUnits.eulerDegrees(0, 45, 0),
};

export const Mountain_Rescue: Scene = {
  ...baseScene,
  name: tr('GCER 2025: Mountain Rescue'),
  description: tr('GCER 2025 special event. Now with three more cans to rescue!'),
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
      visible: false,
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
        x: Distance.centimeters(3),
        y: Distance.centimeters(6),
        z: Distance.centimeters(89.5),
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
        x: Distance.centimeters(-7.8),
        y: Distance.centimeters(6),
        z: Distance.centimeters(78.3),
      }),
    },
    can4: {
      ...createCanNode(4, {
        x: Distance.centimeters(-12.2),
        y: Distance.centimeters(6),
        z: Distance.centimeters(104.9),
      }),
    },
    can5: {
      ...createCanNode(5, {
        x: Distance.centimeters(-23),
        y: Distance.centimeters(6),
        z: Distance.centimeters(93.7),
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
