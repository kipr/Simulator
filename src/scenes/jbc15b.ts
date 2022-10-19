import Scene from "../state/State/Scene";
import { Rotation } from "../unit-math";
import { Distance, Mass } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_15B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 15B' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 15B: Bump Bump` },
  nodes: {
    ...baseScene.nodes,
    // The normal starting position of the robot doesn't leave room for the paper ream in the starting box
    // Start the robot forward a bit so that a ream fits behind it
    'robot': {
      ...baseScene.nodes['robot'],
      origin: {
        ...baseScene.nodes['robot'].origin,
        position: {
          ...baseScene.nodes['robot'].origin.position,
          z: Distance.centimeters(7)
        },
      }
    },
    'ream1': {
      type: 'from-template',
      templateId: 'ream',
      name: { [LocalizedString.EN_US]: 'Paper Ream 1' },
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(5),
          z: Distance.centimeters(48),
        },
        orientation: Rotation.AxisAngle.fromRaw({
          axis: { x: 1, y: 0, z: 0 },
          angle: -Math.PI / 2,
        }),
      },
      visible: true,
    },
    'ream2': {
      type: 'from-template',
      templateId: 'ream',
      name: { [LocalizedString.EN_US]: 'Paper Ream 2' },
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(5),
          z: Distance.centimeters(-6.3),
        },
        orientation: Rotation.AxisAngle.fromRaw({
          axis: { x: 1, y: 0, z: 0 },
          angle: -Math.PI / 2,
        }),
      },
      visible: true,
    },
  },
};