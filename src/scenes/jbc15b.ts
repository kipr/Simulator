import Scene from "../state/State/Scene";
import { ReferenceFrame, Rotation } from "../unit-math";
import { Distance, Mass } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const ROBOT_ORIGIN: ReferenceFrame = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    z: Distance.centimeters(7)
  },
};

const REAM1_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(5),
    z: Distance.centimeters(48),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 1, y: 0, z: 0 },
    angle: -Math.PI / 2,
  }),
};

const REAM2_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(5),
    z: Distance.centimeters(-6.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 1, y: 0, z: 0 },
    angle: -Math.PI / 2,
  }),
};

export const JBC_15B: Scene = {
  ...baseScene,
  name: tr('JBC 15B'),
  description: tr('Junior Botball Challenge 15B: Bump Bump'),
  nodes: {
    ...baseScene.nodes,
    // The normal starting position of the robot doesn't leave room for the paper ream in the starting box
    // Start the robot forward a bit so that a ream fits behind it
    'robot': {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN,
    },
    'ream1': {
      type: 'from-template',
      templateId: 'ream',
      name: tr('Paper Ream 1'),
      startingOrigin: REAM1_ORIGIN,
      origin: REAM1_ORIGIN,
      visible: true,
    },
    'ream2': {
      type: 'from-template',
      templateId: 'ream',
      name: tr('Paper Ream 2'),
      startingOrigin: REAM2_ORIGIN,
      origin: REAM2_ORIGIN,
      visible: true,
    },
  },
};