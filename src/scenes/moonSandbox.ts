import Scene from "../state/State/Scene";
import Script from '../state/State/Scene/Script';
import { ReferenceFrame, Rotation } from "../unit-math";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurface } from './moonBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurface();

const TOWER_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-50),
    y: Distance.centimeters(1),
    z: Distance.centimeters(61.3),
  },
};

const LIFESCIENCE_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-50),
    y: Distance.centimeters(1),
    z: Distance.centimeters(50.3),
  },
};

const RADSCIENCE_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-50),
    y: Distance.centimeters(1),
    z: Distance.centimeters(40.3),
  },
};

const HAB_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-50),
    y: Distance.centimeters(1),
    z: Distance.centimeters(20.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};

const SOLAR_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(50),
    y: Distance.centimeters(5),
    z: Distance.centimeters(20.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};

const BASALT_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-30),
    y: Distance.centimeters(1),
    z: Distance.centimeters(61.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};
const ANORTHOSITE_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-15),
    y: Distance.centimeters(1),
    z: Distance.centimeters(61.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};
const BRECCIA_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(1),
    z: Distance.centimeters(61.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};
const METEORITE_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(15),
    y: Distance.centimeters(1),
    z: Distance.centimeters(61.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};
export const Moon_Sandbox: Scene = {
  ...baseScene,
  name: tr('Moon Sandbox'),
  description: tr('Lunar sandbox. Currently supports 4 types of rocks.'),
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
    'hab': {
      type: 'from-rock-template',
      templateId: 'hab',
      name: tr('Hab'),
      startingOrigin: HAB_ORIGIN,
      origin: HAB_ORIGIN,
      editable: true,
      visible: true,
    },
    'solar': {
      type: 'from-rock-template',
      templateId: 'solar',
      name: tr('Solar Panel'),
      startingOrigin: SOLAR_ORIGIN,
      origin: SOLAR_ORIGIN,
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
      type: 'from-rock-template',
      templateId: 'tower',
      name: tr('Comms Tower'),
      startingOrigin: TOWER_ORIGIN,
      origin: TOWER_ORIGIN,
      editable: true,
      visible: true,
    },
    'lifescience': {
      type: 'from-rock-template',
      templateId: 'lifescience',
      name: tr('Life Science Pack'),
      startingOrigin: LIFESCIENCE_ORIGIN,
      origin: LIFESCIENCE_ORIGIN,
      editable: true,
      visible: true,
    },
    'radscience': {
      type: 'from-rock-template',
      templateId: 'radscience',
      name: tr('Radiation Science Pack'),
      startingOrigin: RADSCIENCE_ORIGIN,
      origin: RADSCIENCE_ORIGIN,
      editable: true,
      visible: true,
    },
  }
  
};