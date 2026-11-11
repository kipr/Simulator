import Scene from '../../../state/State/Scene';
import Node from '../../../state/State/Scene/Node';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import Dict from '../../../util/objectOps/Dict';
import { createBaseSceneSurface } from './26botballExplorerBase';
import { sprintf } from 'sprintf-js';

import tr from '@i18n';
import Geometry from '../../../state/State/Scene/Geometry';
import { Distance } from '../../../util/math/Value';

const baseScene = createBaseSceneSurface();

const MAT_CENTER = Vector3wUnits.centimeters(-110.18, -7.59, 39.111);

const LOW_2INCH_RED_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.add(Vector3wUnits.centimeters(83.3, -7, 22.77), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
};
const HIGH_2INCH_RED_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.add(Vector3wUnits.centimeters(83.3, -1, 22.77), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
const POM_ORIENTATION: RotationwUnits = RotationwUnits.eulerDegrees(0, 0, 0);
const LO_X_1 = -43;
const LO_Y = -15;
export const POM_Z_GAP = 6 * 2.61;
export const POM_X_GAP = 6 * 2.61;
export const LO_Z_1 = 29.4;


export const LO_ORANGE_POMS: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(LO_X_1 - POM_X_GAP * i, LO_Y, LO_Z_1),
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
    position: Vector3wUnits.centimeters(LO_X_1 - POM_X_GAP * i, LO_Y, 61.8),

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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(99, -10, -4.5), MAT_CENTER),

  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(99, -1, -4.5), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.centimeters(-42.6, -17, 13),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
};

const LOW_GREEN_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-42.6, -17, -3.4),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.centimeters(-58.4, -17, 13),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
};

const LOW_YELLOW_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-58.4, -17, -3.4),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(33.5, -10, -34.2), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-19, -3, -47.9), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-29.5, -10, -26.1), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
};

const MIDDLE_GREEN_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-27, -10, -31.5), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
};

const MIDDLE_YELLOW_2IN_CUBE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-29.5, -10, -36.9), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-50.5, -10, 6.3), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-50.5, -3, 6.3), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-82.8, -10, -39.7), MAT_CENTER),
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-115, -10, -39.7), MAT_CENTER),
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-32, -13, 22.77), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-69, -13, 22.77), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-5.4, -2, 60.45), MAT_CENTER),
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-95, -10, 38.9), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-100, -3, 38.9), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(45, -90, 0)
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
  position: Vector3wUnits.add(Vector3wUnits.centimeters(-105.5, -10, 38.9), MAT_CENTER),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0)
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

export const GAME_PIECE_OFFSET = Vector3wUnits.centimeters(4.5, 15, -5);

export const offsetOrigin = (origin: ReferenceFramewUnits): ReferenceFramewUnits => {
  if (!origin) return origin;
  return {
    ...origin,
    position: Vector3wUnits.add(
      origin.position ?? Vector3wUnits.zero('centimeters'),
      GAME_PIECE_OFFSET,
    ),
  };
};

const matCenter_geom: Geometry = {
  type: 'box',
  size: {
    x: Distance.centimeters(1),
    y: Distance.centimeters(1),
    z: Distance.centimeters(1)
  }
};

const matCenter: Node = {
  type: 'object',
  name: tr('Mat Center'),
  geometryId: 'matCenter_geom',
  visible: true,
  editable: true,
  startingOrigin: {
    position: MAT_CENTER,
    orientation: RotationwUnits.eulerDegrees(0, -90, 0)
  },
  origin: {
    position: MAT_CENTER,
    orientation: RotationwUnits.eulerDegrees(0, -90, 0)
  }
};
export const offsetGamePiece = (node: Node): Node => ({
  ...node,
  startingOrigin: offsetOrigin(node.startingOrigin),
  origin: offsetOrigin(node.origin),
} as Node);

export const BOTBALL_EXPLORER_26_SANDBOX: Scene = {
  ...baseScene,
  name: tr('2026 Botball Explorer Sandbox'),
  description: tr('A sandbox scene for 2026 Botball Explorer.'),
  geometry: { ...baseScene.geometry },
  scripts: {},
  nodes: {
    ...baseScene.nodes,
    ...Dict.map({
      LOW_2INCH_RED_CUBE,
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
      rightStackRed2InCube: RIGHT_STACK_RED_2IN_CUBE,
    }, offsetGamePiece),
  },
};
