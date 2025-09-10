// In scenes we build upon the base, and add objects to the scene.
// The objects are set up in the node-templates index.ts file.
// Here we add the objects and their properties to the scene.

import Scene from '../../../state/State/Scene';
import Node from '../../../state/State/Scene/Node';
import Script from '../../../state/State/Scene/Script';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Dict from '../../../util/objectOps/Dict';

import { createBaseSceneSurface } from './26fallTableBase';

import { sprintf } from 'sprintf-js';

import tr from '@i18n';

const baseScene = createBaseSceneSurface();

export const FALL_26_SANDBOX: Scene = {
  ...baseScene,
  name: tr('2026 Fall Game Table'),
  description: tr('2026 Fall Botball game table sandbox'),
  geometry: {
    ...baseScene.geometry,
  },
  scripts: {},
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
  }
};
