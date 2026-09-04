import Scene from '../../../../state/State/Scene';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { BROWN_4IN_CUBE, MIDDLE_GREEN_2IN_CUBE, MIDDLE_RED_2IN_CUBE, MIDDLE_YELLOW_2IN_CUBE } from '../26botballExplorerSandbox';
import { createCubeEndNode, smallCubeEnd_geom, largeCubeEnd_geom, isCubeOnTopOfScript, getHighestFaceScript, getLowestFaceScript, } from './bexCommonComponents';
const baseScene = createBaseSceneSurface();


const cubesStacked = `
  const largeBrownCubeFaces = ['largeBrownCubeTop', 'largeBrownCubeBottom', 'largeBrownCubeLeft', 'largeBrownCubeRight', 'largeBrownCubeFront', 'largeBrownCubeBack'];
  const yellowCubeFaces = ['yellowCubeTop', 'yellowCubeBottom', 'yellowCubeLeft', 'yellowCubeRight', 'yellowCubeFront', 'yellowCubeBack'];
  const redCubeFaces = ['redCubeTop', 'redCubeBottom', 'redCubeLeft', 'redCubeRight', 'redCubeFront', 'redCubeBack'];
  const greenCubeFaces = ['greenCubeTop', 'greenCubeBottom', 'greenCubeLeft', 'greenCubeRight', 'greenCubeFront', 'greenCubeBack'];

  const allSmallCubes = [
    {
      id: 'MIDDLE_YELLOW_2IN_CUBE',
      faces: yellowCubeFaces
    },
    {
      id: 'MIDDLE_RED_2IN_CUBE',
      faces: redCubeFaces
    },
    {
      id: 'MIDDLE_GREEN_2IN_CUBE',
      faces: greenCubeFaces
    }
  ];
 
  const largeBrownCube = {
    id: 'BROWN_4IN_CUBE',
    faces: largeBrownCubeFaces
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
    scene.setChallengeEventValue('oneCubeOnLargeBrownCube', supportedCubes.size >= 1);
    scene.setChallengeEventValue('bonus', supportedCubes.size >= 2);
  }


  //Large Cube Intersections
  scene.addOnIntersectionListener('BROWN_4IN_CUBE', (type, otherNodeId) => {
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

export const BEX_17: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 17'),
  description: tr('Botball Explorer Mission 17: Freight Racking'),
  scripts: {
    cubesStacked: Script.ecmaScript('Cubes Stacked', cubesStacked),
  },
  geometry: {
    ...baseScene.geometry,
    smallCubeEnd_geom,
    largeCubeEnd_geom
  },
  nodes: {
    ...baseScene.nodes,
    BROWN_4IN_CUBE,
    largeBrownCubeTop: createCubeEndNode(tr('Brown Cube Top'), 'BROWN_4IN_CUBE', 'top', 'largeCubeEnd_geom', Color.rgb(0.5, 0.25, 0)),
    largeBrownCubeBottom: createCubeEndNode(tr('Brown Cube Bottom'), 'BROWN_4IN_CUBE', 'bottom', 'largeCubeEnd_geom', Color.rgb(0.5, 0.25, 0)),
    largeBrownCubeLeft: createCubeEndNode(tr('Brown Cube Left'), 'BROWN_4IN_CUBE', 'left', 'largeCubeEnd_geom', Color.rgb(0.5, 0.25, 0)),
    largeBrownCubeRight: createCubeEndNode(tr('Brown Cube Right'), 'BROWN_4IN_CUBE', 'right', 'largeCubeEnd_geom', Color.rgb(0.5, 0.25, 0)),
    largeBrownCubeFront: createCubeEndNode(tr('Brown Cube Front'), 'BROWN_4IN_CUBE', 'front', 'largeCubeEnd_geom', Color.rgb(0.5, 0.25, 0)),
    largeBrownCubeBack: createCubeEndNode(tr('Brown Cube Back'), 'BROWN_4IN_CUBE', 'back', 'largeCubeEnd_geom', Color.rgb(0.5, 0.25, 0)),
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