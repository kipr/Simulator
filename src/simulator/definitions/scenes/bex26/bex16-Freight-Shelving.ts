import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
// import { createBaseSceneSurfaceB } from './jbcBase';
// import { setNodeVisible } from './jbcCommonComponents';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { MIDDLE_GREEN_4IN_CUBE, MIDDLE_GREEN_4IN_PALLET, RIGHT_STACK_GREEN_2IN_CUBE, RIGHT_STACK_RED_2IN_CUBE, RIGHT_STACK_YELLOW_2IN_CUBE } from '../26botballExplorerSandbox';
import { createCubeEndNode, smallCubeEnd_geom, pallet_geom, largeCubeEnd_geom, isCubeOnTopOfScript, getLowestFaceScript, getHighestFaceScript } from './bexCommonComponents';

const baseScene = createBaseSceneSurface();

const cubesStacked = `
  const largeGreenCubeFaces = ['largeGreenCubeTop', 'largeGreenCubeBottom', 'largeGreenCubeLeft', 'largeGreenCubeRight', 'largeGreenCubeFront', 'largeGreenCubeBack'];
  const yellowCubeFaces = ['yellowCubeTop', 'yellowCubeBottom', 'yellowCubeLeft', 'yellowCubeRight', 'yellowCubeFront', 'yellowCubeBack'];
  const redCubeFaces = ['redCubeTop', 'redCubeBottom', 'redCubeLeft', 'redCubeRight', 'redCubeFront', 'redCubeBack'];
  const greenCubeFaces = ['greenCubeTop', 'greenCubeBottom', 'greenCubeLeft', 'greenCubeRight', 'greenCubeFront', 'greenCubeBack'];

  const allSmallCubes = [
    {
      id: 'RIGHT_STACK_YELLOW_2IN_CUBE',
      faces: yellowCubeFaces
    },
    {
      id: 'RIGHT_STACK_RED_2IN_CUBE',
      faces: redCubeFaces
    },
    {
      id: 'RIGHT_STACK_GREEN_2IN_CUBE',
      faces: greenCubeFaces
    }
  ];
 
  const largeGreenCube = {
    id: 'MIDDLE_GREEN_4IN_CUBE',
    faces: largeGreenCubeFaces
  };

  const largeCubeIntersections = new Set();
  const cubeIntersections = new Set();
  ${isCubeOnTopOfScript}
  ${getLowestFaceScript}
  ${getHighestFaceScript}

  function intersectionKey(a,b){
    return [a,b].sort().join(':');
  }
 
   function getCube(cubeId) {
    return allSmallCubes.find(cube => cube.id === cubeId);
  }
  function updateChallengeState() {

    const supportedCubes = new Set(largeCubeIntersections);
    let changed = true;

    while(changed) {
      changed = false;
      cubeIntersections.forEach(key => {
      const [cubeA, cubeB] = key.split(':');
      // A is on B, and B is supported
      if(supportedCubes.has(cubeB) && !supportedCubes.has(cubeA) && isCubeOnTopOf(cubeA, cubeB)){
        supportedCubes.add(cubeA);
        changed = true;
      }

      // B is on A, and A is supported
      if(supportedCubes.has(cubeA) && !supportedCubes.has(cubeB) && isCubeOnTopOf(cubeB, cubeA) ){
        supportedCubes.add(cubeB);
        changed = true;
      }
        });
    }
    scene.setChallengeEventValue('oneCubeOnLargeGreenCube', supportedCubes.size >= 1);
    scene.setChallengeEventValue('bonus', supportedCubes.size >= 2);
  }


  //Large Cube Intersections
  scene.addOnIntersectionListener('MIDDLE_GREEN_4IN_CUBE', (type, otherNodeId) => {
    type === 'start' ? largeCubeIntersections.add(otherNodeId) : largeCubeIntersections.delete(otherNodeId);
    updateChallengeState();
  },

  allSmallCubes.map(cube => cube.id));

  // Small Cube Intersections
  allSmallCubes.forEach((cube,index) => {
    for (let i=index + 1; i < allSmallCubes.length; i++) {
      const otherCube = allSmallCubes[i];
      scene.addOnIntersectionListener(cube.id, (type, otherNodeId) => {
      const key = intersectionKey(cube.id, otherNodeId);  
      type === 'start' ? cubeIntersections.add(key) : cubeIntersections.delete(key);

      updateChallengeState();
      }, [otherCube.id]);
    }
  });


      
`;


export const BEX_16: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 16'),
  description: tr('Botball Explorer Mission 16: Freight Shelving'),
  scripts: {
    cubesStacked: Script.ecmaScript('Cubes Stacked', cubesStacked),
  },
  geometry: {
    ...baseScene.geometry,
    pallet_geom,
    smallCubeEnd_geom,
    largeCubeEnd_geom,
  },
  nodes: {
    ...baseScene.nodes,
    RIGHT_STACK_GREEN_2IN_CUBE,
    greenCubeTop: createCubeEndNode(tr('greenCubeTop'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeBottom: createCubeEndNode(tr('greenCubeBottom'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeLeft: createCubeEndNode(tr('greenCubeLeft'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeRight: createCubeEndNode(tr('greenCubeRight'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeFront: createCubeEndNode(tr('greenCubeFront'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    greenCubeBack: createCubeEndNode(tr('greenCubeBack'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(0, 255, 0)),
    RIGHT_STACK_RED_2IN_CUBE,
    redCubeTop: createCubeEndNode(tr('redCubeTop'), 'RIGHT_STACK_RED_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeBottom: createCubeEndNode(tr('redCubeBottom'), 'RIGHT_STACK_RED_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeLeft: createCubeEndNode(tr('redCubeLeft'), 'RIGHT_STACK_RED_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeRight: createCubeEndNode(tr('redCubeRight'), 'RIGHT_STACK_RED_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeFront: createCubeEndNode(tr('redCubeFront'), 'RIGHT_STACK_RED_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    redCubeBack: createCubeEndNode(tr('redCubeBack'), 'RIGHT_STACK_RED_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    RIGHT_STACK_YELLOW_2IN_CUBE,
    yellowCubeTop: createCubeEndNode(tr('yellowCubeTop'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeBottom: createCubeEndNode(tr('yellowCubeBottom'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeLeft: createCubeEndNode(tr('yellowCubeLeft'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeRight: createCubeEndNode(tr('yellowCubeRight'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeFront: createCubeEndNode(tr('yellowCubeFront'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    yellowCubeBack: createCubeEndNode(tr('yellowCubeBack'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 255, 0)),
    MIDDLE_GREEN_4IN_CUBE,
    largeGreenCubeTop: createCubeEndNode(tr('largeGreenCubeTop'), 'MIDDLE_GREEN_4IN_CUBE', 'top', 'largeCubeEnd_geom', Color.rgb(0, 255, 0)),
    largeGreenCubeBottom: createCubeEndNode(tr('largeGreenCubeBottom'), 'MIDDLE_GREEN_4IN_CUBE', 'bottom', 'largeCubeEnd_geom', Color.rgb(0, 255, 0)),
    largeGreenCubeLeft: createCubeEndNode(tr('largeGreenCubeLeft'), 'MIDDLE_GREEN_4IN_CUBE', 'left', 'largeCubeEnd_geom', Color.rgb(0, 255, 0)),
    largeGreenCubeRight: createCubeEndNode(tr('largeGreenCubeRight'), 'MIDDLE_GREEN_4IN_CUBE', 'right', 'largeCubeEnd_geom', Color.rgb(0, 255, 0)),
    largeGreenCubeFront: createCubeEndNode(tr('largeGreenCubeFront'), 'MIDDLE_GREEN_4IN_CUBE', 'front', 'largeCubeEnd_geom', Color.rgb(0, 255, 0)),
    largeGreenCubeBack: createCubeEndNode(tr('largeGreenCubeBack'), 'MIDDLE_GREEN_4IN_CUBE', 'back', 'largeCubeEnd_geom', Color.rgb(0, 255, 0)),
    MIDDLE_GREEN_4IN_PALLET,

  }
};