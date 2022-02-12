import Scene from "../state/State/Scene";
import { Rotation } from "../unit-math";
import { Distance, Mass } from "../util";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_19: Scene = {
  ...baseScene,
  name: 'JBC 19',
  description: `Junior Botball Challenge 19: Mountain Rescue`,
  geometry: {
    ...baseScene.geometry,
    'ream': {
      type: 'box',
      size: {
        x: Distance.centimeters(27.94),
        y: Distance.centimeters(5.08),
        z: Distance.centimeters(21.59),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(3), y: Distance.centimeters(115), z: Distance.centimeters(34.6) }),
    'can2': createCanNode(2, { x: Distance.centimeters(10), y: Distance.centimeters(115), z: Distance.centimeters(41.6) }),
    'can3': createCanNode(3, { x: Distance.centimeters(17), y: Distance.centimeters(115), z: Distance.centimeters(48.6) }),
    'ream': {
      type: 'object',
      geometryId: 'ream',
      name: 'Paper Ream',
      origin: {
        position: {
          x: Distance.centimeters(10),
          y: Distance.centimeters(106),
          z: Distance.centimeters(41.6),
        },
        orientation: Rotation.AngleAxis.fromRaw({
          axis: { x: 0, y: 1, z: 0 },
          angle: -Math.PI / 4,
        }),
      },
      visible: true,
      physics: {
        type: 'box',
        restitution: 0,
        friction: 1,
        mass: Mass.pounds(5),
      },
    },
  }
};