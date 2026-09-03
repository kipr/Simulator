import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
// import { createBaseSceneSurfaceB } from './jbcBase';
// import { setNodeVisible } from './jbcCommonComponents';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { MIDDLE_GREEN_2IN_CUBE, MIDDLE_RED_2IN_CUBE, MIDDLE_YELLOW_2IN_CUBE } from '../26botballExplorerSandbox';
import { smallCubeEnd_geom, blackLineNodes, BLACK_LINE_GEOMETRY, getLowestFaceScript, getHighestFaceScript, isCubeOnTopOfScript, createCubeEndNode } from './bexCommonComponents';

const baseScene = createBaseSceneSurface();

const cubesOnBlackLine = `
  const allCubes = ['MIDDLE_GREEN_2IN_CUBE', 'MIDDLE_RED_2IN_CUBE', 'MIDDLE_YELLOW_2IN_CUBE'];
  let cubesOnBlackLine = {
    MIDDLE_GREEN_2IN_CUBE: false,
    MIDDLE_RED_2IN_CUBE: true,
    MIDDLE_YELLOW_2IN_CUBE: true
  };
  allCubes.forEach((cube,index) => {
     scene.addOnIntersectionListener(cube, (type, otherNodeId) => {

        type === 'start' ? cubesOnBlackLine[cube] = true : type === 'end' ? cubesOnBlackLine[cube] = false : null;

        const allCubesOffBlackLine =
      Object.values(cubesOnBlackLine).some(value => value);
        scene.setChallengeEventValue('allCubesOffBlackLine', allCubesOffBlackLine === false);
      }, ['blackLine1', 'blackLine2', 'blackLine3', 'blackLine4', 'blackLine5']);

  });

`;

const cubesStacked = `
  const greenCubeFaces = ['greenCubeTop', 'greenCubeBottom', 'greenCubeLeft', 'greenCubeRight', 'greenCubeFront', 'greenCubeBack'];
  const redCubeFaces = ['redCubeTop', 'redCubeBottom', 'redCubeLeft', 'redCubeRight', 'redCubeFront', 'redCubeBack'];
  const yellowCubeFaces = ['yellowCubeTop', 'yellowCubeBottom', 'yellowCubeLeft', 'yellowCubeRight', 'yellowCubeFront', 'yellowCubeBack'];
  

  const allCubes = [
    {
      id: 'MIDDLE_GREEN_2IN_CUBE',
      faces: greenCubeFaces
    },
    {
      id: 'MIDDLE_RED_2IN_CUBE',
      faces: redCubeFaces
    },
    {
      id: 'MIDDLE_YELLOW_2IN_CUBE',
      faces: yellowCubeFaces
    } 
  ];

  // Active cube/cube intersections
  // "A:B" means A and B are currently intersecting.
  const cubeIntersections = new Set();

  // "A - B" means A is on top of B.
  const cubeOnTopOf = new Set();

  ${getLowestFaceScript}
  ${getHighestFaceScript}
  ${isCubeOnTopOfScript}

  function intersectionKey(a, b) {
    return [a,b].sort().join(':');
  }

  function getCube(cubeId) {
    return allCubes.find(cube => cube.id === cubeId);
  }

  function updateChallengeState() {
    cubeIntersections.forEach(key => {
      const [cubeA, cubeB] = key.split(':')

      if(isCubeOnTopOf(cubeA, cubeB)){
        cubeOnTopOf.add(cubeA + '-' + cubeB);
      }
      else if(isCubeOnTopOf(cubeB, cubeA)){
        cubeOnTopOf.add(cubeB + '-' + cubeA);
      }

    });


    scene.setChallengeEventValue('bonus', cubeOnTopOf.size >= 1);
    scene.setChallengeEventValue('advancedBonus', cubeOnTopOf.size === 2);
  }



  allCubes.forEach((cube,index) => {
    for(let i = index + 1; i < allCubes.length; i++){
      const otherCube = allCubes[i];
      
      scene.addOnIntersectionListener(cube.id, (type, otherNodeId) => {
        const key = intersectionKey(cube.id, otherNodeId);
        if(type === 'start'){
          cubeIntersections.add(key);
        }
        else if(type === 'end'){
          cubeIntersections.delete(key);
          for (const item of cubeOnTopOf) {
            if (item.startsWith(cube.id+'-') || item.startsWith(otherNodeId+'-')) {
              cubeOnTopOf.delete(item);
            }
          }
          
        }
        updateChallengeState();
      }, [otherCube.id]);
    }
  });


`;


export const BEX_13: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 13'),
  description: tr('Botball Explorer Mission 13: Rebuild the Shipment'),
  scripts: {
    cubesOnBlackLine: Script.ecmaScript('Cubes On Black Line', cubesOnBlackLine),
    cubesStacked: Script.ecmaScript('Cubes Stacked', cubesStacked),
  },
  geometry: {
    ...baseScene.geometry,
    smallCubeEnd_geom,
    BLACK_LINE_GEOMETRY
  },
  nodes: {
    ...baseScene.nodes,
    ...blackLineNodes,
    MIDDLE_GREEN_2IN_CUBE,
    greenCubeTop: createCubeEndNode(tr('Green Cube Top'), 'MIDDLE_GREEN_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeBottom: createCubeEndNode(tr('Green Cube Bottom'), 'MIDDLE_GREEN_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeLeft: createCubeEndNode(tr('Green Cube Left'), 'MIDDLE_GREEN_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeRight: createCubeEndNode(tr('Green Cube Right'), 'MIDDLE_GREEN_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeFront: createCubeEndNode(tr('Green Cube Front'), 'MIDDLE_GREEN_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeBack: createCubeEndNode(tr('Green Cube Back'), 'MIDDLE_GREEN_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    MIDDLE_RED_2IN_CUBE,
    redCubeTop: createCubeEndNode(tr('Red Cube Top'), 'MIDDLE_RED_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeBottom: createCubeEndNode(tr('Red Cube Bottom'), 'MIDDLE_RED_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeLeft: createCubeEndNode(tr('Red Cube Left'), 'MIDDLE_RED_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeRight: createCubeEndNode(tr('Red Cube Right'), 'MIDDLE_RED_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeFront: createCubeEndNode(tr('Red Cube Front'), 'MIDDLE_RED_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeBack: createCubeEndNode(tr('Red Cube Back'), 'MIDDLE_RED_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    MIDDLE_YELLOW_2IN_CUBE,
    yellowCubeTop: createCubeEndNode(tr('Yellow Cube Top'), 'MIDDLE_YELLOW_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeBottom: createCubeEndNode(tr('Yellow Cube Bottom'), 'MIDDLE_YELLOW_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeLeft: createCubeEndNode(tr('Yellow Cube Left'), 'MIDDLE_YELLOW_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeRight: createCubeEndNode(tr('Yellow Cube Right'), 'MIDDLE_YELLOW_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeFront: createCubeEndNode(tr('Yellow Cube Front'), 'MIDDLE_YELLOW_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeBack: createCubeEndNode(tr('Yellow Cube Back'), 'MIDDLE_YELLOW_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),

  }
};