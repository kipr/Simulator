import Scene from '../../../../state/State/Scene';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { TOP_YELLOW_2IN_CUBE, LOW_YELLOW_2IN_CUBE, TOP_GREEN_2IN_CUBE, LOW_GREEN_2IN_CUBE } from '../26botballExplorerSandbox';
import { createCubeEndNode, smallCubeEnd_geom, getLowestFaceScript, getHighestFaceScript, isCubeOnTopOfScript } from './bexCommonComponents';
const baseScene = createBaseSceneSurface();


const cubesStacked = `
  const topGreenCubeFaces = ['tGreenTop', 'tGreenBottom', 'tGreenLeft', 'tGreenRight', 'tGreenFront', 'tGreenBack'];
  const lowGreenCubeFaces = ['lGreenTop', 'lGreenBottom', 'lGreenLeft', 'lGreenRight', 'lGreenFront', 'lGreenBack'];
  const topYellowCubeFaces = ['tYellowTop', 'tYellowBottom', 'tYellowLeft', 'tYellowRight', 'tYellowFront', 'tYellowBack'];
  const lowYellowCubeFaces = ['lYellowTop', 'lYellowBottom', 'lYellowLeft', 'lYellowRight', 'lYellowFront', 'lYellowBack'];

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
  ]
  const cubeIntersections = new Set();
  const finalStacked = new Set();
  ${getLowestFaceScript}
  ${getHighestFaceScript}
  ${isCubeOnTopOfScript}

  // a:b means intersecting
  function intersectionKey(a, b) {
    return [a, b].sort().join(':');
  }
  // a-b means a is stacked on b
  function stackedKey(a, b) {
    return [a, b].join('-');
  }

  function getCube(cubeId) {
    return allCubes.find(cube => cube.id === cubeId);
  }

  function updateChallengeState() {
    cubeIntersections.forEach(key => {
      const [cubeA, cubeB] = key.split(':');
      if(isCubeOnTopOf(cubeA, cubeB)){
        console.log(cubeA, 'is on top of', cubeB);
        finalStacked.add(stackedKey(cubeA, cubeB));

      }
      else if(isCubeOnTopOf(cubeB, cubeA)){
        finalStacked.add(stackedKey(cubeB, cubeA));
      }
    });

    const hasGreenOnYellow = [...finalStacked].some(key => key.split('-')[0].includes('GREEN') && key.split('-')[1].includes('YELLOW'));
    const hasYellowOnGreen = [...finalStacked].some(key => key.split('-')[0].includes('YELLOW') && key.split('-')[1].includes('GREEN'));
  
    scene.setChallengeEventValue('greenCubeStackedOnYellow', hasGreenOnYellow);
    scene.setChallengeEventValue('yellowCubeStackedOnGreen', hasYellowOnGreen);
    scene.setChallengeEventValue('bonus', finalStacked.size >= 2);
    scene.setChallengeEventValue('advancedBonus', hasGreenOnYellow && hasYellowOnGreen);
  }

  allCubes.forEach((cube,index) => {
    for (let i=index + 1; i < allCubes.length; i++) {
      const otherCube = allCubes[i];
      scene.addOnIntersectionListener(cube.id, (type, otherNodeId) => {
      console.log("cube.id: ", cube.id, "otherNodeId: ", otherNodeId, "type: ", type);
        const key = intersectionKey(cube.id, otherNodeId);

        if(type === 'start'){
          cubeIntersections.add(key);
        }
        else if(type === 'end'){
          cubeIntersections.delete(key);
          finalStacked.has(stackedKey(cube.id, otherNodeId)) ? finalStacked.delete(stackedKey(cube.id, otherNodeId)) : null;
          finalStacked.has(stackedKey(otherNodeId, cube.id)) ? finalStacked.delete(stackedKey(otherNodeId, cube.id)) : null;
        }
        updateChallengeState();
      }, otherCube.id); 
    }
  });
`;

export const BEX_3: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 3'),
  description: tr('Botball Explorer Mission 3: Mixed Freight'),
  scripts: {
    cubesStacked: Script.ecmaScript('Top Green Cube Stacked', cubesStacked),
  },
  geometry: {
    ...baseScene.geometry,
    smallCubeEnd_geom

  },
  nodes: {
    ...baseScene.nodes,
    TOP_GREEN_2IN_CUBE,
    tGreenTop: createCubeEndNode(tr('Top Green Cube Top'), 'TOP_GREEN_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tGreenBottom: createCubeEndNode(tr('Top Green Cube Bottom'), 'TOP_GREEN_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    tGreenLeft: createCubeEndNode(tr('Top Green Cube Left'), 'TOP_GREEN_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tGreenRight: createCubeEndNode(tr('Top Green Cube Right'), 'TOP_GREEN_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    tGreenFront: createCubeEndNode(tr('Top Green Cube Front'), 'TOP_GREEN_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tGreenBack: createCubeEndNode(tr('Top Green Cube Back'), 'TOP_GREEN_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),

    LOW_GREEN_2IN_CUBE,
    lGreenTop: createCubeEndNode(tr('Low Green Cube Top'), 'LOW_GREEN_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    lGreenBottom: createCubeEndNode(tr('Low Green Cube Bottom'), 'LOW_GREEN_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lGreenLeft: createCubeEndNode(tr('Low Green Cube Left'), 'LOW_GREEN_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    lGreenRight: createCubeEndNode(tr('Low Green Cube Right'), 'LOW_GREEN_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lGreenFront: createCubeEndNode(tr('Low Green Cube Front'), 'LOW_GREEN_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    lGreenBack: createCubeEndNode(tr('Low Green Cube Back'), 'LOW_GREEN_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),

    TOP_YELLOW_2IN_CUBE,
    tYellowTop: createCubeEndNode(tr('Top Yellow Cube Top'), 'TOP_YELLOW_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tYellowBottom: createCubeEndNode(tr('Top Yellow Cube Bottom'), 'TOP_YELLOW_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    tYellowLeft: createCubeEndNode(tr('Top Yellow Cube Left'), 'TOP_YELLOW_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tYellowRight: createCubeEndNode(tr('Top Yellow Cube Right'), 'TOP_YELLOW_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    tYellowFront: createCubeEndNode(tr('Top Yellow Cube Front'), 'TOP_YELLOW_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    tYellowBack: createCubeEndNode(tr('Top Yellow Cube Back'), 'TOP_YELLOW_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),

    LOW_YELLOW_2IN_CUBE,
    lYellowTop: createCubeEndNode(tr('Low Yellow Cube Top'), 'LOW_YELLOW_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    lYellowBottom: createCubeEndNode(tr('Low Yellow Cube Bottom'), 'LOW_YELLOW_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lYellowLeft: createCubeEndNode(tr('Low Yellow Cube Left'), 'LOW_YELLOW_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    lYellowRight: createCubeEndNode(tr('Low Yellow Cube Right'), 'LOW_YELLOW_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),
    lYellowFront: createCubeEndNode(tr('Low Yellow Cube Front'), 'LOW_YELLOW_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 115, 0)),
    lYellowBack: createCubeEndNode(tr('Low Yellow Cube Back'), 'LOW_YELLOW_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(229, 97, 255)),

  }
};