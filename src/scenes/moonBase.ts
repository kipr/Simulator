import { ReferenceFrame, Rotation, Vector3 } from "../unit-math";
import { Angle, Distance, Mass } from "../util";
import Node from "../state/State/Scene/Node";
import Camera from "../state/State/Scene/Camera";
import Scene from "../state/State/Scene";
import AbstractRobot from '../AbstractRobot';
import LocalizedString from '../util/LocalizedString';
import Author from '../db/Author';
import { Color } from "../state/State/Scene/Color";
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import tr from '@i18n';
import { sprintf } from 'sprintf-js';
import Dict from '../Dict';

const ROBOT_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(0, 20, 0),
  orientation: Rotation.eulerDegrees(0, 0, 0),
};

const CONTAINER_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-20),
    y: Distance.inches(0),
    z: Distance.centimeters(100),
  },
  scale: {
    x: 15,
    y: 15,
    z: 15,
  },
  orientation: {
    type: 'euler',
    x: Angle.degrees(0),
    y: Angle.degrees(180),
    z: Angle.degrees(0),
  }
};

const BOTGUY_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-20),
    y: Distance.inches(0),
    z: Distance.centimeters(30),
  },
  scale: {
    x: 25,
    y: 25,
    z: 25,
  }
};

const SOLARPANEL_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(50),
    y: Distance.inches(0),
    z: Distance.centimeters(-35),
  },
  scale: {
    x: 4,
    y: 4,
    z: 4,
  }
};

const WALKWAY_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(50),
    y: Distance.inches(0),
    z: Distance.centimeters(65),
  },
  scale: {
    x: 8,
    y: 8,
    z: 8,
  }
};

const COMMSTOWER_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(80),
    y: Distance.inches(0),
    z: Distance.centimeters(0),
  },
  scale: {
    x: 4,
    y: 4,
    z: 4,
  }
};

const HABITAT_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.inches(0),
    z: Distance.centimeters(60),
  },
  scale: {
    x: 4,
    y: 4,
    z: 4,
  },
  orientation: {
    type: 'euler',
    x: Angle.degrees(0),
    y: Angle.degrees(90),
    z: Angle.degrees(0),
  }
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

const GROUND_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-.1),
    z: Distance.centimeters(50),
  },
  orientation: {
    type: 'euler',
    x: Angle.degrees(90),
    y: Angle.degrees(0),
    z: Angle.degrees(0),
  }
};

const START_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(0),
    z: Distance.centimeters(0),
  },
  orientation: {
    type: 'euler',
    x: Angle.degrees(0),
    y: Angle.degrees(90),
    z: Angle.degrees(0),
  }
};

const SCIENCEPAD_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(50),
    y: Distance.inches(.5),
    z: Distance.centimeters(100),
  },
  orientation: {
    type: 'euler',
    x: Angle.degrees(0),
    y: Angle.degrees(90),
    z: Angle.degrees(0),
  }
};

const SKY_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-7.2 - 10),
    z: Distance.centimeters(50),
  },
  orientation: {
    type: 'euler',
    x: Angle.degrees(90),
    y: Angle.degrees(0),
    z: Angle.degrees(0),
  }
};

const LIGHT_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.meters(0),
    y: Distance.meters(40.91),
    z: Distance.meters(0.5),
  },
};


export function createBaseSceneSurface(): Scene {
  return {
    name: tr('Base Scene - Moon Surface'),
    description: tr('A base scene. Intended to be augmented to create full Moon scenes'),
    author: Author.organization('kipr'),
    geometry: {
      'moon ground': {
        type: 'box',
        size: {
          x: Distance.meters(5),
          y: Distance.meters(5),
          z: Distance.centimeters(.2),
        },
      },
      'sky': {
        type: 'box',
        size: {
          x: Distance.meters(15),
          y: Distance.meters(15),
          z: Distance.meters(15),
        }
      },
      'start': {
        type: 'box',
        size: {
          x: Distance.feet(2),
          y: Distance.centimeters(.21),
          z: Distance.feet(2),
        }
      },
      'science pad': {
        type: 'box',
        size: {
          x: Distance.feet(1),
          y: Distance.inches(1),
          z: Distance.feet(1),
        }
      },
    },
    nodes: {
      'robot': ROBOT,
      'container': {
        type: 'from-space-template',
        templateId: 'container',
        name: tr('Container'),
        startingOrigin: CONTAINER_ORIGIN,
        origin: CONTAINER_ORIGIN,
        editable: true,
        visible: true,
        material: {
          type: 'basic',
          color: {
            type: "texture",
            uri: "Moon Rock Collection"
          },
          // text: "This is the Container."
        },
      },
      // 'botguy': {
      //   type: 'from-space-template',
      //   templateId: 'botguy',
      //   name: tr('botguy'),
      //   startingOrigin: BOTGUY_ORIGIN,
      //   origin: BOTGUY_ORIGIN,
      //   visible: true,
      //   editable: true,
      // },
      'solarpanel': {
        type: 'from-space-template',
        templateId: 'solarpanel',
        name: tr('Solar Panel'),
        startingOrigin: SOLARPANEL_ORIGIN,
        origin: SOLARPANEL_ORIGIN,
        visible: true,
        editable: true,
      },
      // 'walkway': {
      //   type: 'from-space-template',
      //   templateId: 'walkway',
      //   name: tr('walkway'),
      //   startingOrigin: WALKWAY_ORIGIN,
      //   origin: WALKWAY_ORIGIN,
      //   visible: true,
      //   editable: true,
      // },
      // 'commstower': {
      //   type: 'from-space-template',
      //   templateId: 'commstower',
      //   name: tr('Comms Tower'),
      //   startingOrigin: COMMSTOWER_ORIGIN,
      //   origin: COMMSTOWER_ORIGIN,
      //   visible: true,
      //   editable: true,
      // },
      // 'habitat': {
      //   type: 'from-space-template',
      //   templateId: 'habitat',
      //   name: tr('Human Habitat'),
      //   startingOrigin: HABITAT_ORIGIN,
      //   origin: HABITAT_ORIGIN,
      //   visible: true,
      //   editable: true,
      // },
      'Moon ground': {
        type: 'object',
        geometryId: 'moon ground',
        name: tr('Ground'),
        startingOrigin: GROUND_ORIGIN,
        origin: GROUND_ORIGIN,
        visible: true,
        physics: {
          type: 'box',
          restitution: 1,
          friction: 1,
        },
        material: {
          type: 'basic',
          color: {
            type: "texture",
            uri: "/static/textures/Moon-2d-Surface.png"
          },
        },
      },      
      'start': {
        type: 'object',
        geometryId: 'start',
        name: tr('Start Area'),
        startingOrigin: START_ORIGIN,
        origin: START_ORIGIN,
        visible: true,
        editable: true,
        physics: {
          type: 'box',
          restitution: 1,
          friction: 1,
        },
        material: {
          type: 'basic',
          color: {
            type: "texture",
            uri: "/static/textures/mat-with-border.png"
          },
        },
      },
      // 'science pad': {
      //   type: 'object',
      //   geometryId: 'science pad',
      //   name: tr('Science Pad'),
      //   startingOrigin: SCIENCEPAD_ORIGIN,
      //   origin: SCIENCEPAD_ORIGIN,
      //   visible: true,
      //   editable: true,
      //   physics: {
      //     type: 'box',
      //     restitution: 1,
      //     friction: 1,
      //   },
      //   material: {
      //     type: 'basic',
      //     color: {
      //       type: "texture",
      //       uri: "/static/textures/science_pad.png"
      //     },
      //   },
      // },

      'light0': {
        type: 'point-light',
        intensity: .25,
        name: tr('Light'),
        startingOrigin: LIGHT_ORIGIN,
        origin: LIGHT_ORIGIN,
        visible: true
      },
      'night_sky': {
        type: 'object',
        name: tr('skybox'),
        geometryId: 'sky',
        visible: true,
        startingOrigin: SKY_ORIGIN,
        origin: SKY_ORIGIN,
        material: {
          type: 'basic',
          color: {
            type: "texture",
            uri: "/static/textures/earthrise.png"
          },
        },
      }
    },
    camera: Camera.arcRotate({
      radius: Distance.meters(5),
      target: {
        x: Distance.meters(0),
        y: Distance.meters(0),
        z: Distance.meters(0.05),
      },
      position: {
        x: Distance.meters(-1),
        y: Distance.meters(0.51),
        z: Distance.meters(-1.5),
      }
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8 * .17),
      z: Distance.meters(0),
    }
  };
}

