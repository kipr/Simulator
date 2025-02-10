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

const HAMBURGER_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(9, 22, 114),
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
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
  }
};