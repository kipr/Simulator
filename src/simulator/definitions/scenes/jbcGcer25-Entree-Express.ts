import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Script from '../../../state/State/Scene/Script';

import { createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const WARMING_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-4.3),
    z: Distance.centimeters(121),
  },
};
const BURGER_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(10),
    y: Distance.centimeters(1),
    z: Distance.centimeters(115),
  },
  scale: { x: 100, y: 100, z: 100 },
};
const DOG_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(1),
    z: Distance.centimeters(115),
  },
  scale: { x: 100, y: 100, z: 100 },
};
const TACO_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(-10),
    y: Distance.centimeters(1),
    z: Distance.centimeters(115),
  },
  orientation: RotationwUnits.eulerDegrees(-60, 90, 0),
  scale: { x: 100, y: 100, z: 100 },
};

const TRAYS = {};
for (let i = 0; i < 3; i++) {
  const tray_pos = {
    position: {
      x: Distance.centimeters(25 - (13.45 * i)),
      y: Distance.centimeters(-4),
      z: Distance.centimeters(-29),
    },
    scale: { x: 100, y: 100, z: 100 },
  };
  TRAYS[`tray${i}`] = {
    type: 'from-bb-template',
    templateId: 'tray',
    name: tr(`Tray #${i + 1}`),
    visible: true,
    editable: true,
    startingOrigin: tray_pos,
    origin: tray_pos,
  };
}

const SCRIPTS = Script.ecmaScript(`Entrees script`, `
const trays = ['tray0', 'tray1', 'tray2'];

scene.addOnIntersectionListener('burger', (type, otherNodeId) => {
  // scene.setChallengeEventValue('offMat', visible);
  console.log('Burger placed');
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('burgerTray', type === 'start');
  }
}, [...trays]);
scene.addOnIntersectionListener('hotdog', (type, otherNodeId) => {
  // scene.setChallengeEventValue('offMat', visible);
  console.log('Hotdog placed');
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('dogTray', type === 'start');
  }
}, [...trays]);
scene.addOnIntersectionListener('taco', (type, otherNodeId) => {
  // scene.setChallengeEventValue('offMat', visible);
  console.log('Taco placed');
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('tacoTray', type === 'start');
  }
}, [...trays]);
`);

export const Entree_Express: Scene = {
  ...baseScene,
  name: tr('GCER 2025: Entree Express'),
  description: tr('GCER 2025 special event. Return the entrees to the starting box.'),
  scripts: {
    tacoScript: SCRIPTS,
  },
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
    'warming_station': {
      type: 'from-jbc-template',
      templateId: 'warming_station',
      name: tr('Warming station'),
      startingOrigin: WARMING_ORIGIN,
      origin: WARMING_ORIGIN,
      editable: true,
      visible: true,
    },
    'burger': {
      type: 'from-bb-template',
      templateId: 'hamburger',
      name: tr('Hamburger'),
      startingOrigin: BURGER_ORIGIN,
      origin: BURGER_ORIGIN,
      editable: true,
      visible: true,
    },
    'hotdog': {
      type: 'from-bb-template',
      templateId: 'hotdog',
      name: tr('Hotdog'),
      startingOrigin: DOG_ORIGIN,
      origin: DOG_ORIGIN,
      editable: true,
      visible: true,
    },
    'taco': {
      type: 'from-bb-template',
      templateId: 'taco',
      name: tr('Taco'),
      startingOrigin: TACO_ORIGIN,
      origin: TACO_ORIGIN,
      editable: true,
      visible: true,
    },
    ...TRAYS,
  }
};
