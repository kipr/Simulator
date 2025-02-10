// In scenes we build upon the base, and add objects to the scene.
// The objects are set up in the node-templates index.ts file.
// Here we add the objects and their properties to the scene.

import Scene from "../../../state/State/Scene";
// Imports to abuse robot system for collision boxes
import Node from "../../../state/State/Scene/Node";
import AbstractRobot from '../../../programming/AbstractRobot';
// import Script from '../../../state/State/Scene/Script';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../../../util/math/unitMath";
import { Distance } from "../../../util";
import { Color } from '../../../state/State/Scene/Color';
// import LocalizedString from '../../../util/LocalizedString';

import { createBaseSceneSurface } from './tableBase';

import tr from '@i18n';

/*
const rockEvaluation = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible: visible
});

// When the pad detects life a green light glows.

scene.addOnIntersectionListener('meteorite', (type, otherNodeId) => {
  console.log('meteorite may have life!', type, otherNodeId);
  const visible = type === 'start';
  setNodeVisible('life indicator', visible);
  if (visible) alert('You found a meteorite rock! It may have life! Bring this to the container for further study.');
}, 'sciencepad');

scene.addOnIntersectionListener('basalt', (type, otherNodeId) => {
  console.log('basalt may have life!', type, otherNodeId);
  const visible = type === 'start';
  setNodeVisible('nolife indicator', visible);
  if (visible) alert('You found a basalt rock! There does not appear to be life here. Try another rock.');
}, 'sciencepad');

scene.addOnIntersectionListener('anorthosite', (type, otherNodeId) => {
  console.log('anorthosite may have life!', type, otherNodeId);
  const visible = type === 'start';
  setNodeVisible('nolife indicator', visible);
  if (visible) alert('You found a anorthosite rock! There does not appear to be life here. Try another rock.');
}, 'sciencepad');

scene.addOnIntersectionListener('breccia', (type, otherNodeId) => {
  console.log('breccia may have life!', type, otherNodeId);
  const visible = type === 'start';
  setNodeVisible('nolife indicator', visible);
  if (visible) alert('You found a breccia rock! There does not appear to be life here. Try another rock.');
}, 'sciencepad');
`;
*/


const baseScene = createBaseSceneSurface();

const HAMBURGER_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(15, 22, 114),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0),
};

const HAMBURGER: Node.Robot = {
  type: 'robot',
  name: tr('Hamburger'),
  robotId: 'hamburger',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: HAMBURGER_ORIGIN,
  origin: HAMBURGER_ORIGIN
};

export const Table_Sandbox: Scene = {
  ...baseScene,
  name: tr('2025 Game Table'),
  description: tr('2025 Botball game table sandbox'),
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
    'hamburger': HAMBURGER,
    /*
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
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
    'lifescience': {
      type: 'from-space-template',
      templateId: 'lifescience',
      name: tr('Life Science Pack'),
      startingOrigin: LIFESCIENCE_ORIGIN,
      origin: LIFESCIENCE_ORIGIN,
      editable: true,
      visible: true,
    },
    'radscience': {
      type: 'from-space-template',
      templateId: 'radscience',
      name: tr('Radiation Science Pack - High'),
      startingOrigin: RADSCIENCE_ORIGIN,
      origin: RADSCIENCE_ORIGIN,
      editable: true,
      visible: true,
    },
    // 'noradscience': {
    //   type: 'from-space-template',
    //   templateId: 'noradscience',
    //   name: tr('Radiation Science Pack - Low'),
    //   startingOrigin: RADSCIENCE_ORIGIN,
    //   origin: RADSCIENCE_ORIGIN,
    //   editable: true,
    //   visible: true,
    // },
    'sciencepad': {
      type: 'from-space-template',
      templateId: 'sciencepad',
      name: tr('Science Pad'),
      startingOrigin: SCIENCEPAD_ORIGIN,
      origin: SCIENCEPAD_ORIGIN,
      editable: true,
      visible: true,
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
          uri: "Rocks with Possible Life" // default text to display
        },
      },
    },
    'botguy': {
      type: 'from-space-template',
      templateId: 'botguy',
      name: tr('Space Bot Guy'),
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
      name: tr('Walkway'),
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
      name: tr('Human Living Habitat'),
      startingOrigin: HABITAT_ORIGIN,
      origin: HABITAT_ORIGIN,
      visible: true,
      editable: true,
    },
    'research_habitat': {
      type: 'from-space-template',
      templateId: 'research_habitat',
      name: tr('Human Research Habitat'),
      startingOrigin: RESEARCH_HABITAT_ORIGIN,
      origin: RESEARCH_HABITAT_ORIGIN,
      visible: true,
      editable: true,
    },
    'control_habitat': {
      type: 'from-space-template',
      templateId: 'control_habitat',
      name: tr('Human Control/Comms Station Habitat'),
      startingOrigin: CONTROL_HABITAT_ORIGIN,
      origin: CONTROL_HABITAT_ORIGIN,
      visible: true,
      editable: true,
    },
    'life indicator': {
      type: 'object',
      geometryId: 'indicator',
      name: tr('Life Indicator Light'),
      visible: false,
      editable: true,
      origin: {
        position: Vector3wUnits.centimeters(-10, 4, 110)
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(0, 255, 0),
        },
      },
    },
    'nolife indicator': {
      type: 'object',
      geometryId: 'indicator',
      name: tr('No Life Indicator Light'),
      visible: false,
      editable: true,
      origin: {
        position: Vector3wUnits.centimeters(10, 4, 110)
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },
    */
  }

};