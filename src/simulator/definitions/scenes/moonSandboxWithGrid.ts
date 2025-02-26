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

/**
 * 
 * @param size The number of markers to place
 * @param interval The interval to space the markers
 * @returns 2D Array of nodes that contains the markers
 */
const makeMarkerGrid = (size: number, interval: number) => {
  const start = Math.floor(size / -2) * interval;
  const markerGrid: Node[][] = [...Array(size) as Node[]].map(e => Array(size) as Node[]);

  for (let i = 0; i < markerGrid.length; i++) {
    const x = start + (interval * i);

    for (let j = 0; j < markerGrid[i].length; j++) {
      const z = start + (interval * j);

      markerGrid[i][j] = {
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

const markerGrid = makeMarkerGrid(5, 2);

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
    'marker00': markerGrid[0][0],
    'marker01': markerGrid[0][1],
    'marker02': markerGrid[0][2],
    'marker03': markerGrid[0][3],
    'marker04': markerGrid[0][4],

    'marker10': markerGrid[1][0],
    'marker11': markerGrid[1][1],
    'marker12': markerGrid[1][2],
    'marker13': markerGrid[1][3],
    'marker14': markerGrid[1][4],

    'marker20': markerGrid[2][0],
    'marker21': markerGrid[2][1],
    'marker22': markerGrid[2][2],
    'marker23': markerGrid[2][3],
    'marker24': markerGrid[2][4],

    'marker30': markerGrid[3][0],
    'marker31': markerGrid[3][1],
    'marker32': markerGrid[3][2],
    'marker33': markerGrid[3][3],
    'marker34': markerGrid[3][4],

    'marker40': markerGrid[4][0],
    'marker41': markerGrid[4][1],
    'marker42': markerGrid[4][2],
    'marker43': markerGrid[4][3],
    'marker44': markerGrid[4][4],
  },
};