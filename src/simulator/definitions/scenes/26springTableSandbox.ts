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

const LO_1_Z = -3.25;
const LO_BLUE_X = 65;
const LO_Y = -1;

const LO_Z_GAP = 6 * 2.54;

const loBluePoms: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(LO_BLUE_X, LO_Y, LO_1_Z + LO_Z_GAP * i),
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
    position: Vector3wUnits.centimeters(LO_ORANGE_X, LO_Y, LO_1_Z + LO_Z_GAP * i),
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
    ...loOrangePoms
  }
};
