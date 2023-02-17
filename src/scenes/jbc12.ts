import Scene from '../state/State/Scene';
import LocalizedString from '../util/LocalizedString';
import Script from '../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';
import { Color } from '../state/State/Scene/Color';
import { Distance } from '../util';

const baseScene = createBaseSceneSurfaceA();
const uprightCans = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = Rotation.Euler.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));


scene.addOnRenderListener(() => {
  // const currTime = Date.now();
  // const timeDiff = currTime - startTime;
  const upright2 = yAngle('can2') < 5;
  const upright9 = yAngle('can9') < 5;
  const upright10 = yAngle('can10') < 5;

  scene.setChallengeEventValue('can2Upright', upright2);
  scene.setChallengeEventValue('can9Upright', upright9);
  scene.setChallengeEventValue('can10Upright', upright10);
});
`;


const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When the can (can2 in green garage) is intersecting circle4, the circle glows

scene.addOnIntersectionListener('can2', (type, otherNodeId) => {
  console.log('Can 2 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can2Intersects', visible);
  setNodeVisible('circle2', visible);
}, 'circle2');

// When the can (can9 in blue garage) is intersecting circle9, the circle glows

scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  console.log('Can 9 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can9Intersects', visible);
  setNodeVisible('circle9', visible);
}, 'circle9');

// When the can (can10 in yellow garage) is intersecting circle10, the circle glows

scene.addOnIntersectionListener('can10', (type, otherNodeId) => {
  console.log('Can 10 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can10Intersects', visible);
  setNodeVisible('circle10', visible);
}, 'circle10');

`;
export const JBC_12: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 12' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 12: Unload 'Em`,
  },

  scripts: {
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    circleIntersects: Script.ecmaScript('Circle Intersects', circleIntersects),
  },
  geometry: {
    ...baseScene.geometry,
    circle_geom: {
      type: "cylinder",
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    mainSurface_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
    startBox_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(0),
      },
    },

  },
  nodes: {
    ...baseScene.nodes,
    startBox: {
      type: "object",
      geometryId: "startBox_geom",
      name: { [LocalizedString.EN_US]: "Start Box" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(0),
        },
      },
      material: {
        type: "pbr",
        emissive: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    mainSurface: {
      type: "object",
      geometryId: "mainSurface_geom",
      name: { [LocalizedString.EN_US]: "Mat Surface" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(0, 0, 0),
        },
      },
    },
    circle2: {
      type: "object",
      geometryId: "circle_geom",
      name: { [LocalizedString.EN_US]: "Circle 2" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0), //can 2
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(28.8),
        },
      },
      material: {
        type: "pbr",
        emissive: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },
    },

    circle9: {
      type: "object",
      geometryId: "circle_geom",
      name: { [LocalizedString.EN_US]: "Circle 9" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0), //can 9
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(85.4),
        },
      },
      material: {
        type: "pbr",
        emissive: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    circle10: {
      type: "object",
      geometryId: "circle_geom",
      name: { [LocalizedString.EN_US]: "Circle 10" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(19.3),//can 10
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(96.9),
        },
      },
      material: {
        type: "pbr",
        emissive: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },
    },

    can2: {
      ...createCanNode(2, {
        x: Distance.centimeters(0),
      y: Distance.centimeters(0),
      z: Distance.centimeters(53.3),
      }),
      scriptIds: ["uprightCans", "circleIntersects"],
    },
    can10: {
      ...createCanNode(9, {
        x: Distance.centimeters(18.5),
        y: Distance.centimeters(0),
        z: Distance.centimeters(78),
      }),
      scriptIds: ["uprightCans", "circleIntersects"],
    },
    can9: {
      ...createCanNode(10, {
        x: Distance.centimeters(-12.3),
        y: Distance.centimeters(0),
        z: Distance.centimeters(93.9),
      }),
      scriptIds: ["uprightCans", "circleIntersects"],
    },
  
  },
};
