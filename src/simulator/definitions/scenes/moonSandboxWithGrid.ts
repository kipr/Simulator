// In scenes we build upon the base, and add objects to the scene.
// The objects are set up in the node-templates index.ts file.
// Here we add the objects and their properties to the scene.

import Scene from "../../../state/State/Scene";
import Script from '../../../state/State/Scene/Script';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../../../util/math/unitMath";
import { Distance } from "../../../util";
import { Color } from '../../../state/State/Scene/Color';
import Node from "../../../state/State/Scene/Node";

import LocalizedString from '../../../util/LocalizedString';

import { createBaseSceneSurface } from './moonBase';

import tr from '@i18n';

const MARKER_TEMPLATE: Node = {
  type: 'object',
  geometryId: 'marker',
  name: tr('Marker template'),
  startingOrigin: { position: Vector3wUnits.meters(0, 0, 0) },
  origin: { position: Vector3wUnits.meters(0, 0, 0) },
  visible: true,
  material: {
    type: 'pbr',
    emissive: {
      type: 'color3',
      color: Color.rgb(255, 0, 0),
    },
  },
};

const baseScene = createBaseSceneSurface();

export const Moon_Sandbox_With_Grid: Scene = {
  ...baseScene,
  name: tr('Moon Sandbox With Grid'),
  description: tr('Lunar sandbox. Includes a grid of positions for you to create your own lunar challenges!'),
  geometry: {
    ...baseScene.geometry,
    'indicator': {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    'marker': {
      type: 'box',
      size: {
        x: Distance.centimeters(1),
        y: Distance.meters(1),
        z: Distance.centimeters(1),
      }
    }
  },
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
    // Temporary markers for scaling
    'marker_template': MARKER_TEMPLATE,
    'marker_01': {
      ...MARKER_TEMPLATE,
      name: tr('Marker 0,1'),
      startingOrigin: { position: Vector3wUnits.meters(0, 0, 1) },
      origin: { position: Vector3wUnits.meters(0, 0, 1) }
    },
    'marker_11': {
      ...MARKER_TEMPLATE,
      name: tr('Marker 0,1'),
      startingOrigin: { position: Vector3wUnits.meters(1, 0, 1) },
      origin: { position: Vector3wUnits.meters(1, 0, 1) }
    },
  },
};