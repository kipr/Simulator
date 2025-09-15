// In scenes we build upon the base, and add objects to the scene.
// The objects are set up in the node-templates index.ts file.
// Here we add the objects and their properties to the scene.

import Scene from '../../../state/State/Scene';
import Node from '../../../state/State/Scene/Node';
import Script from '../../../state/State/Scene/Script';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { RawQuaternion } from '../../../util/math/math';
import { Distance } from '../../../util';
import Dict from '../../../util/objectOps/Dict';

import { createBaseSceneSurface } from './26fallTableBase';

import { sprintf } from 'sprintf-js';

import tr from '@i18n';
import EditableList from 'components/EditableList';
import { Quaternion } from '@babylonjs/core';

const baseScene = createBaseSceneSurface();

const POM_GAP = 6.35;
const POMS_BLUE: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(145 - POM_GAP * (i % 3), -3, 80 - Math.floor(i / 3) * 2 * POM_GAP)
  };
  POMS_BLUE[`pom_blue${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Blue Pom #%d'), (str: string) => sprintf(str, i)),
    templateId: 'pomBlue2in',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}
const POMS_ORANGE: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(145 - POM_GAP * (i % 3), -3, 73.65 - Math.floor(i / 3) * 2 * POM_GAP)
  };
  POMS_ORANGE[`pom_orange${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Orange Pom #%d'), (str: string) => sprintf(str, i)),
    templateId: 'pom_orange',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}
const POMS_RANDOM: Dict<Node.FromBBTemplate> = {};
let choices = ['pomBlue2in', 'pomBlue2in', 'pomBlue2in', 'pomBlue2in', 'pomBlue2in', 'pomBlue2in',
  'pom_orange', 'pom_orange', 'pom_orange', 'pom_orange', 'pom_orange', 'pom_orange'];
for (let i = 0; i < 12; i++) {
  let rand = Math.random();
  const n = Math.floor(rand * choices.length);
  const choice = choices[n];
  choices.splice(n, 1);
  rand = rand * 20 - 3;

  const pos = {
    position: Vector3wUnits.centimeters(-11 + POM_GAP * (i % 4), 1 * rand, 80 - Math.floor(i / 4) * POM_GAP),
    orientation: RotationwUnits.eulerRadians(rand, rand, rand)
  };

  POMS_RANDOM[`pom_random${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Random Pom #%d'), (str: string) => sprintf(str, i)),
    templateId: choice,
    visible: true,
    editable: true,
    startingOrigin: pos,
    origin: pos
  };
}

const PALLET_ORIENTATION = RotationwUnits.eulerDegrees(0, 90, 0);
const DOCK_X = 153.25;
const DOCK_Y = 0;
const DOCK_PALLET_1_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(DOCK_X, DOCK_Y, 81.75),
  orientation: PALLET_ORIENTATION
};
const DOCK_PALLET_2_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(DOCK_X, DOCK_Y, 61.23),
  orientation: PALLET_ORIENTATION
};

const RAISED_DOCK_PALLETS: Dict<Node.FromBBTemplate> = {
  dock_pallet_1: {
    type: 'from-bb-template',
    name: tr('Raised Dock Pallet #1'),
    templateId: 'pallet',
    visible: true,
    editable: true,
    origin: DOCK_PALLET_1_ORIGIN,
    startingOrigin: DOCK_PALLET_1_ORIGIN
  },
  dock_pallet_2: {
    type: 'from-bb-template',
    name: tr('Raised Dock Pallet #2'),
    templateId: 'pallet',
    visible: true,
    editable: true,
    origin: DOCK_PALLET_2_ORIGIN,
    startingOrigin: DOCK_PALLET_2_ORIGIN
  }
};
const STORAGE_Y = 10;
const STORAGE_X = -24.4;
const STORAGE_PALLET_1_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(STORAGE_X, STORAGE_Y, -12),
  orientation: PALLET_ORIENTATION
};
const STORAGE_PALLET_2_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(STORAGE_X, STORAGE_Y, -22),
  orientation: PALLET_ORIENTATION
};
const STORAGE_PALLETS: Dict<Node.FromBBTemplate> = {
  storage_pallet_1: {
    type: 'from-bb-template',
    name: tr('Storage Pallet #1'),
    templateId: 'pallet',
    visible: true,
    editable: true,
    origin: STORAGE_PALLET_1_ORIGIN,
    startingOrigin: STORAGE_PALLET_1_ORIGIN
  },
  storage_pallet_2: {
    type: 'from-bb-template',
    name: tr('Storage Pallet #2'),
    templateId: 'pallet',
    visible: true,
    editable: true,
    origin: STORAGE_PALLET_2_ORIGIN,
    startingOrigin: STORAGE_PALLET_2_ORIGIN
  }
};

const BOTGUY_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(STORAGE_X + 1, STORAGE_Y + 15, -17),
  orientation: RotationwUnits.eulerDegrees(0, 270, 0)
};
const BOTGUY: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('Botguy'),
  templateId: 'botguy_gamepiece',
  visible: true,
  editable: true,
  startingOrigin: BOTGUY_ORIGIN,
  origin: BOTGUY_ORIGIN
};

const LEFT_CUBE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(120, -3, -20.25) },
  { position: Vector3wUnits.centimeters(120, -3, -15.17) },
  { position: Vector3wUnits.centimeters(114.92, -3, -20.25) },
  { position: Vector3wUnits.centimeters(114.92, -3, -15.17) },
  { position: Vector3wUnits.centimeters(117.46, 2.08, -20.25) },
  { position: Vector3wUnits.centimeters(117.46, 2.08, -15.17) },
];
const LEFT_CUBES: Dict<Node.FromBBTemplate> = {};
const leftCubeChoices = ['cubeRed2in', 'cubeGreen2in', 'cubeYellow2in'];
for (let i = 0; i < 3; i++) {
  const n = Math.floor(Math.random() * leftCubeChoices.length);
  const choice = leftCubeChoices[n];
  leftCubeChoices.splice(n, 1);

  let cubeNum = 2 * i;
  LEFT_CUBES[`left${choice}${cubeNum}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Left Stack Cube #%d'), (str: string) => sprintf(str, cubeNum + 1)),
    templateId: choice,
    visible: true,
    editable: true,
    startingOrigin: LEFT_CUBE_ORIGINS[cubeNum],
    origin: LEFT_CUBE_ORIGINS[cubeNum]
  };
  cubeNum++;
  LEFT_CUBES[`left${choice}${cubeNum}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Left Stack Cube #%d'), (str: string) => sprintf(str, cubeNum + 1)),
    templateId: choice,
    visible: true,
    editable: true,
    startingOrigin: LEFT_CUBE_ORIGINS[cubeNum],
    origin: LEFT_CUBE_ORIGINS[cubeNum]
  };
}

const RIGHT_CUBE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(24.99, -3, -20.25) },
  { position: Vector3wUnits.centimeters(19.91, -3, -20.25) },
  { position: Vector3wUnits.centimeters(24.99, -3, -15.17) },
  { position: Vector3wUnits.centimeters(19.91, -3, -15.17) },
  { position: Vector3wUnits.centimeters(24.99, 2.08, -17.71) },
  { position: Vector3wUnits.centimeters(19.91, 2.08, -17.71) },
];
const RIGHT_CUBES: Dict<Node.FromBBTemplate> = {};
const rightCubeChoices = ['cubeRed2in', 'cubeGreen2in', 'cubeYellow2in'];
for (let i = 0; i < 3; i++) {
  const n = Math.floor(Math.random() * rightCubeChoices.length);
  const choice = rightCubeChoices[n];
  rightCubeChoices.splice(n, 1);

  let cubeNum = 2 * i;
  RIGHT_CUBES[`right${choice}${cubeNum}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Right Stack Cube #%d'), (str: string) => sprintf(str, cubeNum + 1)),
    templateId: choice,
    visible: true,
    editable: true,
    startingOrigin: RIGHT_CUBE_ORIGINS[cubeNum],
    origin: RIGHT_CUBE_ORIGINS[cubeNum]
  };
  cubeNum++;
  RIGHT_CUBES[`right${choice}${cubeNum}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Right Stack Cube #%d'), (str: string) => sprintf(str, cubeNum + 1)),
    templateId: choice,
    visible: true,
    editable: true,
    startingOrigin: RIGHT_CUBE_ORIGINS[cubeNum],
    origin: RIGHT_CUBE_ORIGINS[cubeNum]
  };
}

const UPPER_CUBE_Y = STORAGE_Y + 5.08;
const UPPER_CUBE_Z = 14.1;
const BIG_CUBE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(STORAGE_X, UPPER_CUBE_Y, UPPER_CUBE_Z) },
  { position: Vector3wUnits.centimeters(STORAGE_X - 25.4, UPPER_CUBE_Y, UPPER_CUBE_Z) },
  { position: Vector3wUnits.centimeters(STORAGE_X - 50.8, UPPER_CUBE_Y, UPPER_CUBE_Z) }
];
const BIG_CUBES: Dict<Node> = {
  redCube4in: {
    type: 'from-bb-template',
    name: tr('Red Cube (4 inch)'),
    templateId: 'cubeRed4in',
    visible: true,
    editable: true,
    startingOrigin: BIG_CUBE_ORIGINS[0],
    origin: BIG_CUBE_ORIGINS[0]
  },
  brownCube4in: {
    type: 'from-bb-template',
    name: tr('Brown Cube (4 inch)'),
    templateId: 'cubeBrown4in',
    visible: true,
    editable: true,
    startingOrigin: BIG_CUBE_ORIGINS[1],
    origin: BIG_CUBE_ORIGINS[1]
  },
  greenCube4in: {
    type: 'from-bb-template',
    name: tr('Green Cube (4 inch)'),
    templateId: 'cubeGreen4in',
    visible: true,
    editable: true,
    startingOrigin: BIG_CUBE_ORIGINS[2],
    origin: BIG_CUBE_ORIGINS[2]
  }
};

const CONE_Z = 54.37;
const CONE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(-20, -5, CONE_Z) },
  { position: Vector3wUnits.centimeters(126.9, -5, CONE_Z) }
]
const CONES: Dict<Node> = {
  rightCone: {
    type: 'from-bb-template',
    name: tr('Right Traffic Cone'),
    templateId: 'trafficCone',
    visible: true,
    editable: true,
    startingOrigin: CONE_ORIGINS[0],
    origin: CONE_ORIGINS[0]
  },
  leftCone: {
    type: 'from-bb-template',
    name: tr('Left Traffic Cone'),
    templateId: 'trafficCone',
    visible: true,
    editable: true,
    startingOrigin: CONE_ORIGINS[1],
    origin: CONE_ORIGINS[1]
  }
};

const BASKET_Z = -8.1;
const BASKET_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(-32.2, -5, BASKET_Z) },
  { position: Vector3wUnits.centimeters(-65.9, -5, BASKET_Z) }
];
const BASKETS: Dict<Node> = {
  leftBasket: {
    type: 'from-bb-template',
    name: tr('Left Basket'),
    templateId: 'basket',
    visible: true,
    editable: true,
    startingOrigin: BASKET_ORIGINS[0],
    origin: BASKET_ORIGINS[0]
  },
  rightBasket: {
    type: 'from-bb-template',
    name: tr('Right Basket'),
    templateId: 'basket',
    visible: true,
    editable: true,
    startingOrigin: BASKET_ORIGINS[1],
    origin: BASKET_ORIGINS[1]
  }
};

const PVC_ORIENTATION = RotationwUnits.fromRawQuaternion(RawQuaternion.create(0.6935, 0.1379, 0.1379, 0.6935), 'axis-angle')
const LEFT_PVC: Dict<Node> = {};
for (let i = 0; i < 4; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(74.4 - 4.23 * i, -3.8, 89.2),
    // Rotation equivalent to 90 about the X axis followed by 22.5 about the Z.
    // Use quaternion here to avoid gimball locking.
    orientation: PVC_ORIENTATION
  };
  LEFT_PVC[`left_pvc${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Left PCV #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pcv2in',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}

const RIGHT_PVC: Dict<Node> = {};
for (let i = 0; i < 4; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(8.75 + 4.23 * i, -3.8, 89.2),
    // Rotation equivalent to 90 about the X axis followed by 22.5 about the Z.
    // Use quaternion here to avoid gimball locking.
    orientation: PVC_ORIENTATION
  };
  RIGHT_PVC[`right_pvc${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Right PCV #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pcv2in',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}

export const FALL_26_SANDBOX: Scene = {
  ...baseScene,
  name: tr('2026 Fall Game Table'),
  description: tr('2026 Fall Botball game table sandbox'),
  geometry: {
    ...baseScene.geometry,
  },
  scripts: {},
  nodes: {
    ...baseScene.nodes,
    ...POMS_BLUE,
    ...POMS_ORANGE,
    ...POMS_RANDOM,
    ...RAISED_DOCK_PALLETS,
    ...STORAGE_PALLETS,
    ...LEFT_CUBES,
    ...RIGHT_CUBES,
    ...BIG_CUBES,
    ...CONES,
    ...BASKETS,
    ...LEFT_PVC,
    ...RIGHT_PVC,
    botguy: BOTGUY,
  }
};
