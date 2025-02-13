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
  position: Vector3wUnits.centimeters(cupXCm, cupYCm, 115),
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

const POM_BLUE_ORIGINS_BACK: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(15, 3, 53) },
  { position: Vector3wUnits.centimeters(15, 3, 43) },
  { position: Vector3wUnits.centimeters(20, 3, 53) },
  { position: Vector3wUnits.centimeters(20, 3, 43) },
  { position: Vector3wUnits.centimeters(25, 3, 53) },
  { position: Vector3wUnits.centimeters(25, 3, 43) },
  { position: Vector3wUnits.centimeters(12.5, 3, 48) },
  { position: Vector3wUnits.centimeters(17.5, 3, 48) },
  { position: Vector3wUnits.centimeters(22.5, 3, 48) },
  { position: Vector3wUnits.centimeters(27.5, 3, 48) },
];

const POM_BLUE_ORIGINS_FRONT = POM_BLUE_ORIGINS_BACK.map((p) => {
  return { position: { ...p.position, z: Distance.centimeters(p.position.z.value * -1) } };
});

const BOTTLE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(29, 1, 33.5) },
  { position: Vector3wUnits.centimeters(29, 1, 26.5) },
  { position: Vector3wUnits.centimeters(29, 1, 19.5) },
  { position: Vector3wUnits.centimeters(22, 1, 33.5) },
  { position: Vector3wUnits.centimeters(22, 1, 26.5) },
  { position: Vector3wUnits.centimeters(22, 1, 19.5) },
];

const TOMATO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(29, 1, -15),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
};

const PICKLE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(26, 1, -28),
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
  name: tr('Green Cup'),
  robotId: 'cup_green',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: CUP_GREEN_ORIGIN,
  origin: CUP_GREEN_ORIGIN
};

const POMS_BLUE: Node.Robot[] = Array(20) as Node.Robot[];
for (const [i, pos] of POM_BLUE_ORIGINS_BACK.entries()) {
  POMS_BLUE[i] = {
    type: 'robot',
    name: tr(`Blue pom back #${i}`),
    robotId: 'pom_blue',
    state: AbstractRobot.Stateless.NIL,
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

for (const [i, pos] of POM_BLUE_ORIGINS_FRONT.entries()) {
  POMS_BLUE[i + 10] = {
    type: 'robot',
    name: tr(`Blue pom front #${i}`),
    robotId: 'pom_blue',
    state: AbstractRobot.Stateless.NIL,
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const BOTTLES: Node.Robot[] = Array(6) as Node.Robot[];
for (const [i, pos] of BOTTLE_ORIGINS.entries()) {
  BOTTLES[i] = {
    type: 'robot',
    name: tr(`Bottle #${i}`),
    robotId: 'bottle',
    state: AbstractRobot.Stateless.NIL,
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const TOMATO: Node.Robot = {
  type: 'robot',
  name: tr('Tomato'),
  robotId: 'tomato',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: TOMATO_ORIGIN,
  origin: TOMATO_ORIGIN
};

const PICKLE: Node.Robot = {
  type: 'robot',
  name: tr('Pickle'),
  robotId: 'pickle',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: PICKLE_ORIGIN,
  origin: PICKLE_ORIGIN
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
    'pom_blue0': POMS_BLUE[0],
    'pom_blue1': POMS_BLUE[1],
    'pom_blue2': POMS_BLUE[2],
    'pom_blue3': POMS_BLUE[3],
    'pom_blue4': POMS_BLUE[4],
    'pom_blue5': POMS_BLUE[5],
    'pom_blue6': POMS_BLUE[6],
    'pom_blue7': POMS_BLUE[7],
    'pom_blue8': POMS_BLUE[8],
    'pom_blue9': POMS_BLUE[9],
    'pom_blue10': POMS_BLUE[10],
    'pom_blue11': POMS_BLUE[11],
    'pom_blue12': POMS_BLUE[12],
    'pom_blue13': POMS_BLUE[13],
    'pom_blue14': POMS_BLUE[14],
    'pom_blue15': POMS_BLUE[15],
    'pom_blue16': POMS_BLUE[16],
    'pom_blue17': POMS_BLUE[17],
    'pom_blue18': POMS_BLUE[18],
    'pom_blue19': POMS_BLUE[19],
    'bottle0': BOTTLES[0],
    'bottle1': BOTTLES[1],
    'bottle2': BOTTLES[2],
    'bottle3': BOTTLES[3],
    'bottle4': BOTTLES[4],
    'bottle5': BOTTLES[5],
    'tomato': TOMATO,
    'pickle': PICKLE,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
  }
};