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

const baseScene = createBaseSceneSurface();

const warmingXCm = 9;
const warmingYCm = 23;

const HAMBURGER_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(warmingXCm, warmingYCm, 114),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
};

const HOTDOG_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(warmingXCm, warmingYCm, 102.5),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
};

const TACO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(warmingXCm, warmingYCm, 93),
  orientation: RotationwUnits.eulerDegrees(60, 90, 0),
};

const cupXCm = 8;
const cupYCm = -1;

const CUP_PINK_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(cupXCm, cupYCm, 115.9),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
};

const CUP_BLUE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(cupXCm, cupYCm, 102.5),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
};

const CUP_GREEN_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(cupXCm, cupYCm, 91),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
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

const HOTDOG: Node.Robot = {
  type: 'robot',
  name: tr('Hotdog'),
  robotId: 'hotdog',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: HOTDOG_ORIGIN,
  origin: HOTDOG_ORIGIN
};

const TACO: Node.Robot = {
  type: 'robot',
  name: tr('Taco'),
  robotId: 'taco',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: TACO_ORIGIN,
  origin: TACO_ORIGIN
};

const CUP_PINK: Node.Robot = {
  type: 'robot',
  name: tr('Pink Cup'),
  robotId: 'cup_pink',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: CUP_PINK_ORIGIN,
  origin: CUP_PINK_ORIGIN
};

const CUP_BLUE: Node.Robot = {
  type: 'robot',
  name: tr('Blue Cup'),
  robotId: 'cup_blue',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: CUP_BLUE_ORIGIN,
  origin: CUP_BLUE_ORIGIN
};

const CUP_GREEN: Node.Robot = {
  type: 'robot',
  name: tr('Blue Cup'),
  robotId: 'cup_green',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: CUP_GREEN_ORIGIN,
  origin: CUP_GREEN_ORIGIN
};

export const Table_Sandbox: Scene = {
  ...baseScene,
  name: tr('2025 Game Table'),
  description: tr('2025 Botball game table sandbox'),
  geometry: {
    ...baseScene.geometry,
  },

  nodes: {
    ...baseScene.nodes,
    'hamburger': HAMBURGER,
    'hotdog': HOTDOG,
    'taco': TACO,
    'cup_pink': CUP_PINK,
    'cup_blue': CUP_BLUE,
    'cup_green': CUP_GREEN,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
  }
};