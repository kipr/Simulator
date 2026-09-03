import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
// import { createBaseSceneSurfaceB } from './jbcBase';
// import { setNodeVisible } from './jbcCommonComponents';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { getHighestFaceScript, getLowestFaceScript, createCubeEndNode, blackLineNodes, BLACK_LINE_GEOMETRY, smallCubeEnd_geom } from './bexCommonComponents';
import { MIDDLE_PALLET, TOP_GREEN_2IN_CUBE, LOW_GREEN_2IN_CUBE, TOP_YELLOW_2IN_CUBE, LOW_YELLOW_2IN_CUBE } from '../26botballExplorerSandbox';
import { RotationwUnits } from '../../../../util/math/unitMath';

const baseScene = createBaseSceneSurface();


const palletInStartBox = `
scene.addOnIntersectionListener('MIDDLE_PALLET', (type, otherNodeId) => {
  if(otherNodeId === 'startBoxA' || otherNodeId === 'startBoxB') {
   scene.setChallengeEventValue('bonus', type === 'start');
  }
  
}, ['startBoxA', 'startBoxB']);
`;


const cubesOnPallet = `
  const topGreenCubeFaces = [
    'tGreenTop', 'tGreenBottom', 'tGreenLeft',
    'tGreenRight', 'tGreenFront', 'tGreenBack'
  ];

  const lowGreenCubeFaces = [
    'lGreenTop', 'lGreenBottom', 'lGreenLeft',
    'lGreenRight', 'lGreenFront', 'lGreenBack'
  ];

  const topYellowCubeFaces = [
    'tYellowTop', 'tYellowBottom', 'tYellowLeft',
    'tYellowRight', 'tYellowFront', 'tYellowBack'
  ];

  const lowYellowCubeFaces = [
    'lYellowTop', 'lYellowBottom', 'lYellowLeft',
    'lYellowRight', 'lYellowFront', 'lYellowBack'
  ];

  const palletFaces = ['palletTop', 'palletBottom'];

  const allCubes = [
    {
      id: 'TOP_GREEN_2IN_CUBE',
      faces: topGreenCubeFaces
    },
    {
      id: 'LOW_GREEN_2IN_CUBE',
      faces: lowGreenCubeFaces
    },
    {
      id: 'TOP_YELLOW_2IN_CUBE',
      faces: topYellowCubeFaces
    },
    {
      id: 'LOW_YELLOW_2IN_CUBE',
      faces: lowYellowCubeFaces
    }
  ];

  // Cubes physically touching the pallet.
  const directPalletCubes = new Set();

  // Active cube/cube intersections.
  // "A:B" means A and B are currently intersecting.
  const cubeIntersections = new Set();


  function getCube(cubeId) {
    return allCubes.find(cube => cube.id === cubeId);
  }


  ${getLowestFaceScript}
  ${getHighestFaceScript}


  function isCubeOnTopOf(cubeId, otherCubeId) {
    const cube = getCube(cubeId);
    const otherCube = getCube(otherCubeId);

    if (!cube || !otherCube) {
      return false;
    }

    const lowestFace = getLowestFace(cube.faces);
    const highestFace = getHighestFace(otherCube.faces);

    if (!lowestFace || !highestFace) {
      return false;
    }

    const lowestPosition = scene.getNodeWorldCm(lowestFace);
    const highestPosition = scene.getNodeWorldCm(highestFace);

    if (!lowestPosition || !highestPosition) {
      return false;
    }

    return lowestPosition.y > highestPosition.y;
  }


  function intersectionKey(a, b) {
    return [a, b].sort().join(':');
  }


  function updateChallengeState() {
    /*
     * Start with cubes directly touching the pallet.
     *
     * Then repeatedly find cubes stacked on cubes that are
     * already known to be supported by the pallet.
     */
    const supportedCubes = new Set(directPalletCubes);

    let changed = true;

    while (changed) {
      changed = false;

      cubeIntersections.forEach(key => {
        const [cubeA, cubeB] = key.split(':');

        // A is on B, and B is supported.
        if (
          supportedCubes.has(cubeB) &&
          isCubeOnTopOf(cubeA, cubeB) &&
          !supportedCubes.has(cubeA)
        ) {
          supportedCubes.add(cubeA);
          changed = true;
        }

        // B is on A, and A is supported.
        if (
          supportedCubes.has(cubeA) &&
          isCubeOnTopOf(cubeB, cubeA) &&
          !supportedCubes.has(cubeB)
        ) {
          supportedCubes.add(cubeB);
          changed = true;
        }
      });
    }

    scene.setChallengeEventValue(
      'topGreenCubeOnPallet',
      supportedCubes.has('TOP_GREEN_2IN_CUBE')
    );

    scene.setChallengeEventValue(
      'topYellowCubeOnPallet',
      supportedCubes.has('TOP_YELLOW_2IN_CUBE')
    );

    scene.setChallengeEventValue(
      'bottomGreenCubeOnPallet',
      supportedCubes.has('LOW_GREEN_2IN_CUBE')
    );

    scene.setChallengeEventValue(
      'bottomYellowCubeOnPallet',
      supportedCubes.has('LOW_YELLOW_2IN_CUBE')
    );
  }


  // -----------------------------------------
  // PALLET INTERSECTIONS
  // -----------------------------------------

  scene.addOnIntersectionListener(
    'MIDDLE_PALLET',
    (type, otherNodeId) => {
      if (type === 'start') {
        directPalletCubes.add(otherNodeId);
      } else {
        directPalletCubes.delete(otherNodeId);
      }

      updateChallengeState();
    },
    allCubes.map(cube => cube.id)
  );


  // -----------------------------------------
  // CUBE INTERSECTIONS
  // -----------------------------------------

  allCubes.forEach((cube, index) => {

    // Only create each pair once.
    for (let i = index + 1; i < allCubes.length; i++) {
      const otherCube = allCubes[i];

      scene.addOnIntersectionListener(
        cube.id,
        (type, otherNodeId) => {

          const key = intersectionKey(
            cube.id,
            otherNodeId
          );

          if (type === 'start') {
            cubeIntersections.add(key);
          } else {
            cubeIntersections.delete(key);
          }

          updateChallengeState();
        },
        [otherCube.id]
      );
    }
  });
`;
export const BEX_6: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 6'),
  description: tr('Botball Explorer Mission 6: Pallet Builder'),
  scripts: {

    palletInStartBox: Script.ecmaScript('Pallet In Start Box', palletInStartBox),
    cubesOnPallet: Script.ecmaScript('Cubes On Pallet', cubesOnPallet),
  },
  geometry: {
    ...baseScene.geometry,
    BLACK_LINE_GEOMETRY,
    smallCubeEnd_geom,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(45),
        y: Distance.centimeters(1),
        z: Distance.centimeters(32),
      },
    },
    pallet_geom: {
      type: 'box',
      size: {
        x: Distance.inches(3.8),
        y: Distance.centimeters(0.1),
        z: Distance.inches(3.8),
      },
    }
  },
  nodes: {
    ...baseScene.nodes,
    startBoxA: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box A'),
      origin: {
        position: {
          x: Distance.centimeters(106.68),
          y: Distance.centimeters(-15),
          z: Distance.centimeters(-6.33),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 255),
        },
      },
    },
    startBoxB: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box B'),
      origin: {
        position: {
          x: Distance.centimeters(-44.71),
          y: Distance.centimeters(-15),
          z: Distance.centimeters(-6.33),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 255),
        },
      },
    },
    blackLine1: { ...blackLineNodes.blackLine1 },
    blackLine2: { ...blackLineNodes.blackLine2 },
    blackLine3: { ...blackLineNodes.blackLine3 },
    blackLine4: { ...blackLineNodes.blackLine4 },
    blackLine5: { ...blackLineNodes.blackLine5 },
    MIDDLE_PALLET,
    palletTop: {
      type: 'object',
      parentId: 'MIDDLE_PALLET',
      geometryId: 'pallet_geom',
      name: tr('Pallet Top'),
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(1.5),
          z: Distance.centimeters(0)
        }
      },

      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(65, 131, 231),
        },
      },
    },
    palletBottom: {
      type: 'object',
      parentId: 'MIDDLE_PALLET',
      geometryId: 'pallet_geom',
      name: tr('Pallet Bottom'),
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(0.04),
          z: Distance.centimeters(0)
        }
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(65, 131, 231),
        },
      },
    },
    TOP_GREEN_2IN_CUBE,
    tGreenTop: createCubeEndNode(tr('Top Green Cube Top'), 'TOP_GREEN_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tGreenBottom: createCubeEndNode(tr('Top Green Cube Bottom'), 'TOP_GREEN_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tGreenLeft: createCubeEndNode(tr('Top Green Cube Left'), 'TOP_GREEN_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tGreenRight: createCubeEndNode(tr('Top Green Cube Right'), 'TOP_GREEN_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tGreenFront: createCubeEndNode(tr('Top Green Cube Front'), 'TOP_GREEN_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tGreenBack: createCubeEndNode(tr('Top Green Cube Back'), 'TOP_GREEN_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    LOW_GREEN_2IN_CUBE,
    lGreenTop: createCubeEndNode(tr('Low Green Cube Top'), 'LOW_GREEN_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lGreenBottom: createCubeEndNode(tr('Low Green Cube Bottom'), 'LOW_GREEN_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lGreenLeft: createCubeEndNode(tr('Low Green Cube Left'), 'LOW_GREEN_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lGreenRight: createCubeEndNode(tr('Low Green Cube Right'), 'LOW_GREEN_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lGreenFront: createCubeEndNode(tr('Low Green Cube Front'), 'LOW_GREEN_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lGreenBack: createCubeEndNode(tr('Low Green Cube Back'), 'LOW_GREEN_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    TOP_YELLOW_2IN_CUBE,
    tYellowTop: createCubeEndNode(tr('Top Yellow Cube Top'), 'TOP_YELLOW_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tYellowBottom: createCubeEndNode(tr('Top Yellow Cube Bottom'), 'TOP_YELLOW_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tYellowLeft: createCubeEndNode(tr('Top Yellow Cube Left'), 'TOP_YELLOW_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tYellowRight: createCubeEndNode(tr('Top Yellow Cube Right'), 'TOP_YELLOW_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tYellowFront: createCubeEndNode(tr('Top Yellow Cube Front'), 'TOP_YELLOW_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tYellowBack: createCubeEndNode(tr('Top Yellow Cube Back'), 'TOP_YELLOW_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    LOW_YELLOW_2IN_CUBE,
    lYellowTop: createCubeEndNode(tr('Low Yellow Cube Top'), 'LOW_YELLOW_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lYellowBottom: createCubeEndNode(tr('Low Yellow Cube Bottom'), 'LOW_YELLOW_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lYellowLeft: createCubeEndNode(tr('Low Yellow Cube Left'), 'LOW_YELLOW_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lYellowRight: createCubeEndNode(tr('Low Yellow Cube Right'), 'LOW_YELLOW_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lYellowFront: createCubeEndNode(tr('Low Yellow Cube Front'), 'LOW_YELLOW_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lYellowBack: createCubeEndNode(tr('Low Yellow Cube Back'), 'LOW_YELLOW_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
  }
};