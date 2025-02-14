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
};

const HOTDOG_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(warmingXCm, warmingYCm, 102.5),
};

const TACO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(warmingXCm, warmingYCm, 93),
  orientation: RotationwUnits.eulerDegrees(60, 90, 0),
};

const cupXCm = 8;
const cupYCm = -1;

const CUP_PINK_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(cupXCm, cupYCm, 115),
};

const CUP_BLUE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(cupXCm, cupYCm, 102.5),
};

const CUP_GREEN_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(cupXCm, cupYCm, 91),
};

const POM_Y = 1;
const POM_BLUE_ORIGINS_BACK: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(15, POM_Y, 53) },
  { position: Vector3wUnits.centimeters(15, POM_Y, 43) },
  { position: Vector3wUnits.centimeters(20, POM_Y, 53) },
  { position: Vector3wUnits.centimeters(20, POM_Y, 43) },
  { position: Vector3wUnits.centimeters(25, POM_Y, 53) },
  { position: Vector3wUnits.centimeters(25, POM_Y, 43) },
  { position: Vector3wUnits.centimeters(12.5, POM_Y, 48) },
  { position: Vector3wUnits.centimeters(17.5, POM_Y, 48) },
  { position: Vector3wUnits.centimeters(22.5, POM_Y, 48) },
  { position: Vector3wUnits.centimeters(27.5, POM_Y, 48) },
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

const CENTER_LINE_X = 65.5;
const POM_RED_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 0) },
  { position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 45.72) },
  { position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, -45.72) },
];
const POM_ORANGE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(CENTER_LINE_X - 11.43,  POM_Y, 0) },
  { position: Vector3wUnits.centimeters(CENTER_LINE_X,          POM_Y, -15.24) },
  { position: Vector3wUnits.centimeters(CENTER_LINE_X,          POM_Y, 30.48) },
];
const POM_YELLOW_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(CENTER_LINE_X - (2 * 11.43),  POM_Y, 0) },
  { position: Vector3wUnits.centimeters(CENTER_LINE_X,                POM_Y, 15.24) },
  { position: Vector3wUnits.centimeters(CENTER_LINE_X,                POM_Y, -30.48) },
];

const BOTTOM_LINE_x = 91;
const POM_RANDOM_ORIGINS = Array(9) as ReferenceFramewUnits[];
for (let i = 0; i < POM_RANDOM_ORIGINS.length; i++) {
  const z = -45.72 + 11.43 * i;
  POM_RANDOM_ORIGINS[i] = { position: Vector3wUnits.centimeters(BOTTOM_LINE_x, POM_Y, z) };
}

const TOMATO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(29, 1, -15),
};

const PICKLE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(26, 1, -28),
};

const POTATO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(35, 7, -85),
  orientation: RotationwUnits.eulerDegrees(0, 90, 0),
};

const FRY_ORIGIN0: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(115, 20, -88),
  orientation: RotationwUnits.eulerDegrees(0, 90, 0),
};
const FRY_ORIGIN1: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(115, 20, -90),
  orientation: RotationwUnits.eulerDegrees(0, 90, 0),
};

const TRAY_X = 107;
const TRAY_ORIGINS = Array(6) as ReferenceFramewUnits[];
for (let i = 0; i < TRAY_ORIGINS.length; i++) {
  const z = 20.1 - 13.4 * i;
  TRAY_ORIGINS[i] = { position: Vector3wUnits.centimeters(TRAY_X, 10, z) };
}

const BOTGUY_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-4, 25, -3),
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

const POMS_RED: Node.Robot[] = Array(3) as Node.Robot[];
for (const [i, pos] of POM_RED_ORIGINS.entries()) {
  POMS_RED[i] = {
    type: 'robot',
    name: tr(`Red pom #${i}`),
    robotId: 'pom_red',
    state: AbstractRobot.Stateless.NIL,
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}
const POMS_ORANGE: Node.Robot[] = Array(3) as Node.Robot[];
for (const [i, pos] of POM_ORANGE_ORIGINS.entries()) {
  POMS_ORANGE[i] = {
    type: 'robot',
    name: tr(`Orange pom #${i}`),
    robotId: 'pom_orange',
    state: AbstractRobot.Stateless.NIL,
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}
const POMS_YELLOW: Node.Robot[] = Array(3) as Node.Robot[];
for (const [i, pos] of POM_YELLOW_ORIGINS.entries()) {
  POMS_YELLOW[i] = {
    type: 'robot',
    name: tr(`Yellow pom #${i}`),
    robotId: 'pom_yellow',
    state: AbstractRobot.Stateless.NIL,
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const POMS_RANDOM: Node.Robot[] = Array(9) as Node.Robot[];
for (const [i, pos] of POM_RANDOM_ORIGINS.entries()) {
  let robot: string;
  switch (Math.floor(Math.random() * 3)) {
    case 0:
      robot = 'pom_red';
      break;
    case 1:
      robot = 'pom_orange';
      break;
    case 2:
      robot = 'pom_yellow';
      break;
  }

  POMS_RANDOM[i] = {
    type: 'robot',
    name: tr(`Random pom #${i}`),
    robotId: robot,
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

const POTATO: Node.Robot = {
  type: 'robot',
  name: tr('Potato'),
  robotId: 'potato',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: POTATO_ORIGIN,
  origin: POTATO_ORIGIN
};

const FRY0: Node.Robot = {
  type: 'robot',
  name: tr('French fry #0'),
  robotId: 'fry',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: FRY_ORIGIN0,
  origin: FRY_ORIGIN0
};
const FRY1: Node.Robot = {
  type: 'robot',
  name: tr('French fry #1'),
  robotId: 'fry',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: FRY_ORIGIN1,
  origin: FRY_ORIGIN1
};

const TRAYS: Node.Robot[] = Array(6) as Node.Robot[];
for (const [i, pos] of TRAY_ORIGINS.entries()) {
  TRAYS[i] = {
    type: 'robot',
    name: tr(`Tray #${i}`),
    robotId: 'tray',
    state: AbstractRobot.Stateless.NIL,
    visible: false,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const BOTGUY: Node.Robot = {
  type: 'robot',
  name: tr('Botguy'),
  robotId: 'botguy',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: true,
  startingOrigin: BOTGUY_ORIGIN,
  origin: BOTGUY_ORIGIN
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
    'pom_red0': POMS_RED[0],
    'pom_red1': POMS_RED[1],
    'pom_red2': POMS_RED[2],
    'pom_orange0': POMS_ORANGE[0],
    'pom_orange1': POMS_ORANGE[1],
    'pom_orange2': POMS_ORANGE[2],
    'pom_yellow0': POMS_YELLOW[0],
    'pom_yellow1': POMS_YELLOW[1],
    'pom_yellow2': POMS_YELLOW[2],
    'pom_random0': POMS_RANDOM[0],
    'pom_random1': POMS_RANDOM[1],
    'pom_random2': POMS_RANDOM[2],
    'pom_random3': POMS_RANDOM[3],
    'pom_random4': POMS_RANDOM[4],
    'pom_random5': POMS_RANDOM[5],
    'pom_random6': POMS_RANDOM[6],
    'pom_random7': POMS_RANDOM[7],
    'pom_random8': POMS_RANDOM[8],
    'bottle0': BOTTLES[0],
    'bottle1': BOTTLES[1],
    'bottle2': BOTTLES[2],
    'bottle3': BOTTLES[3],
    'bottle4': BOTTLES[4],
    'bottle5': BOTTLES[5],
    'tomato': TOMATO,
    'pickle': PICKLE,
    'potato': POTATO,
    'fry0': FRY0,
    'fry1': FRY1,
    // 'tray0': TRAYS[0],
    // 'tray1': TRAYS[1],
    // 'tray2': TRAYS[2],
    // 'tray3': TRAYS[3],
    // 'tray4': TRAYS[4],
    // 'tray5': TRAYS[5],
    'botguy': BOTGUY,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
  }
};