import Scene from "../state/State/Scene";
import Script from '../state/State/Scene/Script';
import { ReferenceFrame, Rotation } from "../unit-math";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './moonBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const BASALT_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-15),
    y: Distance.centimeters(3),
    z: Distance.centimeters(61.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};
const ANORTHOSITE_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(3),
    z: Distance.centimeters(61.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};
const BRECCIA_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(15),
    y: Distance.centimeters(3),
    z: Distance.centimeters(61.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 2,
  }),
};
const METEORITE_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(30),
    y: Distance.centimeters(3),
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
    'basalt1': {
      type: 'from-rock-template',
      templateId: 'basalt',
      name: tr('Basalt Rock'),
      startingOrigin: BASALT_ORIGIN,
      origin: BASALT_ORIGIN,
      editable: true,
      visible: true,
    },
    'anorthosite1': {
      type: 'from-rock-template',
      templateId: 'anorthosite',
      name: tr('Anorthosite Rock'),
      startingOrigin: ANORTHOSITE_ORIGIN,
      origin: ANORTHOSITE_ORIGIN,
      editable: true,
      visible: true,
    },
    'breccia1': {
      type: 'from-rock-template',
      templateId: 'breccia',
      name: tr('Breccia Rock'),
      startingOrigin: BRECCIA_ORIGIN,
      origin: BRECCIA_ORIGIN,
      editable: true,
      visible: true,
    },
    'meteorite1': {
      type: 'from-rock-template',
      templateId: 'meteorite',
      name: tr('Meteorite Rock'),
      startingOrigin: METEORITE_ORIGIN,
      origin: METEORITE_ORIGIN,
      editable: true,
      visible: true,
    },
  }
  
};