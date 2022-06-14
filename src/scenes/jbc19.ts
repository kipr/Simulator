import Scene from "../state/State/Scene";
import { Rotation } from "../unit-math";
import { Distance, Mass } from "../util";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_19: Scene = {
  ...baseScene,
  name: 'JBC 19',
  description: `Junior Botball Challenge 19: Mountain Rescue`,
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(3), y: Distance.centimeters(6), z: Distance.centimeters(84.6) }),
    'can2': createCanNode(2, { x: Distance.centimeters(10), y: Distance.centimeters(6), z: Distance.centimeters(91.6) }),
    'can3': createCanNode(3, { x: Distance.centimeters(17), y: Distance.centimeters(6), z: Distance.centimeters(98.6) }),
    'ream': {
      type: 'from-template',
      templateId: 'ream',
      name: 'Paper Ream',
      origin: {
        position: {
          x: Distance.centimeters(10),
          y: Distance.centimeters(-3),
          z: Distance.centimeters(91.6),
        },
        orientation: Rotation.AngleAxis.fromRaw({
          axis: { x: 0, y: 1, z: 0 },
          angle: -Math.PI / 4,
        }),
      },
      visible: true,
    },
  }
};