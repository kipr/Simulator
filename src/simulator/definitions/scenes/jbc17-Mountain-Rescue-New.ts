import Scene from '../../../state/State/Scene';
import { RotationwUnits, ReferenceFramewUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import { Color } from '../../../state/State/Scene/Color';
import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
import Script from "../../../state/State/Scene/Script";

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const startBoxIntersects = `
scene.onBind = nodeId => {
  scene.addOnIntersectionListener(nodeId, (type, otherNodeId) => {
    console.log(nodeId + "entered start box!");
    const visible = type === 'start';
    scene.setChallengeEventValue(nodeId+'Intersects', visible);
  }, 'startBox');

};

`;

const uprightCans = `
// When a can is standing upright on the ream, the upright condition is met.


const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));
scene.addOnRenderListener(() => {
 
  const upright1 = yAngle('can1') < 5;
  const upright2 = yAngle('can2') < 5;
  const upright3 = yAngle('can3') < 5;
 
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
  name: { [LocalizedString.EN_US]: 'JBC 17' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 17: Mountain Rescue`,
  },
  scripts: {
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    startBoxIntersects: Script.ecmaScript('Start Box Intersects', startBoxIntersects),
  },
  geometry: {
    ...baseScene.geometry,
    mainSurface_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(25),
      },
    },
    circle2_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
  },
  nodes: {
    ...baseScene.nodes,
    mainSurface: {
      type: 'object',
      geometryId: 'mainSurface_geom',
      name: { [LocalizedString.EN_US]: 'Mat Surface' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 0),
        },
      },
    },
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
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

    can1: {
      ...createCanNode(1, {
        x: Distance.centimeters(-3),
        y: Distance.centimeters(6),
        z: Distance.centimeters(98.6),
      }),
      scriptIds: ['uprightCans', 'startBoxIntersects'],
    },

    can2: {
      ...createCanNode(1, {
        x: Distance.centimeters(-10),
        y: Distance.centimeters(6),
        z: Distance.centimeters(91.6),
      }),
      scriptIds: ['uprightCans', 'startBoxIntersects'],
    },

    can3: {
      ...createCanNode(1, {
        x: Distance.centimeters(-17),
        y: Distance.centimeters(6),
        z: Distance.centimeters(84.6),
      }),
      scriptIds: ['uprightCans', 'startBoxIntersects'],
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
