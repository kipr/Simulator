import Scene from "../state/State/Scene";
import { Color } from '../state/State/Scene/Color';
import Script from '../state/State/Scene/Script';
import { Rotation } from "../unit-math";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const clicked = `
// When the robot is clicked, the cans 1-4 become visible.

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

let clicked = false;

scene.addOnClickListener(['robot', 'volume'], id => {
  clicked = !clicked;
  console.log('Clicked!', id, clicked);
  setNodeVisible('can1', clicked);
  setNodeVisible('can2', clicked);
  setNodeVisible('can3', clicked);
  setNodeVisible('can4', clicked);
});
`;

const intersection = `
// While the robot is intersecting "volume", cans 10-12 are visible.

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Intersection!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('a', visible);
}, 'volume');
`;

const collision = `
// When can6 and can9 collide, they both become
// invisible and can5 and can7 become visible.

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnCollisionListener('can6', (otherNodeId) => {
  setNodeVisible('can6', false);
  setNodeVisible('can9', false);
  setNodeVisible('can5', true);
  setNodeVisible('can7', true);
}, 'can9');
`;

export const scriptPlayground: Scene = {
  ...baseScene,
  name: tr('Script Playground'),
  description: tr('Script tests'),
  scripts: {
    'intersection': Script.ecmaScript('Intersection', intersection),
    'collision': Script.ecmaScript('Collision', collision),
    'clicked': Script.ecmaScript('Clicked', clicked),
  },
  geometry: {
    ...baseScene.geometry,
    'volume_geom': {
      type: 'box',
      size: {
        x: Distance.meters(0.5),
        y: Distance.meters(0.5),
        z: Distance.meters(0.5),
      }
    }
  },
  nodes: {
    ...baseScene.nodes,
    'volume': {
      type: 'object',
      geometryId: 'volume_geom',
      name: tr('Volume', 'Volume (box) in the 3D scene'),
      visible: true,
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(0.25),
          z: Distance.meters(0),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 128, 128)
        }
      },
    },
    'can1': createCanNode(1, undefined, true, false),
    'can2': createCanNode(2, undefined, true, false),
    'can3': createCanNode(3, undefined, true, false),
    'can4': createCanNode(4, undefined, true, false),
    'can5': createCanNode(5, undefined, true, false),
    'can6': createCanNode(6, undefined, true, true),
    'can7': createCanNode(7, undefined, true, false),
    'can8': createCanNode(8, undefined, true, false),
    'can9': createCanNode(9, undefined, true, true),
    'can10': createCanNode(10, undefined, true, false),
    'can11': createCanNode(11, undefined, true, false),
    'can12': createCanNode(12, undefined, true, false),
    'ream1': {
      type: 'from-template',
      templateId: 'ream',
      name: tr('Paper Ream 1'),
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(5),
          z: Distance.centimeters(67.5),
        },
        orientation: Rotation.AxisAngle.fromRaw({
          axis: { x: 1, y: 0, z: 0 },
          angle: -Math.PI / 2,
        }),
      },
      editable: true,
      visible: false,
    },
    'ream2': {
      type: 'from-template',
      templateId: 'ream',
      name: tr('Paper Ream 2'),
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(5),
          z: Distance.centimeters(-6.3),
        },
        orientation: Rotation.AxisAngle.fromRaw({
          axis: { x: 1, y: 0, z: 0 },
          angle: -Math.PI / 2,
        }),
      },
      editable: true,
      visible: false,
    },
  }
};