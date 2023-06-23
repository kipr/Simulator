// In scenes we build upon the base, and add objects to the scene.
// The objects are set up in the node-templates index.ts file.
// Here we add the objects and their properties to the scene.

import Scene from "../state/State/Scene";
import Script from '../state/State/Scene/Script';
import { ReferenceFrame, Rotation, Vector3 } from "../unit-math";
import { Distance } from "../util";
import { Color } from '../state/State/Scene/Color';
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurface } from './moonBase';

import tr from '@i18n';

const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible: true
});

// When the pad detects life a green light glows.

scene.addOnIntersectionListener('meteorite', (type, otherNodeId) => {
  console.log('meteorite may have life!', type, otherNodeId);
  const visible = type === 'start';
  setNodeVisible('indicator', visible);
}, 'indicator');
`;

const baseScene = createBaseSceneSurface();

const SCIENCEPAD_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(50, 0.5, 100),
  orientation: Rotation.eulerDegrees(0, 90, 0)
};

const CONTAINER_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(-20, 0, 100),
  scale: { x: 15, y: 15, z: 15 },
  orientation: Rotation.eulerDegrees(0, 180, 0)
};

const BOTGUY_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(-20, 0, 30),
  scale: { x: 25, y: 25, z: 25 }
};

const SOLARPANEL_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(50, 0, -35),
  scale: { x: 4, y: 4, z: 4 }
};

const WALKWAY_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(50, 0, 65),
  scale: { x: 8, y: 8, z: 8 }
};

const COMMSTOWER_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(80, 0, 0),
  scale: { x: 4, y: 4, z: 4 }
};

const HABITAT_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(0, 0, 60),
  scale: { x: 4, y: 4, z: 4 },
  orientation: Rotation.eulerDegrees(0, 90, 0)
};

const TOWER_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(-50, 1, 61),
};

const LIFESCIENCE_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(-50, 1, 50.3),
};

const RADSCIENCE_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(-50, 1, 40.3),
};

const HAB_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(-50, 1, 0),
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};

const BASALT_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(-30, 1, 61.3),
};
const ANORTHOSITE_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(-15, 1, 61.3),
};
const BRECCIA_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(0, 1, 61.3),
};
const METEORITE_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(0, 1, 61.3),
};
export const Moon_Sandbox: Scene = {
  ...baseScene,
  name: tr('Moon Sandbox'),
  description: tr('Lunar sandbox. Currently supports 4 types of rocks.'),
  scripts: {
    'circleIntersects': Script.ecmaScript('Circle Intersects', circleIntersects),
  },
  geometry: {
    ...baseScene.geometry,
    'indicator': {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
  },
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
    'hab': {
      type: 'from-space-template',
      templateId: 'hab',
      name: tr('Hab'),
      startingOrigin: HAB_ORIGIN,
      origin: HAB_ORIGIN,
      editable: true,
      visible: true,
    },
    'basalt': {
      type: 'from-rock-template',
      templateId: 'basalt',
      name: tr('Basalt Rock'),
      startingOrigin: BASALT_ORIGIN,
      origin: BASALT_ORIGIN,
      editable: true,
      visible: true,
    },
    'anorthosite': {
      type: 'from-rock-template',
      templateId: 'anorthosite',
      name: tr('Anorthosite Rock'),
      startingOrigin: ANORTHOSITE_ORIGIN,
      origin: ANORTHOSITE_ORIGIN,
      editable: true,
      visible: true,
    },
    'breccia': {
      type: 'from-rock-template',
      templateId: 'breccia',
      name: tr('Breccia Rock'),
      startingOrigin: BRECCIA_ORIGIN,
      origin: BRECCIA_ORIGIN,
      editable: true,
      visible: true,
    },
    'meteorite': {
      type: 'from-rock-template',
      templateId: 'meteorite',
      name: tr('Meteorite Rock'),
      startingOrigin: METEORITE_ORIGIN,
      origin: METEORITE_ORIGIN,
      editable: true,
      visible: true,
    },
    'tower': {
      type: 'from-space-template',
      templateId: 'tower',
      name: tr('Communication Tower'),
      startingOrigin: TOWER_ORIGIN,
      origin: TOWER_ORIGIN,
      editable: true,
      visible: true,
    },
    'lifescience': {
      type: 'from-space-template',
      templateId: 'lifescience',
      name: tr('Life Science Pack'),
      startingOrigin: LIFESCIENCE_ORIGIN,
      origin: LIFESCIENCE_ORIGIN,
      editable: true,
      visible: true,
    },
    // 'radscience': {
    //   type: 'from-space-template',
    //   templateId: 'radscience',
    //   name: tr('Radiation Science Pack - High'),
    //   startingOrigin: RADSCIENCE_ORIGIN,
    //   origin: RADSCIENCE_ORIGIN,
    //   editable: true,
    //   visible: true,
    // },
    'noradscience': {
      type: 'from-space-template',
      templateId: 'noradscience',
      name: tr('Radiation Science Pack - Low'),
      startingOrigin: RADSCIENCE_ORIGIN,
      origin: RADSCIENCE_ORIGIN,
      editable: true,
      visible: false,
    },
    'sciencepad': {
      type: 'from-space-template',
      templateId: 'sciencepad',
      name: tr('Science Pad'),
      startingOrigin: SCIENCEPAD_ORIGIN,
      origin: SCIENCEPAD_ORIGIN,
      visible: true,
      editable: true,
    },
    'container': {
      type: 'from-space-template',
      templateId: 'container',
      name: tr('Container'),
      startingOrigin: CONTAINER_ORIGIN,
      origin: CONTAINER_ORIGIN,
      editable: true,
      visible: true,
      material: {
        type: 'basic',
        color: {
          type: "texture",
          uri: "Moon Rock Collection" // default text to display
        },
      },
    },
    'botguy': {
      type: 'from-space-template',
      templateId: 'botguy',
      name: tr('botguy'),
      startingOrigin: BOTGUY_ORIGIN,
      origin: BOTGUY_ORIGIN,
      visible: true,
      editable: true,
    },
    'solarpanel': {
      type: 'from-space-template',
      templateId: 'solarpanel',
      name: tr('Solar Panel'),
      startingOrigin: SOLARPANEL_ORIGIN,
      origin: SOLARPANEL_ORIGIN,
      visible: true,
      editable: true,
    },
    'walkway': {
      type: 'from-space-template',
      templateId: 'walkway',
      name: tr('walkway'),
      startingOrigin: WALKWAY_ORIGIN,
      origin: WALKWAY_ORIGIN,
      visible: true,
      editable: true,
    },
    'commstower': {
      type: 'from-space-template',
      templateId: 'commstower',
      name: tr('Comms Tower'),
      startingOrigin: COMMSTOWER_ORIGIN,
      origin: COMMSTOWER_ORIGIN,
      visible: true,
      editable: true,
    },
    'habitat': {
      type: 'from-space-template',
      templateId: 'habitat',
      name: tr('Human Habitat'),
      startingOrigin: HABITAT_ORIGIN,
      origin: HABITAT_ORIGIN,
      visible: true,
      editable: true,
    },
    'indicator': {
      type: 'object',
      geometryId: 'indicator',
      name: tr('Indicator Light'),
      visible: false,
      origin: {
        position: Vector3.centimeters(50, 5, 100)
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(0, 255, 0),
        },
      },
    },
  }
  
};