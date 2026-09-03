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


const LOW_2INCH_RED_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(88.2, -13.2, 51.5),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
const HIGH_2INCH_RED_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(88.2, -5, 51.5),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const LOW_2INCH_RED_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Low Red Cube'),
  templateId: 'cubeRed2In',
  visible: true,
  editable: true,
  startingOrigin: LOW_2INCH_RED_CUBE_ORIGIN,
  origin: LOW_2INCH_RED_CUBE_ORIGIN
};
export const HIGH_2INCH_RED_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('High Red Cube'),
  templateId: 'cubeRed2In',
  visible: true,
  editable: true,
  startingOrigin: HIGH_2INCH_RED_CUBE_ORIGIN,
  origin: HIGH_2INCH_RED_CUBE_ORIGIN
};
const POM_ORIENTATION: RotationwUnits = RotationwUnits.eulerDegrees(0, 90, 0);
const LO_Y = -12;
export const POM_Z_GAP = 6 * 2.61;
export const POM_X_GAP = 6 * 2.61;
export const LO_Z_1 = 35.82 + POM_Z_GAP;
export const LO_X_1 = 72.4;

export const LO_ORANGE_POMS: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(LO_X_1 - POM_X_GAP * i, LO_Y, 18.9),
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
export const LO_BLUE_POMS: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(LO_X_1 - POM_X_GAP * i, LO_Y, 51.52),
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

const RED_4INCH_CUBE_PALLET_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(104, -10.7, 24.5),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const RED_4INCH_CUBE_PALLET: Node = {
  type: 'from-bb-template',
  name: tr('Red Cube Pallet'),
  templateId: 'pallet',
  visible: true,
  editable: true,
  startingOrigin: RED_4INCH_CUBE_PALLET_ORIGIN,
  origin: RED_4INCH_CUBE_PALLET_ORIGIN
};

const RED_4INCH_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(104, 0, 24.5),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const RED_4INCH_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Red Cube'),
  templateId: 'cubeRed4In',
  visible: true,
  editable: true,
  startingOrigin: RED_4INCH_CUBE_ORIGIN,
  origin: RED_4INCH_CUBE_ORIGIN
};

const TOP_GREEN_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(LO_X_1 + 0.15, -12, 2.72),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

const LOW_GREEN_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(LO_X_1 + 0.15, -12, -13.48),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

export const LOW_GREEN_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Low Green Cube'),
  templateId: 'cubeGreen2In',
  visible: true,
  editable: true,
  startingOrigin: LOW_GREEN_2IN_CUBE_ORIGIN,
  origin: LOW_GREEN_2IN_CUBE_ORIGIN
};
export const TOP_GREEN_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Top Green Cube'),
  templateId: 'cubeGreen2In',
  visible: true,
  editable: true,
  startingOrigin: TOP_GREEN_2IN_CUBE_ORIGIN,
  origin: TOP_GREEN_2IN_CUBE_ORIGIN
};

const TOP_YELLOW_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(LO_X_1 - POM_X_GAP, -12, 2.72),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

const LOW_YELLOW_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(LO_X_1 - POM_X_GAP, -12, -13.48),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

export const LOW_YELLOW_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Low Yellow Cube'),
  templateId: 'cubeYellow2In',
  visible: true,
  editable: true,
  startingOrigin: LOW_YELLOW_2IN_CUBE_ORIGIN,
  origin: LOW_YELLOW_2IN_CUBE_ORIGIN
};
export const TOP_YELLOW_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Top Yellow Cube'),
  templateId: 'cubeYellow2In',
  visible: true,
  editable: true,
  startingOrigin: TOP_YELLOW_2IN_CUBE_ORIGIN,
  origin: TOP_YELLOW_2IN_CUBE_ORIGIN
};

const MIDDLE_PALLET_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(38.51, -15, -5.4),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const MIDDLE_PALLET: Node = {
  type: 'from-bb-template',
  name: tr('Middle Pallet'),
  templateId: 'pallet',
  visible: true,
  editable: true,
  startingOrigin: MIDDLE_PALLET_ORIGIN,
  origin: MIDDLE_PALLET_ORIGIN
};

const BROWN_4IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-14, -12, -19),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const BROWN_4IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Brown Cube'),
  templateId: 'cubeBrown4In',
  visible: true,
  editable: true,
  startingOrigin: BROWN_4IN_CUBE_ORIGIN,
  origin: BROWN_4IN_CUBE_ORIGIN
};

const MIDDLE_RED_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-24.5, -12, 2.75),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

const MIDDLE_GREEN_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-21.85, -12, -2.55),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

const MIDDLE_YELLOW_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-24.6, -12, -7.9),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};



export const MIDDLE_RED_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Middle Red Cube'),
  templateId: 'cubeRed2In',
  visible: true,
  editable: true,
  startingOrigin: MIDDLE_RED_2IN_CUBE_ORIGIN,
  origin: MIDDLE_RED_2IN_CUBE_ORIGIN
};

export const MIDDLE_GREEN_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Middle Green Cube'),
  templateId: 'cubeGreen2In',
  visible: true,
  editable: true,
  startingOrigin: MIDDLE_GREEN_2IN_CUBE_ORIGIN,
  origin: MIDDLE_GREEN_2IN_CUBE_ORIGIN
};

export const MIDDLE_YELLOW_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Middle Yellow Cube'),
  templateId: 'cubeYellow2In',
  visible: true,
  editable: true,
  startingOrigin: MIDDLE_YELLOW_2IN_CUBE_ORIGIN,
  origin: MIDDLE_YELLOW_2IN_CUBE_ORIGIN
};

const MIDDLE_GREEN_4IN_PALLET_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-45.47, -15, 35.35),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const MIDDLE_GREEN_4IN_PALLET: Node = {
  type: 'from-bb-template',
  name: tr('Middle Green Pallet'),
  templateId: 'pallet',
  visible: true,
  editable: true,
  startingOrigin: MIDDLE_GREEN_4IN_PALLET_ORIGIN,
  origin: MIDDLE_GREEN_4IN_PALLET_ORIGIN
};

const MIDDLE_GREEN_4IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-45.47, -5, 35.35),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const MIDDLE_GREEN_4IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('4in Green Cube'),
  templateId: 'cubeGreen4In',
  visible: true,
  editable: true,
  startingOrigin: MIDDLE_GREEN_4IN_CUBE_ORIGIN,
  origin: MIDDLE_GREEN_4IN_CUBE_ORIGIN
};

const LEFT_BASKET_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-77.4, -12, -10.75),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const LEFT_BASKET: Node = {
  type: 'from-bb-template',
  name: tr('Left Basket'),
  templateId: 'basket',
  visible: true,
  editable: true,
  startingOrigin: LEFT_BASKET_ORIGIN,
  origin: LEFT_BASKET_ORIGIN
};

const RIGHT_BASKET_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-110.37, -12, -10.72),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const RIGHT_BASKET: Node = {
  type: 'from-bb-template',
  name: tr('Right Basket'),
  templateId: 'basket',
  visible: true,
  editable: true,
  startingOrigin: RIGHT_BASKET_ORIGIN,
  origin: RIGHT_BASKET_ORIGIN
};

const LEFT_CONE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-27.05, -12, 51.53),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const LEFT_CONE: Node = {
  type: 'from-bb-template',
  name: tr('Left Cone'),
  templateId: 'trafficCone',
  visible: true,
  editable: true,
  startingOrigin: LEFT_CONE_ORIGIN,
  origin: LEFT_CONE_ORIGIN
};

const RIGHT_CONE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-63.9, -12, 51.53),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const RIGHT_CONE: Node = {
  type: 'from-bb-template',
  name: tr('Right Cone'),
  templateId: 'trafficCone',
  visible: true,
  editable: true,
  startingOrigin: RIGHT_CONE_ORIGIN,
  origin: RIGHT_CONE_ORIGIN
};

const BOTGUY_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-0.54, -2.5, 89.43),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const BOTGUY: Node = {
  type: 'from-bb-template',
  name: tr('Botguy'),
  templateId: 'botguy_gamepiece',
  visible: true,
  editable: true,
  startingOrigin: BOTGUY_ORIGIN,
  origin: BOTGUY_ORIGIN
};

const RIGHT_STACK_YELLOW_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-90.16, -12, 67.71),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const RIGHT_STACK_YELLOW_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Right Stack Yellow Cube'),
  templateId: 'cubeYellow2In',
  visible: true,
  editable: true,
  startingOrigin: RIGHT_STACK_YELLOW_2IN_CUBE_ORIGIN,
  origin: RIGHT_STACK_YELLOW_2IN_CUBE_ORIGIN
};

const RIGHT_STACK_GREEN_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-95.39, -8, 67.71),
  orientation: RotationwUnits.eulerDegrees(0, 0, 45)
};
export const RIGHT_STACK_GREEN_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Right Stack Green Cube'),
  templateId: 'cubeGreen2In',
  visible: true,
  editable: true,
  startingOrigin: RIGHT_STACK_GREEN_2IN_CUBE_ORIGIN,
  origin: RIGHT_STACK_GREEN_2IN_CUBE_ORIGIN
};

const RIGHT_STACK_RED_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-100.47, -12, 67.71),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};
export const RIGHT_STACK_RED_2IN_CUBE: Node = {
  type: 'from-bb-template',
  name: tr('Right Stack Red Cube'),
  templateId: 'cubeRed2In',
  visible: true,
  editable: true,
  startingOrigin: RIGHT_STACK_RED_2IN_CUBE_ORIGIN,
  origin: RIGHT_STACK_RED_2IN_CUBE_ORIGIN
};

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
    red4InchCubePallet: RED_4INCH_CUBE_PALLET,
    red4InchCube: RED_4INCH_CUBE,
    topGreen2InCube: TOP_GREEN_2IN_CUBE,
    lowGreen2InCube: LOW_GREEN_2IN_CUBE,
    topYellow2InCube: TOP_YELLOW_2IN_CUBE,
    lowYellow2InCube: LOW_YELLOW_2IN_CUBE,
    middlePallet: MIDDLE_PALLET,
    brown4InCube: BROWN_4IN_CUBE,
    middleRed2InCube: MIDDLE_RED_2IN_CUBE,
    middleGreen2InCube: MIDDLE_GREEN_2IN_CUBE,
    middleYellow2InCube: MIDDLE_YELLOW_2IN_CUBE,
    middleGreen4InPallet: MIDDLE_GREEN_4IN_PALLET,
    middleGreen4InCube: MIDDLE_GREEN_4IN_CUBE,
    leftBasket: LEFT_BASKET,
    rightBasket: RIGHT_BASKET,
    leftCone: LEFT_CONE,
    rightCone: RIGHT_CONE,
    botguy: BOTGUY,
    rightStackYellow2InCube: RIGHT_STACK_YELLOW_2IN_CUBE,
    rightStackGreen2InCube: RIGHT_STACK_GREEN_2IN_CUBE,
    rightStackRed2InCube: RIGHT_STACK_RED_2IN_CUBE

  },
};