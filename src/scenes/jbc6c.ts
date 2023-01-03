import Scene from "../state/State/Scene";
import { Color } from '../state/State/Scene/Color';
import { Color3, StandardMaterial, GlowLayer } from 'babylonjs';
import Script from '../state/State/Scene/Script';
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

const intersect2 = `
// When the the green garage can is intersecting circle 2, the circle glows.

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('can1', (type, otherNodeId) => {
  console.log('Can 1 placed!', type, otherNodeId);
  const visible = type === 'start';
  setNodeVisible('circle2', visible);
  scene.setChallengeEventValue('canAPlaced', visible);
}, 'circle2');
`;

const intersect10 = `
// When the the blue garage can is intersecting circle 10, the circle glows.

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('can2', (type, otherNodeId) => {
  console.log('Can 2 placed!', type, otherNodeId);
  const visible = type === 'start';
  setNodeVisible('circle10', visible);
  scene.setChallengeEventValue('canBPlaced', visible);
}, 'circle10');
`;

const intersect9 = `
// When the the yellow garage can is intersecting circle 9, the circle glows.

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('can3', (type, otherNodeId) => {
  console.log('Can 3 placed!', type, otherNodeId);
  const visible = type === 'start';
  setNodeVisible('circle9', visible);
  scene.setChallengeEventValue('canCPlaced', visible);
}, 'circle9');
`;

export const JBC_6C: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 6C' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 6C: Empty the Garage` },
  scripts: {
    'intersect2': Script.ecmaScript('Intersect 2', intersect2),
    'intersect9': Script.ecmaScript('Intersect 9', intersect9),
    'intersect10': Script.ecmaScript('Intersect 10', intersect10),
  },
  geometry: {
    ...baseScene.geometry,
    'circle2_geom': {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    'circle9_geom': {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    'circle10_geom': {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
  },
  nodes: {
    ...baseScene.nodes,
    'circle2': {
      type: 'object',
      geometryId: 'circle2_geom',
      name: { [LocalizedString.EN_US]: 'Circle 2' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(28.8),
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
    'circle9': {
      type: 'object',
      geometryId: 'circle9_geom',
      name: { [LocalizedString.EN_US]: 'Circle 9' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(85.4),
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
    'circle10': {
      type: 'object',
      geometryId: 'circle10_geom',
      name: { [LocalizedString.EN_US]: 'Circle 10' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(19.3),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(96.9),
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
    'can1': createCanNode(1, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(53.3) }),
    'can2': createCanNode(2, { x: Distance.centimeters(18.5), y: Distance.centimeters(0), z: Distance.centimeters(78) }),
    'can3': createCanNode(3, { x: Distance.centimeters(-12.3), y: Distance.centimeters(0), z: Distance.centimeters(93.9) }),
  }
};