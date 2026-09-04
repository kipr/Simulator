import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { LOW_2INCH_RED_CUBE, HIGH_2INCH_RED_CUBE, RED_4INCH_CUBE, RED_4INCH_CUBE_PALLET } from '../26botballExplorerSandbox';
import { createCubeEndNode, getLowestFaceScript, getHighestFaceScript, isCubeOnTopOfScript } from './bexCommonComponents';

const cubesStacked = `
const highRedCubeFaces = ['hSmallRedCubeTop', 'hSmallRedCubeBottom', 'hSmallRedCubeLeft', 'hSmallRedCubeRight', 'hSmallRedCubeFront', 'hSmallRedCubeBack'];
const lowRedCubeFaces = ['lSmallRedCubeTop', 'lSmallRedCubeBottom', 'lSmallRedCubeLeft', 'lSmallRedCubeRight', 'lSmallRedCubeFront', 'lSmallRedCubeBack'];
const largeRedCubeFaces = ['largeRedCubeTop', 'largeRedCubeBottom', 'largeRedCubeLeft', 'largeRedCubeRight', 'largeRedCubeFront', 'largeRedCubeBack'];
const smallRedCubes = [
  {
    id: 'HIGH_2INCH_RED_CUBE',
    faces: highRedCubeFaces
  },
  {
    id: 'LOW_2INCH_RED_CUBE',
    faces: lowRedCubeFaces
  },
];

const largeRedCube = {
  id: 'RED_4INCH_CUBE',
  faces: largeRedCubeFaces
};

const allCubes = [...smallRedCubes, largeRedCube];

const activeIntersections = new Set();
const largeCubeIntersections = new Set();

${getLowestFaceScript}
${getHighestFaceScript}
${isCubeOnTopOfScript}



  function getCube(cubeId) {
    return allCubes.find(cube => cube.id === cubeId);
  }



function updateChallengeState() {
   
   const supportedCubes = new Set(largeCubeIntersections);
   let changed = true;

   while(changed) {
     changed = false;
     activeIntersections.forEach(cubeId => {
       if(!supportedCubes.has(cubeId) && isCubeOnTopOf(cubeId, largeRedCube.id)){
         supportedCubes.add(cubeId);
         changed = true;
       }
     });
   }

  scene.setChallengeEventValue('smallRedOnLargeRed', supportedCubes.size >= 1);
  scene.setChallengeEventValue('bonus', supportedCubes.size >= 2);
}

// Large Red Cube Intersections
scene.addOnIntersectionListener('RED_4INCH_CUBE', (type, otherNodeId) => {
  type === 'start' ? largeCubeIntersections.add(otherNodeId) : largeCubeIntersections.delete(otherNodeId);
  updateChallengeState();
}, ['HIGH_2INCH_RED_CUBE', 'LOW_2INCH_RED_CUBE']);

//Small Cube Intersections
smallRedCubes.forEach((cube,index) => {
  for (let i=index + 1; i < smallRedCubes.length; i++) {
    const otherCube = smallRedCubes[i];
    scene.addOnIntersectionListener(cube.id, (type, otherNodeId) => {
      type === 'start' ? activeIntersections.add(otherNodeId) : activeIntersections.delete(otherNodeId);
      updateChallengeState();
    }, [otherCube.id]);
  }
});
`;


const baseScene = createBaseSceneSurface();

export const BEX_5: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 5'),
  description: tr('Botball Explorer Mission 5: Top Shelf Delivery'),
  scripts: {
    cubesStacked: Script.ecmaScript('Cubes Stacked', cubesStacked),
  },
  geometry: {
    ...baseScene.geometry,
    smallCubeEnd_geom: {
      type: 'box',
      size: {
        x: Distance.inches(1.8),
        y: Distance.centimeters(0.1),
        z: Distance.inches(1.8)
      }
    },
    largeCubeEnd_geom: {
      type: 'box',
      size: {
        x: Distance.inches(3.8),
        y: Distance.centimeters(0.1),
        z: Distance.inches(3.8)
      }
    },
  },
  nodes: {
    ...baseScene.nodes,
    RED_4INCH_CUBE_PALLET,
    LOW_2INCH_RED_CUBE,
    lSmallRedCubeTop: createCubeEndNode(tr('Low 2-inch Red Cube Top'), 'LOW_2INCH_RED_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeBottom: createCubeEndNode(tr('Low 2-inch Red Cube Bottom'), 'LOW_2INCH_RED_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeLeft: createCubeEndNode(tr('Low 2-inch Red Cube Left'), 'LOW_2INCH_RED_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeBack: createCubeEndNode(tr('Low 2-inch Red Cube Back'), 'LOW_2INCH_RED_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeFront: createCubeEndNode(tr('Low 2-inch Red Cube Front'), 'LOW_2INCH_RED_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeRight: createCubeEndNode(tr('Low 2-inch Red Cube Right'), 'LOW_2INCH_RED_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    HIGH_2INCH_RED_CUBE,
    hSmallRedCubeTop: createCubeEndNode(tr('High 2-inch Red Cube Top'), 'HIGH_2INCH_RED_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeBottom: createCubeEndNode(tr('High 2-inch Red Cube Bottom'), 'HIGH_2INCH_RED_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeLeft: createCubeEndNode(tr('High 2-inch Red Cube Left'), 'HIGH_2INCH_RED_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeBack: createCubeEndNode(tr('High 2-inch Red Cube Back'), 'HIGH_2INCH_RED_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeFront: createCubeEndNode(tr('High 2-inch Red Cube Front'), 'HIGH_2INCH_RED_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeRight: createCubeEndNode(tr('High 2-inch Red Cube Right'), 'HIGH_2INCH_RED_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    RED_4INCH_CUBE,
    largeRedCubeTop: createCubeEndNode(tr('4-inch Red Cube Top'), 'RED_4INCH_CUBE', 'top', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeBottom: createCubeEndNode(tr('4-inch Red Cube Bottom'), 'RED_4INCH_CUBE', 'bottom', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeLeft: createCubeEndNode(tr('4-inch Red Cube Left'), 'RED_4INCH_CUBE', 'left', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeBack: createCubeEndNode(tr('4-inch Red Cube Back'), 'RED_4INCH_CUBE', 'back', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeFront: createCubeEndNode(tr('4-inch Red Cube Front'), 'RED_4INCH_CUBE', 'front', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeRight: createCubeEndNode(tr('4-inch Red Cube Right'), 'RED_4INCH_CUBE', 'right', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
  }
};