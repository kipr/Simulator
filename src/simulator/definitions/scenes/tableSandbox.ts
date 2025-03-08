// In scenes we build upon the base, and add objects to the scene.
// The objects are set up in the node-templates index.ts file.
// Here we add the objects and their properties to the scene.

import Scene from "../../../state/State/Scene";
// Imports to abuse robot system for collision boxes
import Node from "../../../state/State/Scene/Node";
import AbstractRobot from '../../../programming/AbstractRobot';
import Script from '../../../state/State/Scene/Script';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../../../util/math/unitMath";
import { Distance } from "../../../util";
import Dict from "../../../util/objectOps/Dict";
// import { Color } from '../../../state/State/Scene/Color';
// import LocalizedString from '../../../util/LocalizedString';

import { createBaseSceneSurface } from './tableBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurface();

const WARMING_X = 9;
const HAMBURGER_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(WARMING_X, 24, 114),
};

const HOTDOG_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(WARMING_X, 24, 102.5),
};

const TACO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(WARMING_X, 22, 93),
  orientation: RotationwUnits.eulerDegrees(60, 90, 0),
};

const CUP_X = 8;
const CUP_Y = 1;
const CUP_PINK_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(CUP_X, CUP_Y, 114.5),
};

const CUP_BLUE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(CUP_X, CUP_Y, 102.5),
};

const CUP_GREEN_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(CUP_X, CUP_Y, 91),
};

const POM_Y = 2;
const POM_BLUE_ORIGINS_BACK: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(18, POM_Y, 53),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(18, POM_Y, 43),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(23, POM_Y, 53),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(23, POM_Y, 43),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(28, POM_Y, 53),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(28, POM_Y, 43),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(15.5, POM_Y, 48),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(20.5, POM_Y, 48),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(25.5, POM_Y, 48),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(30.5, POM_Y, 48),
    scale: { x: 100, y: 100, z: 100 },
  },
];

const POM_BLUE_ORIGINS_FRONT = POM_BLUE_ORIGINS_BACK.map((p) => {
  return {
    ...p,
    position: { ...p.position, z: Distance.centimeters(p.position.z.value * -1) },
  };
});

const BOTTLE_Y = 2;
const BOTTLE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(29.5, BOTTLE_Y, 33.4) },
  { position: Vector3wUnits.centimeters(29.5, BOTTLE_Y, 26.3) },
  { position: Vector3wUnits.centimeters(29.5, BOTTLE_Y, 19.2) },
  { position: Vector3wUnits.centimeters(22.4, BOTTLE_Y, 33.4) },
  { position: Vector3wUnits.centimeters(22.4, BOTTLE_Y, 26.3) },
  { position: Vector3wUnits.centimeters(22.4, BOTTLE_Y, 19.2) },
];

const CENTER_LINE_X = 65.5;
const POM_RED_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 0),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 45.72),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, -45.72),
    scale: { x: 100, y: 100, z: 100 },
  },
];
const POM_ORANGE_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X - 11.43, POM_Y, 0),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, -15.24),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 30.48),
    scale: { x: 100, y: 100, z: 100 },
  },
];
const POM_YELLOW_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X - (2 * 11.43), POM_Y, 0),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 15.24),
    scale: { x: 100, y: 100, z: 100 },
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, -30.48),
    scale: { x: 100, y: 100, z: 100 },
  },
];

const TOMATO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(29, 1, -14.3891),
};

const PICKLE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(27, 2.5, -25.8191),
  orientation: RotationwUnits.eulerDegrees(0, 0, 90),
};

const POTATO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(35, 7.3, -85),
  orientation: RotationwUnits.eulerDegrees(0, 90, 0),
};

const FRY_ORIGIN0: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(115, 21, -87),
  // orientation: RotationwUnits.eulerDegrees(0, 90, 0),
  scale: { x: 100, y: 100, z: 100 }
};
const FRY_ORIGIN1: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(115, 21, -89),
  // orientation: RotationwUnits.eulerDegrees(0, 90, 0),
  scale: { x: 100, y: 100, z: 100 }
};

const BOTGUY_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-4, 26, -3),
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

const POMS_BLUE: Dict<Node.FromSpaceTemplate> = {};
for (const [i, pos] of POM_BLUE_ORIGINS_BACK.entries()) {
  POMS_BLUE[`pom_blue${i}`] = {
    type: 'from-space-template',
    name: tr(`Blue pom back #${i}`),
    templateId: 'pom_blue',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

for (const [i, pos] of POM_BLUE_ORIGINS_FRONT.entries()) {
  POMS_BLUE[`pom_blue${i + 10}`] = {
    type: 'from-space-template',
    name: tr(`Blue pom front #${i}`),
    templateId: 'pom_blue',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const BOTTLES: Dict<Node.Robot> = {};
for (const [i, pos] of BOTTLE_ORIGINS.entries()) {
  BOTTLES[`bottle${i}`] = {
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

const POMS_ORANGE: Dict<Node.FromSpaceTemplate> = {};
for (const [i, pos] of POM_ORANGE_ORIGINS.entries()) {
  POMS_ORANGE[`pom_orange${i}`] = {
    type: 'from-space-template',
    name: tr(`Orange pom #${i}`),
    templateId: 'pom_orange',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}
const POMS_RED: Dict<Node.FromSpaceTemplate> = {};
for (const [i, pos] of POM_RED_ORIGINS.entries()) {
  POMS_RED[`pom_red${i}`] = {
    type: 'from-space-template',
    name: tr(`Red pom #${i}`),
    templateId: 'pom_red',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}
const POMS_YELLOW: Dict<Node.FromSpaceTemplate> = {};
for (const [i, pos] of POM_YELLOW_ORIGINS.entries()) {
  POMS_YELLOW[`pom_yellow${i}`] = {
    type: 'from-space-template',
    name: tr(`Yellow pom #${i}`),
    templateId: 'pom_yellow',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const POMS_RANDOM: Dict<Node.FromSpaceTemplate> = {};
const choices = ['pom_red', 'pom_red', 'pom_red', 'pom_orange', 'pom_orange', 'pom_orange', 'pom_yellow', 'pom_yellow', 'pom_yellow'];
for (let i = 0; i < 9; i++) {
  const n = Math.floor(Math.random() * choices.length);
  const robot = choices[n];
  choices.splice(n, 1);

  const pos = {
    position: Vector3wUnits.centimeters(91, POM_Y, (-45.72 + 11.43 * i)),
    scale: { x: 100, y: 100, z: 100 },
  };

  POMS_RANDOM[`pom_random${i}`] = {
    type: 'from-space-template',
    name: tr(`Random pom #${i}`),
    templateId: robot,
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

const FRY0: Node.FromSpaceTemplate = {
  type: 'from-space-template',
  name: tr('French fry #0'),
  templateId: 'french_fry',
  visible: true,
  editable: true,
  startingOrigin: FRY_ORIGIN0,
  origin: FRY_ORIGIN0
};
const FRY1: Node.FromSpaceTemplate = {
  type: 'from-space-template',
  name: tr('French fry #1'),
  templateId: 'french_fry',
  visible: true,
  editable: true,
  startingOrigin: FRY_ORIGIN1,
  origin: FRY_ORIGIN1
};

const TRAYS: Dict<Node.Robot> = {};
for (let i = 0; i < 6; i++) {
  const pos = { position: Vector3wUnits.centimeters(107.5, 3, (19.7 - 13.45 * i)) };

  TRAYS[`tray${i}`] = {
    type: 'robot',
    name: tr(`Tray #${i}`),
    robotId: 'tray',
    state: AbstractRobot.Stateless.NIL,
    visible: true,
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

const DRINKS_BLUE: Dict<Node.FromSpaceTemplate> = {};
for (let i = 0; i < 5; i++) {
  const pos: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(18.6, 2.54 + (5.17 * i), -102.55),
    orientation: RotationwUnits.eulerDegrees(0, 45, 0),
    scale: { x: 100, y: 100, z: 100 }
  };
  DRINKS_BLUE[`drink_blue${i}`] = {
    type: 'from-space-template',
    name: tr(`Blue drink #${i}`),
    templateId: 'drink_blue',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const DRINKS_GREEN: Dict<Node.FromSpaceTemplate> = {};
for (let i = 0; i < 5; i++) {
  const pos: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(0.4, 2.54 + (5.17 * i), 71.252),
    orientation: RotationwUnits.eulerDegrees(0, 45, 0),
    scale: { x: 100, y: 100, z: 100 }
  };
  DRINKS_GREEN[`drink_green${i}`] = {
    type: 'from-space-template',
    name: tr(`Green drink #${i}`),
    templateId: 'drink_green',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const DRINKS_PINK: Dict<Node.FromSpaceTemplate> = {};
for (let i = 0; i < 5; i++) {
  const pos: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(0.4, 2.54 + (5.17 * i), -71.4),
    orientation: RotationwUnits.eulerDegrees(0, 45, 0),
    scale: { x: 100, y: 100, z: 100 }
  };
  DRINKS_PINK[`drink_pink${i}`] = {
    type: 'from-space-template',
    name: tr(`Pink drink #${i}`),
    templateId: 'drink_pink',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const potatoInFryer = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('potato', (type, otherNodeId) => {
  setNodeVisible('fry_floor', false);
}, 'potato_detector');
`;

export const Table_Sandbox: Scene = {
  ...baseScene,
  name: tr('2025 Game Table'),
  description: tr('2025 Botball game table sandbox'),
  geometry: {
    ...baseScene.geometry,
  },
  scripts: {
    potatoInFryer: Script.ecmaScript("Potato in fryer", potatoInFryer),
  },
  nodes: {
    ...baseScene.nodes,
    'hamburger': HAMBURGER,
    'hotdog': HOTDOG,
    'taco': TACO,
    'cup_pink': CUP_PINK,
    'cup_blue': CUP_BLUE,
    'cup_green': CUP_GREEN,
    ...POMS_BLUE,
    ...POMS_ORANGE,
    ...POMS_RED,
    ...POMS_YELLOW,
    ...POMS_RANDOM,
    ...BOTTLES,
    'tomato': TOMATO,
    'pickle': PICKLE,
    'potato': POTATO,
    'fry0': FRY0,
    'fry1': FRY1,
    ...TRAYS,
    ...DRINKS_BLUE,
    ...DRINKS_GREEN,
    ...DRINKS_PINK,
    'botguy': BOTGUY,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
  }
};