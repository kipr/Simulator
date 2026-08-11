import Scene from '../../../state/State/Scene';
import Node from '../../../state/State/Scene/Node';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import Dict from '../../../util/objectOps/Dict';
import { createBaseSceneSurface } from './26botballExplorerBase';
import Script from '../../../state/State/Scene/Script';
import { sprintf } from 'sprintf-js';

import tr from '@i18n';
import { setNodeVisible } from './jbcCommonComponents';

const baseScene = createBaseSceneSurface();

// const MIDLINE_X = 106;
// const MIDLINE_Z = (BROWN_CUBE_LEFT_Z + BROWN_CUBE_RIGHT_Z - 2) / 2;
// const BOTGUY_ORIGIN: ReferenceFramewUnits = {
//   position: Vector3wUnits.centimeters(MIDLINE_X, 4, MIDLINE_Z),
//   orientation: RotationwUnits.eulerDegrees(0, 90, 0)
// };
// const BOTGUY: Node = {
//   type: 'from-bb-template',
//   name: tr('Botguy'),
//   templateId: 'botguy_gamepiece',
//   visible: true,
//   editable: true,
//   startingOrigin: BOTGUY_ORIGIN,
//   origin: BOTGUY_ORIGIN
// };



const LOW_2INCH_RED_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(42.9, -30, 17),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
const HIGH_2INCH_RED_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(42.9, -10, 17),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
const LOW_2INCH_RED_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Low Red Cube'),
  templateId: 'cubeRed2In',
  visible: true,
  editable: true,
  startingOrigin: LOW_2INCH_RED_CUBE_ORIGIN,
  origin: LOW_2INCH_RED_CUBE_ORIGIN
};
const HIGH_2INCH_RED_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('High Red Cube'),
  templateId: 'cubeRed2In',
  visible: true,
  editable: true,
  startingOrigin: HIGH_2INCH_RED_CUBE_ORIGIN,
  origin: HIGH_2INCH_RED_CUBE_ORIGIN
};
const POM_ORIENTATION: RotationwUnits = RotationwUnits.eulerDegrees(0, 90, 0);
const LO_Y = -3;
const POM_Z_GAP = 6 * 2.61;
const LO_Z_1 = 17.5 + POM_Z_GAP;

const LO_ORANGE_POMS: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(9.5, LO_Y, LO_Z_1 + POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  LO_ORANGE_POMS[`loOrange${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Low Orange Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pom_orange',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}
const LO_BLUE_POMS: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(42.9, LO_Y, LO_Z_1 + POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  LO_BLUE_POMS[`loBlue${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Low Blue Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pomBlue2In',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}
export const BOTBALL_EXPLORER_26_SANDBOX: Scene = {
  ...baseScene,
  name: tr('2026 Botball Explorer Sandbox'),
  description: tr('A sandbox scene for 2026 Botball Explorer.'),
  geometry: { ...baseScene.geometry },
  scripts: {},
  nodes: {
    ...baseScene.nodes,
    low2InchRedCube: LOW_2INCH_RED_CUBE,
    high2InchRedCube: HIGH_2INCH_RED_CUBE,
    ...LO_ORANGE_POMS,
    ...LO_BLUE_POMS,
  },
};