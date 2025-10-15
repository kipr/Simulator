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

import { createBaseSceneSurface } from './26springTableBase';

import { sprintf } from 'sprintf-js';

import tr from '@i18n';
import EditableList from 'components/EditableList';
import { Quaternion } from '@babylonjs/core';
import { Ref } from 'colorjs.io/types/src/space';

const baseScene = createBaseSceneSurface();

const DOOR_X = 98;
const DOOR_Y = 9;
const DOOR1_Z = 90;
const DOOR_ORIENTATION = RotationwUnits.eulerDegrees(0, 0, 95);
const DOOR1_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(DOOR_X, DOOR_Y, DOOR1_Z),
  orientation: DOOR_ORIENTATION
};
const DOOR2_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(DOOR_X, DOOR_Y, DOOR1_Z + 20.32),
  orientation: DOOR_ORIENTATION
};

const DOORS: Dict<Node.FromBBTemplate> = {
  dock_pallet_1: {
    type: 'from-bb-template',
    name: tr('Sliding Door #1'),
    templateId: 'slidingDoor',
    visible: true,
    editable: true,
    origin: DOOR1_ORIGIN,
    startingOrigin: DOOR1_ORIGIN
  },
  dock_pallet_2: {
    type: 'from-bb-template',
    name: tr('Sliding Door #2'),
    templateId: 'slidingDoor',
    visible: true,
    editable: true,
    origin: DOOR2_ORIGIN,
    startingOrigin: DOOR2_ORIGIN
  }
};
// This rotation prevents clipping into the pipe
const POM_ORIENTATION: RotationwUnits = RotationwUnits.eulerDegrees(0, 90, 0);
const LO_BLUE_X = 65;
const LO_Y = -3;
const LO_Z_EDGE = -17.4;
const POM_Z_GAP = 6 * 2.54;
const LO_Z_1 = LO_Z_EDGE + POM_Z_GAP;

const loBluePoms: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(LO_BLUE_X, LO_Y, LO_Z_1 + POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  loBluePoms[`loBlue${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Low Blue Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pomBlue2In',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}
const LO_ORANGE_X = 32;
const loOrangePoms: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(LO_ORANGE_X, LO_Y, LO_Z_1 + POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  loOrangePoms[`loOrange${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Low Orange Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pom_orange',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}

const HI_BLUE_X = 3.9;
const HI_Y = 12.5;
const HI_Z_EDGE = 204.5;
const HI_Z_1 = HI_Z_EDGE - POM_Z_GAP;
const hiBluePoms: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(HI_BLUE_X, HI_Y, HI_Z_1 - POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  hiBluePoms[`hiBlue${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('High Blue Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pomBlue2In',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}
const HI_ORANGE_X = HI_BLUE_X - 2 * 2.54;
const hiOrangePoms: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(HI_ORANGE_X, HI_Y, HI_Z_1 - POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  hiOrangePoms[`hiOrange${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('High Orange Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pom_orange',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}

const BASKET_ORIENTATION = RotationwUnits.eulerDegrees(0, 90, 0);
const BASKET_X = 2;
const BASKET_Y = -5;
const BASKET_Z = 208;
const BASKET_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(BASKET_X, BASKET_Y, BASKET_Z),
    orientation: BASKET_ORIENTATION
  },
  {
    position: Vector3wUnits.centimeters(BASKET_X, BASKET_Y, BASKET_Z - 33.7),
    orientation: BASKET_ORIENTATION
  }
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

const PIPE_2IN_CUBE_X = 91;
const PIPE_2IN_CUBE_Y = -2.8;
const PIPE_2IN_CUBE_GAP = 8.534 + 2 * 2.54;
const RED_Z_1 = 56.2;
const GREEN_Z_1 = 130.1;
const LOW_2IN_CUBE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(PIPE_2IN_CUBE_X, PIPE_2IN_CUBE_Y, RED_Z_1) },
  { position: Vector3wUnits.centimeters(PIPE_2IN_CUBE_X, PIPE_2IN_CUBE_Y, RED_Z_1 + PIPE_2IN_CUBE_GAP) },
  { position: Vector3wUnits.centimeters(PIPE_2IN_CUBE_X, PIPE_2IN_CUBE_Y, GREEN_Z_1) },
  { position: Vector3wUnits.centimeters(PIPE_2IN_CUBE_X, PIPE_2IN_CUBE_Y, GREEN_Z_1 + PIPE_2IN_CUBE_GAP) }
];
const LOW_2IN_CUBES: Dict<Node> = {
  leftRed: {
    type: 'from-bb-template',
    name: tr('Left Red Cube (2 inch)'),
    templateId: 'cubeRed2In',
    visible: true,
    editable: true,
    startingOrigin: LOW_2IN_CUBE_ORIGINS[0],
    origin: LOW_2IN_CUBE_ORIGINS[0]
  },
  rightRed: {
    type: 'from-bb-template',
    name: tr('Right Red Cube (2 inch)'),
    templateId: 'cubeRed2In',
    visible: true,
    editable: true,
    startingOrigin: LOW_2IN_CUBE_ORIGINS[1],
    origin: LOW_2IN_CUBE_ORIGINS[1]
  },
  leftGreen: {
    type: 'from-bb-template',
    name: tr('Left Green Cube (2 inch)'),
    templateId: 'cubeGreen2In',
    visible: true,
    editable: true,
    startingOrigin: LOW_2IN_CUBE_ORIGINS[2],
    origin: LOW_2IN_CUBE_ORIGINS[2]
  },
  rightGreen: {
    type: 'from-bb-template',
    name: tr('Right Green Cube (2 inch)'),
    templateId: 'cubeGreen2In',
    visible: true,
    editable: true,
    startingOrigin: LOW_2IN_CUBE_ORIGINS[3],
    origin: LOW_2IN_CUBE_ORIGINS[3]
  },
};

const LM_PALLET_X = 24.5375;
const LOW_PALLET_Y = -5;
const LOW_PALLET_Z = 47.9;
const PALLET_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(LM_PALLET_X, LOW_PALLET_Y, LOW_PALLET_Z) },
  { position: Vector3wUnits.centimeters(LM_PALLET_X, LOW_PALLET_Y + 1.804, LOW_PALLET_Z) },
  { position: Vector3wUnits.centimeters(LM_PALLET_X + 0.225, 0, 61.8) },
  { position: Vector3wUnits.centimeters(22.25, 10, 106.9) }
];

const pallets: Dict<Node> = {};
for (const [i, origin] of PALLET_ORIGINS.entries()) {
  pallets[`pallet${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Pallet #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pallet',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}

export const SPRING_26_SANDBOX: Scene = {
  ...baseScene,
  name: tr('2026 Spring Game Table'),
  description: tr('2026 Spring Botball game table sandbox'),
  geometry: {
    ...baseScene.geometry,
  },
  scripts: {},
  nodes: {
    ...baseScene.nodes,
    ...DOORS,
    ...loBluePoms,
    ...loOrangePoms,
    ...hiBluePoms,
    ...hiOrangePoms,
    ...BASKETS,
    ...LOW_2IN_CUBES,
    ...pallets
  }
};
