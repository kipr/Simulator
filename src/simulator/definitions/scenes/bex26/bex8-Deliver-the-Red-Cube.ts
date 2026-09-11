import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { offsetGamePiece, RED_4INCH_CUBE, RED_4INCH_CUBE_PALLET, HIGH_2INCH_RED_CUBE, LOW_2INCH_RED_CUBE } from '../26botballExplorerSandbox';
import { RotationwUnits, Vector3wUnits } from '../../../../util/math/unitMath';
import { createCubeEndNode, pallet_geom, smallCubeEnd_geom, largeCubeEnd_geom, isCubeOnTopOfScript, getLowestFaceScript, getHighestFaceScript } from './bexCommonComponents';
import Dict from '../../../../util/objectOps/Dict';


const baseScene = createBaseSceneSurface();

const cubesStacked = `

  const highRedCubeFaces = ['hSmallRedCubeTop', 'hSmallRedCubeBottom', 'hSmallRedCubeLeft', 'hSmallRedCubeRight', 'hSmallRedCubeFront', 'hSmallRedCubeBack'];
  const lowRedCubeFaces = ['lSmallRedCubeTop', 'lSmallRedCubeBottom', 'lSmallRedCubeLeft', 'lSmallRedCubeRight', 'lSmallRedCubeFront', 'lSmallRedCubeBack'];
  const largeRedCubeFaces = ['largeRedCubeTop', 'largeRedCubeBottom', 'largeRedCubeLeft', 'largeRedCubeRight', 'largeRedCubeFront', 'largeRedCubeBack'];
  const palletFaces = ['palletTop', 'palletBottom'];

  ${getLowestFaceScript}
  ${getHighestFaceScript}
  ${isCubeOnTopOfScript}
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

  const allCubes = [...smallRedCubes, { id: 'RED_4INCH_CUBE', faces: largeRedCubeFaces }];
  let largeRedCubeOnPallet = true;
  let palletOnLoadingDock = false;
  const activeIntersections = new Set();

  function checkLargeCubeOnPallet() {
    const largeCubeLowestFace = getLowestFace(largeRedCubeFaces);
    const palletHighestFace = getHighestFace(palletFaces);
    if (!largeCubeLowestFace || !palletHighestFace) {
      return;
    }

    const largeCubeLowestY = scene.getNodeWorldCm(largeCubeLowestFace).y;
    const palletHighestY = scene.getNodeWorldCm(palletHighestFace).y;

    const isLargeRedCubeonPallet = largeCubeLowestY > palletHighestY;
    largeRedCubeOnPallet = isLargeRedCubeonPallet;
  }

  function checkPalletOnLoadingDock() {
    const palletHighestFace = getHighestFace(palletFaces);
    const loadingDockTopFace = 'loadingDockTop';
    if (!palletHighestFace || !loadingDockTopFace) {
      return;
    }

    const palletHighestY = scene.getNodeWorldCm(palletHighestFace).y;
    const loadingDockTopY = scene.getNodeWorldCm(loadingDockTopFace).y;

    const isPalletOnLoadingDock = palletHighestY > loadingDockTopY;
    palletOnLoadingDock = isPalletOnLoadingDock;
  }

  function checkLargeCubeAndPalletOnLoadingDock() {
    if(largeRedCubeOnPallet && palletOnLoadingDock){
      scene.setChallengeEventValue('largeCubeAndPalletOnLoadingDock', true);
    }
    else{
      scene.setChallengeEventValue('largeCubeAndPalletOnLoadingDock', false);
    }
  }

 function getCube(cubeId) {
    return allCubes.find(cube => cube.id === cubeId);
  }

  //Bonus true if small red cube is on large red cube and large red cube is on pallet and pallet is on loading dock
  function checkBonus() {
    if(activeIntersections.size > 0 && largeRedCubeOnPallet && palletOnLoadingDock){
      scene.setChallengeEventValue('bonus', true);
    }
    else{
      scene.setChallengeEventValue('bonus', false);
    }
  
  }

  scene.addOnIntersectionListener('RED_4INCH_CUBE', (type, otherNodeId) => {
  const stackCheck = isCubeOnTopOf(otherNodeId, 'RED_4INCH_CUBE');
     if (type === 'start') {
      stackCheck ? activeIntersections.add(otherNodeId) : activeIntersections.delete(otherNodeId);
      
    } else if (type === 'end') {
      activeIntersections.has(otherNodeId) ? activeIntersections.delete(otherNodeId) : null;
    }
    checkBonus();
  }, ['HIGH_2INCH_RED_CUBE', 'LOW_2INCH_RED_CUBE']);

  scene.addOnIntersectionListener('RED_4INCH_CUBE_PALLET', (type, otherNodeId) => {
  if(type === 'start'){
      checkLargeCubeOnPallet();
    }
    else if(type === 'end'){
      largeRedCubeOnPallet = false;  
    }
    checkLargeCubeAndPalletOnLoadingDock();
    checkBonus();
  }, ['RED_4INCH_CUBE']);    

  scene.addOnIntersectionListener('loadingDockTop', (type, otherNodeId) => {
    if(type === 'start'){
      checkPalletOnLoadingDock();
    }
    else if(type === 'end'){
      palletOnLoadingDock = false;  
    }
    checkLargeCubeAndPalletOnLoadingDock();
    checkBonus();
  }, ['RED_4INCH_CUBE_PALLET']);
`;

export const BEX_8: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 8'),
  description: tr('Botball Explorer Mission 8: Deliver the Red Cube'),
  summary: {
    skill: tr('Lifting palletized cubes up onto a platform.'),
    baseMission: tr('The pallet with the Large Red Cube is on top of the Loading Dock.'),
    bonusMission: tr('One or more Small Red Cubes are on top of the Large Red Cube while the pallet is on the Loading Dock.')
  },
  scripts: {
    cubesStacked: Script.ecmaScript('Cubes Stacked', cubesStacked),
  },
  geometry: {
    ...baseScene.geometry,
    smallCubeEnd_geom,
    largeCubeEnd_geom,
    loadingDock_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(10.5),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(27.5),
      },
    },
    pallet_geom,

  },
  nodes: {
    ...baseScene.nodes,
    palletTop: {
      type: 'object',
      parentId: 'RED_4INCH_CUBE_PALLET',
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
      parentId: 'RED_4INCH_CUBE_PALLET',
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
    ...Dict.map({
      RED_4INCH_CUBE_PALLET,
      HIGH_2INCH_RED_CUBE,
      LOW_2INCH_RED_CUBE,
      RED_4INCH_CUBE,
    }, offsetGamePiece),
    hSmallRedCubeTop: createCubeEndNode(tr('High 2-inch Red Cube Top'), 'HIGH_2INCH_RED_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeBottom: createCubeEndNode(tr('High 2-inch Red Cube Bottom'), 'HIGH_2INCH_RED_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeLeft: createCubeEndNode(tr('High 2-inch Red Cube Left'), 'HIGH_2INCH_RED_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeBack: createCubeEndNode(tr('High 2-inch Red Cube Back'), 'HIGH_2INCH_RED_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeFront: createCubeEndNode(tr('High 2-inch Red Cube Front'), 'HIGH_2INCH_RED_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    hSmallRedCubeRight: createCubeEndNode(tr('High 2-inch Red Cube Right'), 'HIGH_2INCH_RED_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),

    lSmallRedCubeTop: createCubeEndNode(tr('Low 2-inch Red Cube Top'), 'LOW_2INCH_RED_CUBE', 'top', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeBottom: createCubeEndNode(tr('Low 2-inch Red Cube Bottom'), 'LOW_2INCH_RED_CUBE', 'bottom', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeLeft: createCubeEndNode(tr('Low 2-inch Red Cube Left'), 'LOW_2INCH_RED_CUBE', 'left', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeBack: createCubeEndNode(tr('Low 2-inch Red Cube Back'), 'LOW_2INCH_RED_CUBE', 'back', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeFront: createCubeEndNode(tr('Low 2-inch Red Cube Front'), 'LOW_2INCH_RED_CUBE', 'front', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),
    lSmallRedCubeRight: createCubeEndNode(tr('Low 2-inch Red Cube Right'), 'LOW_2INCH_RED_CUBE', 'right', 'smallCubeEnd_geom', Color.rgb(255, 0, 0)),

    largeRedCubeTop: createCubeEndNode(tr('4-inch Red Cube Top'), 'RED_4INCH_CUBE', 'top', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeBottom: createCubeEndNode(tr('4-inch Red Cube Bottom'), 'RED_4INCH_CUBE', 'bottom', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeLeft: createCubeEndNode(tr('4-inch Red Cube Left'), 'RED_4INCH_CUBE', 'left', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeBack: createCubeEndNode(tr('4-inch Red Cube Back'), 'RED_4INCH_CUBE', 'back', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeFront: createCubeEndNode(tr('4-inch Red Cube Front'), 'RED_4INCH_CUBE', 'front', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),
    largeRedCubeRight: createCubeEndNode(tr('4-inch Red Cube Right'), 'RED_4INCH_CUBE', 'right', 'largeCubeEnd_geom', Color.rgb(255, 0, 0)),

    loadingDockTop: {
      type: 'object',
      geometryId: 'loadingDock_geom',
      name: tr('Loading Dock Top'),
      origin: {
        position: Vector3wUnits.centimeters(78.708, -9.262, -100.797),
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(126, 2, 163),
        },
      },
    }
  }
};