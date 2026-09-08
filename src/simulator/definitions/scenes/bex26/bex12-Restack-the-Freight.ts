import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
// import { createBaseSceneSurfaceB } from './jbcBase';
// import { setNodeVisible } from './jbcCommonComponents';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { RIGHT_STACK_RED_2IN_CUBE, RIGHT_STACK_GREEN_2IN_CUBE, RIGHT_STACK_YELLOW_2IN_CUBE } from '../26botballExplorerSandbox';
import { createCubeEndNode, smallCubeEnd_geom, getHighestFaceScript, getLowestFaceScript, isCubeOnTopOfScript } from './bexCommonComponents';



const cubesStacked = `
  const greenCubeFaces = ['greenCubeTop', 'greenCubeBottom', 'greenCubeLeft', 'greenCubeRight', 'greenCubeFront', 'greenCubeBack'];
  const redCubeFaces = ['redCubeTop', 'redCubeBottom', 'redCubeLeft', 'redCubeRight', 'redCubeFront', 'redCubeBack'];
  const yellowCubeFaces = ['yellowCubeTop', 'yellowCubeBottom', 'yellowCubeLeft', 'yellowCubeRight', 'yellowCubeFront', 'yellowCubeBack'];

  const allCubes = [
    {
      id: 'RIGHT_STACK_GREEN_2IN_CUBE',
      faces: greenCubeFaces
    },
    {
      id: 'RIGHT_STACK_RED_2IN_CUBE',
      faces: redCubeFaces
    },
    {
      id: 'RIGHT_STACK_YELLOW_2IN_CUBE',
      faces: yellowCubeFaces
    }
  ];  

  //Active cube/cube intersections
  // "A:B" means A and B are currently intersecting.
  const cubeIntersections = new Set();

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
  
    let changed = true;

    while(changed){
      changed = false;

      cubeIntersections.forEach(key => {
        const [cubeA, cubeB] = key.split(':')

        if(isCubeOnTopOf(cubeA, cubeB)){
          //console.log(cubeA, 'is on top of', cubeB);
          changed = true;
        }
      });
    }

    console.log('cubeIntersections', cubeIntersections);
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
        }
        console.log("cubeIntersections", cubeIntersections);
        updateChallengeState();
      }, [otherCube.id]);
    }
  });




`;


const baseScene = createBaseSceneSurface();

export const BEX_12: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 12'),
  description: tr('Botball Explorer Mission 12: Restack the Freight'),
  scripts: {
    cubesStacked: Script.ecmaScript('Cubes Stacked', cubesStacked),
  },
  geometry: {
    ...baseScene.geometry,
    smallCubeEnd_geom
  },
  nodes: {
    ...baseScene.nodes,
    RIGHT_STACK_GREEN_2IN_CUBE,
    greenCubeTop: createCubeEndNode(tr('Green Cube Top'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'top', "smallCubeEnd_geom", Color.rgb(35, 240, 154)),
    greenCubeLeft: createCubeEndNode(tr('Green Cube Left'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'left', "smallCubeEnd_geom", Color.rgb(35, 240, 154)),
    greenCubeBack: createCubeEndNode(tr('Green Cube Back'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'back', "smallCubeEnd_geom", Color.rgb(35, 240, 154)),
    greenCubeFront: createCubeEndNode(tr('Green Cube Front'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'front', "smallCubeEnd_geom", Color.rgb(35, 240, 154)),
    greenCubeRight: createCubeEndNode(tr('Green Cube Right'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'right', "smallCubeEnd_geom", Color.rgb(35, 240, 154)),
    greenCubeBottom: createCubeEndNode(tr('Green Cube Bottom'), 'RIGHT_STACK_GREEN_2IN_CUBE', 'bottom', "smallCubeEnd_geom", Color.rgb(35, 240, 154)),
    RIGHT_STACK_RED_2IN_CUBE,
    redCubeTop: createCubeEndNode(tr('Red Cube Top'), 'RIGHT_STACK_RED_2IN_CUBE', 'top', "smallCubeEnd_geom", Color.rgb(255, 115, 0)),
    redCubeLeft: createCubeEndNode(tr('Red Cube Left'), 'RIGHT_STACK_RED_2IN_CUBE', 'left', "smallCubeEnd_geom", Color.rgb(255, 115, 0)),
    redCubeBack: createCubeEndNode(tr('Red Cube Back'), 'RIGHT_STACK_RED_2IN_CUBE', 'back', "smallCubeEnd_geom", Color.rgb(255, 115, 0)),
    redCubeFront: createCubeEndNode(tr('Red Cube Front'), 'RIGHT_STACK_RED_2IN_CUBE', 'front', "smallCubeEnd_geom", Color.rgb(255, 115, 0)),
    redCubeRight: createCubeEndNode(tr('Red Cube Right'), 'RIGHT_STACK_RED_2IN_CUBE', 'right', "smallCubeEnd_geom", Color.rgb(255, 115, 0)),
    redCubeBottom: createCubeEndNode(tr('Red Cube Bottom'), 'RIGHT_STACK_RED_2IN_CUBE', 'bottom', "smallCubeEnd_geom", Color.rgb(255, 115, 0)),
    RIGHT_STACK_YELLOW_2IN_CUBE,
    yellowCubeTop: createCubeEndNode(tr('Yellow Cube Top'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'top', "smallCubeEnd_geom", Color.rgb(229, 97, 255)),
    yellowCubeLeft: createCubeEndNode(tr('Yellow Cube Left'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'left', "smallCubeEnd_geom", Color.rgb(229, 97, 255)),
    yellowCubeBack: createCubeEndNode(tr('Yellow Cube Back'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'back', "smallCubeEnd_geom", Color.rgb(229, 97, 255)),
    yellowCubeFront: createCubeEndNode(tr('Yellow Cube Front'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'front', "smallCubeEnd_geom", Color.rgb(229, 97, 255)),
    yellowCubeRight: createCubeEndNode(tr('Yellow Cube Right'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'right', "smallCubeEnd_geom", Color.rgb(229, 97, 255)),
    yellowCubeBottom: createCubeEndNode(tr('Yellow Cube Bottom'), 'RIGHT_STACK_YELLOW_2IN_CUBE', 'bottom', "smallCubeEnd_geom", Color.rgb(229, 97, 255)),
  }
};