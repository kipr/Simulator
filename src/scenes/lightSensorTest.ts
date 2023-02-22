import Scene from "../state/State/Scene";
import Node from '../state/State/Scene/Node';
import Script from '../state/State/Scene/Script';
import { ReferenceFrame, Rotation, Vector3 } from "../unit-math";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

const LIGHT0_ORIGIN: ReferenceFrame = {
  position: Vector3.meters(1, 0.5, -1),
};

const LIGHT1_ORIGIN: ReferenceFrame = {
  position: Vector3.meters(-1, 0.5, -1),
};

const script = `
scene.onBind = nodeId => {
  let lastUpdate = Date.now() + Math.random() * 1000;
  scene.addOnRenderListener(() => {
    const now = Date.now();
    if (now - lastUpdate < 1000) return;
    lastUpdate = now;

    const node = scene.nodes[nodeId];
    scene.setNode(nodeId, {
      ...node,
      visible: !node.visible
    });
  });
};
`;

export const lightSensorTest: Scene = {
  ...baseScene,
  name: {
    [LocalizedString.EN_US]: 'Light Sensor Test'
  },
  description: {
    [LocalizedString.EN_US]: 'Light Sensor Test'
  },
  nodes: {
    ground: {
      ...baseScene.nodes['ground']
    },
    robot: {
      ...baseScene.nodes['robot'],
      editable: true,
    },
    light0: {
      type: 'point-light',
      intensity: 0.5,
      name: {
        [LocalizedString.EN_US]: 'Light 0'
      },
      startingOrigin: LIGHT0_ORIGIN,
      origin: LIGHT0_ORIGIN,
      visible: true,
      scriptIds: ['script']
    },
    light1: {
      type: 'point-light',
      intensity: 0.5,
      name: {
        [LocalizedString.EN_US]: 'Light 1'
      },
      startingOrigin: LIGHT1_ORIGIN,
      origin: LIGHT1_ORIGIN,
      visible: true,
      scriptIds: ['script']
    },
  },
  scripts: {
    script: Script.ecmaScript('Script', script)
  }
};