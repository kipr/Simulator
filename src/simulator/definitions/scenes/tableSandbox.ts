// In scenes we build upon the base, and add objects to the scene.
// The objects are set up in the node-templates index.ts file.
// Here we add the objects and their properties to the scene.

import Scene from '../../../state/State/Scene';
import Node from '../../../state/State/Scene/Node';
import Script from '../../../state/State/Scene/Script';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Dict from '../../../util/objectOps/Dict';

import { createBaseSceneSurface } from './tableBase';

import { sprintf } from 'sprintf-js';

import tr from '@i18n';

const baseScene = createBaseSceneSurface();

const WARMING_X = 9;

const HAMBURGER_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(WARMING_X, 24, 114),
};

const HOTDOG_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(WARMING_X, 24, 102.5),
  orientation: RotationwUnits.eulerDegrees(0, 90, 0),
};

const TACO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(WARMING_X, 25, 93),
  orientation: RotationwUnits.eulerDegrees(-60, 0, 0),
};

const CUP_X = 8;
const CUP_Y = 6;
const CUP_PINK_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(CUP_X, CUP_Y, 114.5),
};

const CUP_BLUE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(CUP_X, CUP_Y, 102.5),
};

const CUP_GREEN_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(CUP_X, CUP_Y, 91),
};

const POM_Y = 4;
const POM_BLUE_ORIGINS_BACK: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(18, POM_Y, 53),
  },
  {
    position: Vector3wUnits.centimeters(18, POM_Y, 43),
  },
  {
    position: Vector3wUnits.centimeters(23, POM_Y, 53),
  },
  {
    position: Vector3wUnits.centimeters(23, POM_Y, 43),
  },
  {
    position: Vector3wUnits.centimeters(28, POM_Y, 53),
  },
  {
    position: Vector3wUnits.centimeters(28, POM_Y, 43),
  },
  {
    position: Vector3wUnits.centimeters(15.5, POM_Y, 48),
  },
  {
    position: Vector3wUnits.centimeters(20.5, POM_Y, 48),
  },
  {
    position: Vector3wUnits.centimeters(25.5, POM_Y, 48),
  },
  {
    position: Vector3wUnits.centimeters(30.5, POM_Y, 48),
  },
];

const POM_BLUE_ORIGINS_FRONT = POM_BLUE_ORIGINS_BACK.map((p) => {
  return {
    ...p,
    position: { ...p.position, z: Distance.centimeters(p.position.z.value * -1) },
  };
});

const BOTTLE_Y = 7;
const BOTTLE_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(29.5, BOTTLE_Y, 33.4),
  },
  {
    position: Vector3wUnits.centimeters(29.5, BOTTLE_Y, 26.3),
  },
  {
    position: Vector3wUnits.centimeters(29.5, BOTTLE_Y, 19.2),
  },
  {
    position: Vector3wUnits.centimeters(22.4, BOTTLE_Y, 33.4),
  },
  {
    position: Vector3wUnits.centimeters(22.4, BOTTLE_Y, 26.3),
  },
  {
    position: Vector3wUnits.centimeters(22.4, BOTTLE_Y, 19.2),
  },
];

const CENTER_LINE_X = 65.5;
const POM_RED_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 0),
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 45.72),
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, -45.72),
  },
];
const POM_ORANGE_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X - 11.43, POM_Y, 0),
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, -15.24),
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 30.48),
  },
];
const POM_YELLOW_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X - (2 * 11.43), POM_Y, 0),
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, 15.24),
  },
  {
    position: Vector3wUnits.centimeters(CENTER_LINE_X, POM_Y, -30.48),
  },
];

const TOMATO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(29, 4, -14.3891),
};

const PICKLE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(27, 2, -25.8191),
  orientation: RotationwUnits.eulerDegrees(0, 90, 0),
};

const POTATO_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(35, 10, -85),
  orientation: RotationwUnits.eulerDegrees(-90, 180, 0),
};

const FRY_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(115, 21, -87),
  },
  {
    position: Vector3wUnits.centimeters(115, 21, -88),
  },
  {
    position: Vector3wUnits.centimeters(115, 21, -89),
  },
  {
    position: Vector3wUnits.centimeters(115, 22.5, -87.5),
  },
  {
    position: Vector3wUnits.centimeters(115, 22.5, -88.5),
  },
];

const BOTGUY_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-4, 24, -3),
};


const HAMBURGER: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Hamburger'),
  templateId: 'hamburger',
  visible: true,
  editable: true,
  startingOrigin: HAMBURGER_ORIGIN,
  origin: HAMBURGER_ORIGIN
};
const HOTDOG: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Hotdog'),
  templateId: 'hotdog',
  visible: true,
  editable: true,
  startingOrigin: HOTDOG_ORIGIN,
  origin: HOTDOG_ORIGIN
};
const TACO: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Taco'),
  templateId: 'taco',
  visible: true,
  editable: true,
  startingOrigin: TACO_ORIGIN,
  origin: TACO_ORIGIN
};

const CUP_PINK: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Pink Cup'),
  templateId: 'cup_pink',
  visible: true,
  editable: true,
  startingOrigin: CUP_PINK_ORIGIN,
  origin: CUP_PINK_ORIGIN
};

const CUP_BLUE: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Blue Cup'),
  templateId: 'cup_blue',
  visible: true,
  editable: true,
  startingOrigin: CUP_BLUE_ORIGIN,
  origin: CUP_BLUE_ORIGIN
};

const CUP_GREEN: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Green Cup'),
  templateId: 'cup_green',
  visible: true,
  editable: true,
  startingOrigin: CUP_GREEN_ORIGIN,
  origin: CUP_GREEN_ORIGIN
};

const POMS_BLUE: Dict<Node.FromBBTemplate> = {};
for (const [i, pos] of POM_BLUE_ORIGINS_BACK.entries()) {
  POMS_BLUE[`pom_blue${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Blue pom back #%d'), (str: string) => sprintf(str, i)),
    templateId: 'pom_blue',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

for (const [i, pos] of POM_BLUE_ORIGINS_FRONT.entries()) {
  POMS_BLUE[`pom_blue${i + 10}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Blue pom front #%d'), (str: string) => sprintf(str, i)),
    templateId: 'pom_blue',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const BOTTLES: Dict<Node.FromBBTemplate> = {};
for (const [i, pos] of BOTTLE_ORIGINS.entries()) {
  BOTTLES[`bottle${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Bottle #%d'), (str: string) => sprintf(str, i)),
    templateId: 'bottle',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const POMS_ORANGE: Dict<Node.FromBBTemplate> = {};
for (const [i, pos] of POM_ORANGE_ORIGINS.entries()) {
  POMS_ORANGE[`pom_orange${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Orange pom #%d'), (str: string) => sprintf(str, i)),
    templateId: 'pom_orange',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}
const POMS_RED: Dict<Node.FromBBTemplate> = {};
for (const [i, pos] of POM_RED_ORIGINS.entries()) {
  POMS_RED[`pom_red${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Red pom #%d'), (str: string) => sprintf(str, i)),
    templateId: 'pom_red',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}
const POMS_YELLOW: Dict<Node.FromBBTemplate> = {};
for (const [i, pos] of POM_YELLOW_ORIGINS.entries()) {
  POMS_YELLOW[`pom_yellow${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Yellow pom #%d'), (str: string) => sprintf(str, i)),
    templateId: 'pom_yellow',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const POMS_RANDOM: Dict<Node.FromBBTemplate> = {};
const choices = ['pom_red', 'pom_red', 'pom_red', 'pom_orange', 'pom_orange', 'pom_orange', 'pom_yellow', 'pom_yellow', 'pom_yellow'];
for (let i = 0; i < 9; i++) {
  const n = Math.floor(Math.random() * choices.length);
  const choice = choices[n];
  choices.splice(n, 1);

  const pos = {
    position: Vector3wUnits.centimeters(91, POM_Y, (-45.72 + 11.43 * i)),
  };

  POMS_RANDOM[`pom_random${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Random pom #%d'), (str: string) => sprintf(str, i)),
    templateId: choice,
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const TOMATO: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Tomato'),
  templateId: 'tomato',
  visible: true,
  editable: true,
  startingOrigin: TOMATO_ORIGIN,
  origin: TOMATO_ORIGIN
};

const PICKLE: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Pickle'),
  templateId: 'pickle',
  visible: true,
  editable: true,
  startingOrigin: PICKLE_ORIGIN,
  origin: PICKLE_ORIGIN
};

const POTATO: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Potato'),
  templateId: 'potato',
  visible: true,
  editable: true,
  startingOrigin: POTATO_ORIGIN,
  origin: POTATO_ORIGIN
};

const FRIES: Dict<Node.FromBBTemplate> = {};
for (const [i, pos] of FRY_ORIGINS.entries()) {
  FRIES[`fry${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Fry #%d'), (str: string) => sprintf(str, i)),
    templateId: 'french_fry',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const TRAYS: Dict<Node.FromBBTemplate> = {};
for (let i = 0; i < 6; i++) {
  const pos = {
    position: Vector3wUnits.centimeters(107.5, 3, (19.7 - 13.45 * i)),
    orientation: RotationwUnits.eulerDegrees(0, 90, 0),
  };

  TRAYS[`tray${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Tray #%d'), (str: string) => sprintf(str, i)),
    templateId: 'tray',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const BOTGUY: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Botguy'),
  templateId: 'botguy_gamepiece',
  visible: true,
  editable: true,
  startingOrigin: BOTGUY_ORIGIN,
  origin: BOTGUY_ORIGIN
};

const DRINKS_BLUE: Dict<Node.FromBBTemplate> = {};
for (let i = 0; i < 5; i++) {
  const pos: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(18.6, 2.54 + (5.17 * i), -102.55),
    orientation: RotationwUnits.eulerDegrees(0, 45, 0),
  };
  DRINKS_BLUE[`drink_blue${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Blue drink #%d'), (str: string) => sprintf(str, i)),
    templateId: 'drink_blue',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const DRINKS_GREEN: Dict<Node.FromBBTemplate> = {};
for (let i = 0; i < 5; i++) {
  const pos: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(0.4, 2.54 + (5.17 * i), 71.252),
    orientation: RotationwUnits.eulerDegrees(0, 45, 0),
  };
  DRINKS_GREEN[`drink_green${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Green drink #%d'), (str: string) => sprintf(str, i)),
    templateId: 'drink_green',
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const DRINKS_PINK: Dict<Node.FromBBTemplate> = {};
for (let i = 0; i < 5; i++) {
  const pos: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(0.4, 2.54 + (5.17 * i), -71.4),
    orientation: RotationwUnits.eulerDegrees(0, 45, 0),
  };
  DRINKS_PINK[`drink_pink${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Pink drink #%d'), (str: string) => sprintf(str, i)),
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
    potatoInFryer: Script.ecmaScript('Potato in fryer', potatoInFryer),
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
    ...FRIES,
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
