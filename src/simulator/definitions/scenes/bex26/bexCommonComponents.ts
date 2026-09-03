import LocalizedString from "../../../../util/LocalizedString";
import { RotationwUnits, Vector3wUnits } from "../../../../util/math/unitMath";
import Node from '../../../../state/State/Scene/Node';
import { Color } from '../../../../state/State/Scene/Color';
import { Distance } from '../../../../util';
import Geometry from "../../../../state/State/Scene/Geometry";
import tr from '@i18n';
import Dict from '../../../../util/objectOps/Dict';

//Scripts
export const getLowestFaceScript = `
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
`;

export const getHighestFaceScript = `
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
`;

export const isCubeOnTopOfScript =
  `
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
`;

function nodeFacePosition(side: string, geometryId: string): { position: Vector3wUnits, orientation?: RotationwUnits } {
  let position: Vector3wUnits;
  let orientation: RotationwUnits | undefined;


  switch (side) {
    case 'top':

      geometryId === 'smallCubeEnd_geom' ? position = Vector3wUnits.centimeters(0, 2.45, 0) : position = Vector3wUnits.centimeters(0, 5.01, 0);
      break;
    case 'bottom':
      geometryId === 'smallCubeEnd_geom' ? position = Vector3wUnits.centimeters(0, -2.45, 0) : position = Vector3wUnits.centimeters(0, -5.01, 0);
      break;
    case 'left':
      if (geometryId === 'smallCubeEnd_geom') {
        position = Vector3wUnits.centimeters(0, 0, -2.45);
        orientation = RotationwUnits.eulerDegrees(90, 0, 0);
      } else {
        position = Vector3wUnits.centimeters(0, 0, -5.01);
        orientation = RotationwUnits.eulerDegrees(90, 0, 0);
      }
      break;
    case 'back':
      if (geometryId === 'smallCubeEnd_geom') {
        position = Vector3wUnits.centimeters(2.45, 0, 0);
        orientation = RotationwUnits.eulerDegrees(0, 0, 90);
      } else {
        position = Vector3wUnits.centimeters(5.01, 0, 0);
        orientation = RotationwUnits.eulerDegrees(0, 0, 90);
      }
      break;
    case 'front':
      if (geometryId === 'smallCubeEnd_geom') {
        position = Vector3wUnits.centimeters(-2.45, 0, 0);
        orientation = RotationwUnits.eulerDegrees(0, 0, 90);
      } else {
        position = Vector3wUnits.centimeters(-5.01, 0, 0);
        orientation = RotationwUnits.eulerDegrees(0, 0, 90);
      }
      break;
    case 'right':
      if (geometryId === 'smallCubeEnd_geom') {
        position = Vector3wUnits.centimeters(0, 0, 2.45);
        orientation = RotationwUnits.eulerDegrees(90, 0, 0);
      } else {
        position = Vector3wUnits.centimeters(0, 0, 5.01);
        orientation = RotationwUnits.eulerDegrees(90, 0, 0);
      }
      break;
    default:
      throw new Error(`Invalid side name: ${side}`);
  }

  return { position, orientation };
}

export function createCubeEndNode(name: LocalizedString, parentId: string, side: string, geometryId: string, color: Color): Node {
  const { position, orientation } = nodeFacePosition(side, geometryId);
  return {
    parentId,
    type: 'object',
    geometryId,
    name,
    startingOrigin: {
      position,
      orientation
    },
    visible: true,
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

export const BLACK_LINE_GEOMETRY: Geometry = {
  type: 'box',
  size: {
    x: Distance.centimeters(3.5),
    y: Distance.centimeters(12),
    z: Distance.meters(3),
  }
};

export const smallCubeEnd_geom: Geometry = {
  type: 'box',
  size: {
    x: Distance.inches(1.8),
    y: Distance.centimeters(0.1),
    z: Distance.inches(1.8)
  }
};

export const largeCubeEnd_geom: Geometry = {
  type: 'box',
  size: {
    x: Distance.inches(3.8),
    y: Distance.centimeters(0.1),
    z: Distance.inches(3.8)
  }
};
export const blackLineNodes: Dict<Node> = {
  blackLine1: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 1'),
    visible: true,
    origin: {
      position: {
        x: Distance.centimeters(-27.1),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(0.878),
      },
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(126, 2, 163),
      },
    },
  },
  blackLine2: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 2'),
    visible: true,
    origin: {
      position: {
        x: Distance.centimeters(88.34),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(0.878),
      },
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(126, 2, 163),
      },
    },
  },
  blackLine3: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 3'),
    visible: true,
    origin: {
      position: {
        x: Distance.centimeters(-63.6),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(0.222),
      },
      orientation: RotationwUnits.eulerDegrees(0, 0, 0),
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(126, 2, 163),
      },
    },
  },
  blackLine4: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 4'),
    visible: true,
    origin: {
      position: {
        x: Distance.centimeters(-5.46),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(0.189),
      },
      orientation: RotationwUnits.eulerDegrees(0, 90, 0),
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(2, 85, 163),
      },
    },
  },
  blackLine5: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 5'),
    visible: true,
    origin: {
      position: {
        x: Distance.centimeters(-5.46),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(0.517),
      },
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