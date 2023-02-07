import Scene from "../state/State/Scene";
import { ReferenceFrame } from '../unit-math';
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const ROBOT_ORIGIN: ReferenceFrame = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    z: Distance.centimeters(-8)
  },
};

export const JBC_7B: Scene = {
  ...baseScene,
  name: tr('JBC 7B'),
  description: tr('Junior Botball Challenge 7B: Cover Your Bases'),
  nodes: {
    ...baseScene.nodes,
    // The normal starting position of the robot covers the tape
    // Start the robot back a bit so that a can fits on the tape in front of the robot
    'robot': {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN
    },
    'can1': createCanNode(1, { x: Distance.centimeters(24), y: Distance.centimeters(0), z: Distance.centimeters(15.5) }),
    'can2': createCanNode(2, { x: Distance.centimeters(16), y: Distance.centimeters(0), z: Distance.centimeters(15.5) }),
    'can3': createCanNode(3, { x: Distance.centimeters(8), y: Distance.centimeters(0), z: Distance.centimeters(15.5) }),
    'can4': createCanNode(4, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(15.5) }),
    'can5': createCanNode(5, { x: Distance.centimeters(-8), y: Distance.centimeters(0), z: Distance.centimeters(15.5) }),
    'can6': createCanNode(7, { x: Distance.centimeters(-16), y: Distance.centimeters(0), z: Distance.centimeters(15.5) }),
    'can7': createCanNode(6, { x: Distance.centimeters(-24), y: Distance.centimeters(0), z: Distance.centimeters(15.5) }),
  },
};