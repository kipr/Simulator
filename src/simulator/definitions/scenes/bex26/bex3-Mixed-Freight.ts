import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../../util/math/unitMath';
import Node from '../../../../state/State/Scene/Node';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { TOP_YELLOW_2IN_CUBE, LOW_YELLOW_2IN_CUBE, TOP_GREEN_2IN_CUBE, LOW_GREEN_2IN_CUBE } from '../26botballExplorerSandbox';
import LocalizedString from '../../../../util/LocalizedString';

const baseScene = createBaseSceneSurface();


const cubesStacked = `

const topGreenCubeFaces = ['tGreenTop', 'tGreenBottom', 'tGreenLeft', 'tGreenRight', 'tGreenFront', 'tGreenBack'];
const lowGreenCubeFaces = ['lGreenTop', 'lGreenBottom', 'lGreenLeft', 'lGreenRight', 'lGreenFront', 'lGreenBack'];
const topYellowCubeFaces = ['tYellowTop', 'tYellowBottom', 'tYellowLeft', 'tYellowRight', 'tYellowFront', 'tYellowBack'];
const lowYellowCubeFaces = ['lYellowTop', 'lYellowBottom', 'lYellowLeft', 'lYellowRight', 'lYellowFront', 'lYellowBack'];
const greenCubes = [
  {
    id: 'topGreen2InCube',
    faces: topGreenCubeFaces
  },
  {
    id: 'lowGreen2InCube',
    faces: lowGreenCubeFaces
  }
];

const yellowCubes = [
  {
    id: 'topYellow2InCube',
    faces: topYellowCubeFaces
  },
  {
    id: 'lowYellow2InCube',
    faces: lowYellowCubeFaces
  }
];

const activeIntersections = new Set();

function getHighestFace(faces) {
  let highestFace = null;
  let highestY = -Infinity;

  faces.forEach(face => {
    const position = scene.getNodeWorldCm(face);

    if (!position) {
      return;
    }

    if (position.y > highestY) {
      highestY = position.y;
      highestFace = face;
    }
  });

  return highestFace;
}


function getLowestFace(faces) {
  let lowestFace = null;
  let lowestY = Infinity;

  faces.forEach(face => {
    const position = scene.getNodeWorldCm(face);

    if (!position) {
      return;
    }

    if (position.y < lowestY) {
      lowestY = position.y;
      lowestFace = face;
    }
  });

  return lowestFace;
}

let advancedBonusCheck = {hasGreenOnYellow: false, hasYellowOnGreen: false};
function checkStacks() {
  let hasGreenOnYellow = false;
  let hasYellowOnGreen = false;


  greenCubes.forEach(greenCube => {
    yellowCubes.forEach(yellowCube => {

      const greenLowest = getLowestFace(greenCube.faces);

      const greenHighest = getHighestFace(greenCube.faces);

      const yellowLowest = getLowestFace(yellowCube.faces);

      const yellowHighest = getHighestFace(yellowCube.faces);


      if (greenLowest && yellowHighest) {
        const greenOnYellowKey =
          greenLowest + ':' + yellowHighest;

        if (activeIntersections.has(greenOnYellowKey)) {
          hasGreenOnYellow = true;
        }
      }

      if (greenHighest && yellowLowest) {
        /*
         * Notice that the key is still greenFace:yellowFace
         * because that's how activeIntersections is stored.
         */
        const yellowOnGreenKey =
          greenHighest + ':' + yellowLowest;

        if (activeIntersections.has(yellowOnGreenKey)) {
          hasYellowOnGreen = true;
        }
      }

    });
  });

  advancedBonusCheck = {hasGreenOnYellow, hasYellowOnGreen};


  scene.setChallengeEventValue(
    'greenCubeStackedOnYellow',
    hasGreenOnYellow
  );

  scene.setChallengeEventValue(
    'yellowCubeStackedOnGreen',
    hasYellowOnGreen
  );
 
  scene.setChallengeEventValue(
      'bonus',
      activeIntersections.size >= 2
    );
  scene.setChallengeEventValue(
      'advancedBonus',
      advancedBonusCheck.hasGreenOnYellow && advancedBonusCheck.hasYellowOnGreen
    );
}

/*
 * Register every green face against every yellow face.
 */
greenCubes.forEach(greenCube => {

  yellowCubes.forEach(yellowCube => {

    greenCube.faces.forEach(greenFace => {

      yellowCube.faces.forEach(yellowFace => {

        scene.addOnIntersectionListener(
          greenFace,

          (type, otherNodeId) => {

            /*
             * greenFace and yellowFace ARE in scope here.
             */
            const intersectionKey =
              greenFace + ':' + yellowFace;


            if (type === 'start') {

              activeIntersections.add(intersectionKey);

            } else if (type === 'end') {

              activeIntersections.delete(intersectionKey);

            }


            checkStacks();
          },

          yellowFace
        );

      });

    });

  });

});

`;

function nodeFacePosition(side: string): { position: Vector3wUnits, orientation?: RotationwUnits } {
  switch (side) {
    case 'top':
      return { position: Vector3wUnits.centimeters(0, 2.58, 0) };
    case 'bottom':
      return { position: Vector3wUnits.centimeters(0, -2.58, 0) };
    case 'left':
      return { position: Vector3wUnits.centimeters(0, 0, -2.58), orientation: RotationwUnits.eulerDegrees(90, 0, 0) };
    case 'back':
      return { position: Vector3wUnits.centimeters(2.58, 0, 0), orientation: RotationwUnits.eulerDegrees(0, 0, 90) };
    case 'front':
      return { position: Vector3wUnits.centimeters(-2.58, 0, 0), orientation: RotationwUnits.eulerDegrees(0, 0, 90) };
    case 'right':
      return { position: Vector3wUnits.centimeters(0, 0, 2.58), orientation: RotationwUnits.eulerDegrees(90, 0, 0) };
    default:
      throw new Error(`Invalid side name: ${side}`);
  }
}

function createCubeEndNode(name: LocalizedString, parentId: string, side: string, color: Color): Node {
  const { position, orientation } = nodeFacePosition(side);
  return {
    parentId,
    type: 'object',
    geometryId: 'cubeEnd_geom',
    name,
    origin: {
      position,
      orientation,
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color
      },
    },
  };
}

export const BEX_3: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 3'),
  description: tr('Botball Explorer Mission 3: Mixed Freight'),
  scripts: {
    cubesStacked: Script.ecmaScript('Top Green Cube Stacked', cubesStacked),
  },
  geometry: {
    ...baseScene.geometry,
    cubeEnd_geom: {
      type: 'box',
      size: {
        x: Distance.inches(1.8),
        y: Distance.centimeters(0.1),
        z: Distance.inches(1.8)
      }
    }

  },
  nodes: {
    ...baseScene.nodes,
    topGreen2InCube: TOP_GREEN_2IN_CUBE,
    tGreenTop: createCubeEndNode(tr('Top Green Cube Top'), 'topGreen2InCube', 'top', Color.rgb(255, 115, 0)),
    tGreenBottom: createCubeEndNode(tr('Top Green Cube Bottom'), 'topGreen2InCube', 'bottom', Color.rgb(229, 97, 255)),
    tGreenLeft: createCubeEndNode(tr('Top Green Cube Left'), 'topGreen2InCube', 'left', Color.rgb(255, 115, 0)),
    tGreenRight: createCubeEndNode(tr('Top Green Cube Right'), 'topGreen2InCube', 'right', Color.rgb(229, 97, 255)),
    tGreenFront: createCubeEndNode(tr('Top Green Cube Front'), 'topGreen2InCube', 'front', Color.rgb(255, 115, 0)),
    tGreenBack: createCubeEndNode(tr('Top Green Cube Back'), 'topGreen2InCube', 'back', Color.rgb(229, 97, 255)),

    lowGreen2InCube: LOW_GREEN_2IN_CUBE,
    lGreenTop: createCubeEndNode(tr('Low Green Cube Top'), 'lowGreen2InCube', 'top', Color.rgb(255, 115, 0)),
    lGreenBottom: createCubeEndNode(tr('Low Green Cube Bottom'), 'lowGreen2InCube', 'bottom', Color.rgb(229, 97, 255)),
    lGreenLeft: createCubeEndNode(tr('Low Green Cube Left'), 'lowGreen2InCube', 'left', Color.rgb(255, 115, 0)),
    lGreenRight: createCubeEndNode(tr('Low Green Cube Right'), 'lowGreen2InCube', 'right', Color.rgb(229, 97, 255)),
    lGreenFront: createCubeEndNode(tr('Low Green Cube Front'), 'lowGreen2InCube', 'front', Color.rgb(255, 115, 0)),
    lGreenBack: createCubeEndNode(tr('Low Green Cube Back'), 'lowGreen2InCube', 'back', Color.rgb(229, 97, 255)),

    topYellow2InCube: TOP_YELLOW_2IN_CUBE,
    tYellowTop: createCubeEndNode(tr('Top Yellow Cube Top'), 'topYellow2InCube', 'top', Color.rgb(255, 115, 0)),
    tYellowBottom: createCubeEndNode(tr('Top Yellow Cube Bottom'), 'topYellow2InCube', 'bottom', Color.rgb(229, 97, 255)),
    tYellowLeft: createCubeEndNode(tr('Top Yellow Cube Left'), 'topYellow2InCube', 'left', Color.rgb(255, 115, 0)),
    tYellowRight: createCubeEndNode(tr('Top Yellow Cube Right'), 'topYellow2InCube', 'right', Color.rgb(229, 97, 255)),
    tYellowFront: createCubeEndNode(tr('Top Yellow Cube Front'), 'topYellow2InCube', 'front', Color.rgb(255, 115, 0)),
    tYellowBack: createCubeEndNode(tr('Top Yellow Cube Back'), 'topYellow2InCube', 'back', Color.rgb(229, 97, 255)),

    lowYellow2InCube: LOW_YELLOW_2IN_CUBE,
    lYellowTop: createCubeEndNode(tr('Low Yellow Cube Top'), 'lowYellow2InCube', 'top', Color.rgb(255, 115, 0)),
    lYellowBottom: createCubeEndNode(tr('Low Yellow Cube Bottom'), 'lowYellow2InCube', 'bottom', Color.rgb(229, 97, 255)),
    lYellowLeft: createCubeEndNode(tr('Low Yellow Cube Left'), 'lowYellow2InCube', 'left', Color.rgb(255, 115, 0)),
    lYellowRight: createCubeEndNode(tr('Low Yellow Cube Right'), 'lowYellow2InCube', 'right', Color.rgb(229, 97, 255)),
    lYellowFront: createCubeEndNode(tr('Low Yellow Cube Front'), 'lowYellow2InCube', 'front', Color.rgb(255, 115, 0)),
    lYellowBack: createCubeEndNode(tr('Low Yellow Cube Back'), 'lowYellow2InCube', 'back', Color.rgb(229, 97, 255)),

  }
};