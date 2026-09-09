import LocalizedString from "../../../../util/LocalizedString";
import { RotationwUnits, Vector3wUnits } from "../../../../util/math/unitMath";
import Node from '../../../../state/State/Scene/Node';
import { Color } from '../../../../state/State/Scene/Color';
import { Distance } from '../../../../util';
import Geometry from "../../../../state/State/Scene/Geometry";
import tr from '@i18n';
import Dict from '../../../../util/objectOps/Dict';


/*************** 
    Scripts
****************/
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
    console.log("isCubeONTopOfScript: ", lowestPosition.y>highestPosition.y);
    return lowestPosition.y > highestPosition.y;
  }
`;

/*************** 
    FUNCTIONS
****************/

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

/*************** 
    GEOMETRIES
****************/
export const BLACK_LINE_GEOMETRY: Geometry = {
  type: 'box',
  size: {
    x: Distance.centimeters(4.5),
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

export const pallet_geom: Geometry = {
  type: 'box',
  size: {
    x: Distance.inches(3.8),
    y: Distance.centimeters(0.1),
    z: Distance.inches(3.8),
  },
}

export const loadingZone_geom: Geometry = {
  type: 'box',
  size: {
    x: Distance.centimeters(57),
    y: Distance.centimeters(0.1),
    z: Distance.centimeters(43)
  },
}

export const startBox_geom: Geometry = {
  type: 'box',
  size: {
    x: Distance.centimeters(45),
    y: Distance.centimeters(0.1),
    z: Distance.centimeters(32),
  },
}

/*************** 
      NODES
****************/
export const startBoxA: Node = {
  type: 'object',
  geometryId: 'startBox_geom',
  name: tr('Start Box A'),
  visible: true,
  editable: true,
  origin: {
    position: {
      x: Distance.centimeters(4.134),
      y: Distance.centimeters(-15.504),
      z: Distance.centimeters(-91.2),
    },
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  },
  material: {
    type: 'basic',
    color: {
      type: 'color3',
      color: Color.rgb(0, 0, 255),
    },
  },
}

export const startBoxB: Node = {
  type: 'object',
  geometryId: 'startBox_geom',
  name: tr('Start Box B'),
  visible: true,
  editable: true,
  origin: {
    position: {
      x: Distance.centimeters(4.08),
      y: Distance.centimeters(-15),
      z: Distance.centimeters(60.955),
    },
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  },
  material: {
    type: 'basic',
    color: {
      type: 'color3',
      color: Color.rgb(0, 0, 255),
    },
  },
}

export const loadingZone: Node = {
  type: 'object',
  geometryId: 'loadingZone_geom',
  name: tr('Loading Zone'),
  origin: {
    position: {
      x: Distance.meters(0.053),
      y: Distance.meters(-0.156),
      z: Distance.centimeters(110.441)
    },
    orientation: RotationwUnits.eulerDegrees(0, 90, 0),

  },
  material: {
    type: 'basic',
    color: {
      type: 'color3',
      color: Color.rgb(84, 228, 132),
    },
  },
}


export const blackLineNodes: Dict<Node> = {
  blackLine1: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 1'),
    origin: {
      position: {
        x: Distance.centimeters(29.46),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(0.133),
      },
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(233, 255, 33),
      },
    },
  },
  blackLine2: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 2'),
    origin: {
      position: {
        x: Distance.centimeters(61.619),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(0.29),
      },
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(53, 255, 221),
      },
    },
  },
  blackLine3: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 3'),
    origin: {
      position: {
        x: Distance.centimeters(-12.1),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(-0.725),
      },
      orientation: RotationwUnits.eulerDegrees(0, 90, 0),
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(22, 87, 207),
      },
    },
  },
  blackLine4: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 4'),
    origin: {
      position: {
        x: Distance.centimeters(-5.46),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(0.428),
      },
      orientation: RotationwUnits.eulerDegrees(0, 90, 0),
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(203, 228, 62),
      },
    },
  },
  blackLine5: {
    type: 'object',
    geometryId: 'BLACK_LINE_GEOMETRY',
    name: tr('Black Line 5'),
    origin: {
      position: {
        x: Distance.centimeters(-5.46),
        y: Distance.centimeters(-14.4),
        z: Distance.meters(0.794),
      },
      orientation: RotationwUnits.eulerDegrees(0, 90, 0),
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(11, 161, 104),
      },
    },
  }

}