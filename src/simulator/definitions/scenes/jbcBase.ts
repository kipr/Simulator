import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Node from '../../../state/State/Scene/Node';
import Camera from '../../../state/State/Scene/Camera';
import Scene from '../../../state/State/Scene';
import { Color } from '../../../state/State/Scene/Color';
import AbstractRobot from '../../../programming/AbstractRobot';
import Author from '../../../db/Author';
import { PhysicsMotionType } from '@babylonjs/core';
import Geometry from '../../../state/State/Scene/Geometry';

import tr from '@i18n';
import { sprintf } from 'sprintf-js';
import Dict from '../../../util/objectOps/Dict';

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, 0, 0),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
};

const ROBOT: Node.Robot = {
  type: 'robot',
  name: tr('Robot'),
  robotId: 'demobot',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  startingOrigin: ROBOT_ORIGIN,
  origin: ROBOT_ORIGIN
};

/** Helper function to create a wall geometry for the base scene (N,S).
 * x, y, z parameters are the dimensions of the wall.
*/
export function wall1(x: number, y: number, z: number): Geometry {
  return {
    type: 'box',
    size: {
      x: Distance.meters(x),
      y: Distance.meters(y),
      z: Distance.centimeters(z),
    },
  };
}

/** Helper function to create a wall geometry for the base scene (E,W).
 * x, y, z parameters are the dimensions of the wall.
*/
export function wall2(x: number, y: number, z: number): Geometry {
  return {
    type: 'box',
    size: {
      x: Distance.centimeters(x),
      y: Distance.meters(y),
      z: Distance.meters(z),
    },
  };
}

/** Helper function to create a wall origin for the base scene. */
export function wallOrigin(x: number, y: number, z: number, orientation?: RotationwUnits): ReferenceFramewUnits {
  return {
    position: {
      x: Distance.centimeters(x),
      y: Distance.centimeters(y),
      z: Distance.centimeters(z),
    },
    orientation: orientation ? orientation : RotationwUnits.eulerDegrees(0, 0, 0),
  };
}

/** Helper function to create a wall property for the base scene */
export function wallBase(id: string, name: string, origin: ReferenceFramewUnits): Node {
  return {
    type: 'object',
    geometryId: id,
    name: tr(name),
    startingOrigin: origin,
    origin: origin,
    visible: true,
    physics: {
      type: 'box',
      motionType: PhysicsMotionType.STATIC,
      restitution: .3,
      friction: 1,
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(193, 195, 195),
      },
    },
  };
}

export function wallImg(id: string, name: string, origin: ReferenceFramewUnits, uri: string): Node {
  return {
    type: 'object',
    geometryId: id,
    name: tr(name),
    startingOrigin: origin,
    origin: origin,
    visible: true,
    physics: {
      type: 'box',
      motionType: PhysicsMotionType.STATIC,
      restitution: .3,
      friction: 1,
    },
    material: {
      type: 'basic',
      color: {
        type: 'texture',
        uri,
      },
    },
  };
}

export const JBC_MAT_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-7),
    z: Distance.centimeters(50),
  },
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

const GROUND_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-7.512),
    z: Distance.centimeters(50),
  },
};

const BANNER_NORTH_ORIGIN = wallOrigin(0, 18, 631.3);
const BANNER_NORTH_IMG1_ORIGIN = wallOrigin(387, 18, 630.5, RotationwUnits.eulerDegrees(0, 0, 180));
const BANNER_NORTH_IMG2_ORIGIN = wallOrigin(0, 18, 630.5, RotationwUnits.eulerDegrees(0, 0, 180));
const BANNER_NORTH_IMG3_ORIGIN = wallOrigin(-387, 18, 630.5, RotationwUnits.eulerDegrees(0, 0, 180));

const BANNER_SOUTH_ORIGIN = wallOrigin(0, 18, -531.3);
const BANNER_SOUTH_IMG1_ORIGIN = wallOrigin(387, 18, -530.5);
const BANNER_SOUTH_IMG2_ORIGIN = wallOrigin(0, 18, -530.5);
const BANNER_SOUTH_IMG3_ORIGIN = wallOrigin(-387, 18, -530.5);

const BANNER_WEST_ORIGIN = wallOrigin(581.3, 18, 50);
const BANNER_WEST_IMG1_ORIGIN = wallOrigin(580.5, 18, 50, RotationwUnits.eulerDegrees(90, 0, 0));
const BANNER_WEST_IMG2_ORIGIN = wallOrigin(580.5, 18, 437, RotationwUnits.eulerDegrees(90, 0, 0));
const BANNER_WEST_IMG3_ORIGIN = wallOrigin(580.5, 18, -337, RotationwUnits.eulerDegrees(90, 0, 0));

const BANNER_EAST_ORIGIN = wallOrigin(-581.3, 18, 50);
const BANNER_EAST_IMG1_ORIGIN = wallOrigin(-580.5, 18, 50, RotationwUnits.eulerDegrees(-90, 0, 0));
const BANNER_EAST_IMG2_ORIGIN = wallOrigin(-580.5, 18, 437, RotationwUnits.eulerDegrees(-90, 0, 0));
const BANNER_EAST_IMG3_ORIGIN = wallOrigin(-580.5, 18, -337, RotationwUnits.eulerDegrees(-90, 0, 0));



const LIGHT_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.meters(0),
    y: Distance.meters(0.91),
    z: Distance.meters(0.5),
  },
};

export function createBaseSceneSurfaceA(): Scene {
  return {
    name: tr('Base Scene - Surface A'),
    description: tr('A base scene using Surface A. Intended to be augmented to create full JBC scenes'),
    author: Author.organization('kipr'),
    geometry: {
      'ground': {
        type: 'box',
        size: {
          x: Distance.meters(11.62), // OG 3.54
          y: Distance.meters(0.01),
          z: Distance.meters(11.62), // OG 3.54 
        },
      },
      'mat': {
        type: 'box',
        size: {
          x: Distance.feet(2),
          y: Distance.centimeters(.1),
          z: Distance.feet(4),
        }
      },
      // Divide by 3 = 3.87 // OG x:11.62, y:0.5, z:1
      'bannerN': wall1(11.62, 0.5, 0.7),
      'bannerImgN1': wall1(3.87, 0.5, 1),
      'bannerImgN2': wall1(3.87, 0.5, 1),
      'bannerImgN3': wall1(3.87, 0.5, 1),

      'bannerS': wall1(11.62, 0.5, 0.7),
      'bannerImgS1': wall1(3.87, 0.5, 1),
      'bannerImgS2': wall1(3.87, 0.5, 1),
      'bannerImgS3': wall1(3.87, 0.5, 1),

      'bannerW': wall2(0.7, 0.5, 11.62),
      'bannerImgW1': wall2(1, 3.87, 0.5),
      'bannerImgW2': wall2(1, 3.87, 0.5),
      'bannerImgW3': wall2(1, 3.87, 0.5),

      'bannerE': wall2(0.7, 0.5, 11.62),
      'bannerImgE1': wall2(1, 3.87, 0.5),
      'bannerImgE2': wall2(1, 3.87, 0.5),
      'bannerImgE3': wall2(1, 3.87, 0.5),


    },
    nodes: {
      'robot': ROBOT,
      'ground': {
        type: 'object',
        geometryId: 'ground',
        name: tr('Ground'),
        startingOrigin: GROUND_ORIGIN,
        origin: GROUND_ORIGIN,
        visible: true,
        physics: {
          type: 'box',
          motionType: PhysicsMotionType.STATIC,
          restitution: .3,
          friction: 1,
        },
        material: {
          type: 'basic',
          color: {
            type: 'color3',
            color: Color.rgb(192, 192, 192),
          },
        },
      },

      'bannerN': wallBase('bannerN', 'BannerN', BANNER_NORTH_ORIGIN),
      'bannerImgN1': wallImg('bannerImgN1', 'BannerImgN1', BANNER_NORTH_IMG1_ORIGIN, '/static/Banner logos/botguy logo.png'),
      'bannerImgN2': wallImg('bannerImgN2', 'BannerImgN2', BANNER_NORTH_IMG2_ORIGIN, '/static/Banner logos/botball.png'),
      'bannerImgN3': wallImg('bannerImgN3', 'BannerImgN3', BANNER_NORTH_IMG3_ORIGIN, '/static/Banner logos/language.png'),

      'bannerS': wallBase('bannerS', 'BannerS', BANNER_SOUTH_ORIGIN),
      'bannerImgS1': wallImg('bannerImgS1', 'BannerImgS1', BANNER_SOUTH_IMG1_ORIGIN, '/static/Banner logos/language.png'),
      'bannerImgS2': wallImg('bannerImgS2', 'BannerImgS2', BANNER_SOUTH_IMG2_ORIGIN, '/static/Banner logos/botball.png'),
      'bannerImgS3': wallImg('bannerImgS3', 'BannerImgS3', BANNER_SOUTH_IMG3_ORIGIN, '/static/Banner logos/GCER.png'),

      'bannerW': wallBase('bannerW', 'BannerW', BANNER_WEST_ORIGIN),
      'bannerImgW1': wallImg('bannerImgW1', 'BannerImgW1', BANNER_WEST_IMG1_ORIGIN, '/static/Banner logos/Sponsors.png'),
      'bannerImgW2': wallImg('bannerImgW2', 'BannerImgW2', BANNER_WEST_IMG2_ORIGIN, '/static/Banner logos/GCER.png'),
      'bannerImgW3': wallImg('bannerImgW3', 'BannerImgW3', BANNER_WEST_IMG3_ORIGIN, '/static/Banner logos/botguy logo.png'),

      'bannerE': wallBase('bannerE', 'BannerE', BANNER_EAST_ORIGIN),
      'bannerImgE1': wallImg('bannerImgE1', 'BannerImgE1', BANNER_EAST_IMG1_ORIGIN, '/static/Banner logos/GCER.png'),
      'bannerImgE2': wallImg('bannerImgE2', 'BannerImgE2', BANNER_EAST_IMG2_ORIGIN, '/static/Banner logos/Sponsors.png'),
      'bannerImgE3': wallImg('bannerImgE3', 'BannerImgE3', BANNER_EAST_IMG3_ORIGIN, '/static/Banner logos/botguy logo.png'),

      'light0': {
        type: 'point-light',
        intensity: 0.75,
        name: tr('Light'),
        startingOrigin: LIGHT_ORIGIN,
        origin: LIGHT_ORIGIN,
        visible: true
      },
      'matA': {
        type: 'from-jbc-template',
        templateId: 'matA',
        name: tr('JBC Mat A'),
        startingOrigin: JBC_MAT_ORIGIN,
        origin: JBC_MAT_ORIGIN,
        visible: true,
        editable: false,
      },
    },
    camera: Camera.arcRotate({
      radius: Distance.meters(1),
      target: {
        x: Distance.meters(0),
        y: Distance.meters(0),
        z: Distance.meters(0.25),
      },
      position: {
        x: Distance.meters(0.5),
        y: Distance.meters(0.5),
        z: Distance.meters(-.5),
      }
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8 * 0.4),
      z: Distance.meters(0),
    }
  };
}

export function createBaseSceneSurfaceB(): Scene {


  return {
    name: tr('Base Scene - Surface B'),
    description: tr('A base scene using Surface B. Intended to be augmented to create full JBC scenes'),
    author: Author.organization('kipr'),
    geometry: {
      'ground': {
        type: 'box',
        size: {
          x: Distance.meters(3.54),
          y: Distance.meters(0.01),
          z: Distance.meters(3.54),
        },
      },
    },
    nodes: {
      'robot': ROBOT,
      'matB': {
        type: 'from-jbc-template',
        templateId: 'matB',
        name: tr('JBC Mat B'),
        startingOrigin: JBC_MAT_ORIGIN,
        origin: JBC_MAT_ORIGIN,
        visible: true,
        editable: false,
      },
      'ground': {
        type: 'object',
        geometryId: 'ground',
        name: tr('Ground'),
        startingOrigin: GROUND_ORIGIN,
        origin: GROUND_ORIGIN,
        visible: true,
        physics: {
          type: 'box',
          motionType: PhysicsMotionType.STATIC,
          restitution: .3,
          friction: 1,
        },
        material: {
          type: 'basic',
          color: {
            type: 'color3',
            color: Color.rgb(192, 192, 192),
          },
        },
      },
      'light0': {
        type: 'point-light',
        intensity: 0.75,
        name: tr('Light'),
        startingOrigin: LIGHT_ORIGIN,
        origin: LIGHT_ORIGIN,
        visible: true
      },
    },
    camera: Camera.arcRotate({
      radius: Distance.meters(2),
      target: {
        x: Distance.meters(0),
        y: Distance.meters(0),
        z: Distance.meters(0.5),
      },
      position: {
        x: Distance.meters(1),
        y: Distance.meters(0.91),
        z: Distance.meters(1.5),
      }
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8 * .4),
      z: Distance.meters(0),
    }
  };
}

/**
 * Helper function to create a Node for a can
 * @param canNumber The 1-index can number
 * @param canPosition The position of the can. If not provided, the position is determined using canNumber
 * @param editable Whether the can is editable
 * @param visible Whether the can is visible
 * @returns A can Node that can be inserted into a Scene
 */
export function createCanNode(canNumber: number, canPosition?: Vector3wUnits, editable?: boolean, visible?: boolean): Node {
  const origin: ReferenceFramewUnits = {
    position: canPosition ?? canPositions[canNumber - 1],
  };

  return {
    type: 'from-jbc-template',
    templateId: 'can',
    name: Dict.map(tr('Can %s'), (str: string) => sprintf(str, canNumber)),
    startingOrigin: origin,
    origin,
    editable: editable ?? false,
    visible: visible ?? true,
  };
}

/**
 * Helper function to create a Node for a circle
 * @param circleNumber The 1-index circle number
 * @param circlePosition The position of the circle. If not provided, the position is determined using circleNumber
 * @param editable Whether the circle is editable
 * @param visible Whether the circle is visible
 * @returns A circle Node that can be inserted into a Scene
 */
export function createCircleNode(circleNumber: number, circlePosition?: Vector3wUnits, editable?: boolean, visible?: boolean): Node {
  const position: Vector3wUnits = {
    x: canPositions[circleNumber - 1].x,
    y: Distance.centimeters(-6.9),
    z: canPositions[circleNumber - 1].z
  };

  const origin: ReferenceFramewUnits = {
    position: circlePosition ?? position,
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  };

  return {
    type: 'from-jbc-template',
    templateId: 'circle',
    name: Dict.map(tr('Circle %s'), (str: string) => sprintf(str, circleNumber)),
    startingOrigin: origin,
    origin,
    editable: editable ?? false,
    visible: visible ?? false,
  };
}

/**
 * Positions of cans 1 - 12, based on the circles on JBC Surface A
 */
export const canPositions: Vector3wUnits[] = [
  {
    x: Distance.centimeters(22.7), // can 1
    y: Distance.centimeters(0),
    z: Distance.centimeters(35.2),
  },
  {
    x: Distance.centimeters(0), // can 2
    y: Distance.centimeters(0),
    z: Distance.centimeters(28.8),
  },
  {
    x: Distance.centimeters(-16.2), // can 3
    y: Distance.centimeters(0),
    z: Distance.centimeters(25.7),
  },
  {
    x: Distance.centimeters(0), // can 4
    y: Distance.centimeters(0),
    z: Distance.centimeters(42.7),
  },
  {
    x: Distance.centimeters(14.3), // can 5
    y: Distance.centimeters(0),
    z: Distance.centimeters(56.9),
  },
  {
    x: Distance.centimeters(0), // can 6
    y: Distance.centimeters(0),
    z: Distance.centimeters(57.2),
  },
  {
    x: Distance.centimeters(-13.8), // can 7
    y: Distance.centimeters(0),
    z: Distance.centimeters(56.9),
  },
  {
    x: Distance.centimeters(-26), // can 8
    y: Distance.centimeters(0),
    z: Distance.centimeters(65.5),
  },
  {
    x: Distance.centimeters(0), // can 9
    y: Distance.centimeters(0),
    z: Distance.centimeters(85.4),
  },
  {
    x: Distance.centimeters(19.3),// can 10
    y: Distance.centimeters(0),
    z: Distance.centimeters(96.9),
  },
  {
    x: Distance.centimeters(0), // can 11
    y: Distance.centimeters(0),
    z: Distance.centimeters(106.6),
  },
  {
    x: Distance.centimeters(-19.2), // can 12
    y: Distance.centimeters(0),
    z: Distance.centimeters(96.9),
  },
];
