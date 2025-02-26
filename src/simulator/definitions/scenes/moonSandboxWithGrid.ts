// In scenes we build upon the base, and add objects to the scene.
// The objects are set up in the node-templates index.ts file.
// Here we add the objects and their properties to the scene.

import Dict from "../../../util/objectOps/Dict";
import Scene from "../../../state/State/Scene";
import Script from '../../../state/State/Scene/Script';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../../../util/math/unitMath";
import { Distance } from "../../../util";
import { Color } from '../../../state/State/Scene/Color';
import Node from "../../../state/State/Scene/Node";

import LocalizedString from '../../../util/LocalizedString';

import { createBaseSceneSurface } from './moonBase';

import tr from '@i18n';
import { distance } from "colorjs.io/fn";

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

/**
 * 
 * @param size The number of markers to place
 * @param interval The interval to space the markers
 * @returns 2D Array of nodes that contains the markers
 */
const makeMarkerGrid = (size: number, interval: number) => {
  const start = Math.ceil(size / -2) * interval;
  // const markerGrid: Node[][] = [...Array(size) as Node[]].map(e => Array(size) as Node[]);
  const markerGrid: Dict<Node> = {};

  for (let i = 0; i < size; i++) {
    const x = start + (interval * i);

    for (let j = 0; j < size; j++) {
      const z = start + (interval * j);

      markerGrid[`marker${x}${z}`] = {
        ...MARKER_TEMPLATE,
        // Babylonjs uses left handed coords, so multiply by -1 to make it look correct
        name: tr(`Marker (${x * -1}, ${z})`),
        startingOrigin: { position: Vector3wUnits.meters(x, 0, z) },
        origin: { position: Vector3wUnits.meters(x, 0, z) },
      };
    }
  }

  return markerGrid;
};

const markerGrid = makeMarkerGrid(12, 1);

const baseScene = createBaseSceneSurface();

export const Moon_Sandbox_With_Grid: Scene = {
  ...baseScene,
  name: tr('Moon Sandbox With Grid'),
  description: tr('Lunar sandbox. Includes a grid of positions for you to create your own lunar challenges!'),
  geometry: {
    ...baseScene.geometry,
    'marker': {
      type: 'cylinder',
      radius: Distance.centimeters(.5),
      height: Distance.centimeters(50),
    }
  },
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
    ...markerGrid,
  },
};