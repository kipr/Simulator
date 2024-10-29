import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits } from '../../../util/math/unitMath';
import { Distance, Angle } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { canPositions, createBaseSceneSurfaceA, createBaseSceneSurfaceB, createCanNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import Robot from 'state/State/Robot';
import Node from 'state/State/Scene/Node';

const baseScene = createBaseSceneSurfaceA();



const leftStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
  
}, 'startBox');
`;


const canIntersectsGarage = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});


// When the can (can2) is intersecting the green garage, the garage glows
scene.addOnIntersectionListener('can2', (type, otherNodeId) => {
  console.log('Can 2 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can2Intersects', visible);
  setNodeVisible('greenGarage', visible);
}, 'greenGarage');

// When the can (can9) is intersecting the blue garage, the garage glows
scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  console.log('Can 9 intersects blue!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can9Intersects', visible);
  setNodeVisible('blueGarage', visible);
}, 'blueGarage');




scene.addOnIntersectionListener('can10', (type, otherNodeId) => {
  console.log('Can 10 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can10Intersects', visible);
  setNodeVisible('yellowGarage', visible);
}, 'yellowGarage');


`;


const uprightCans = `
// When a can is standing upright, the upright condition is met.

// let startTime = Date.now();
const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
// const startingOrientationInv = (nodeId) => Quaternion.inverse(RotationwUnits.toRawQuaternion(scene.nodes[nodeId].startingOrigin.orientation || EULER_IDENTITY));
const yAngle = (nodeId) => -180 / Math.PI * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));


scene.addOnRenderListener(() => {
  const upright2 = yAngle('can2') > 5;
  //console.log('can2 angle: ', yAngle('can2'));
  scene.setChallengeEventValue('can2Upright', upright2);

});
scene.addOnRenderListener(() => {
  const upright9 = yAngle('can9') > 5;
  // console.log('can9 angle: ', yAngle('can9'));
  scene.setChallengeEventValue('can9Upright', upright9);

});
scene.addOnRenderListener(() => {
  const upright10 = yAngle('can10') > 5;
  // console.log('can10 angle: ', yAngle('can10'));
  scene.setChallengeEventValue('can10Upright', upright10);

});
`;



const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,

  },
};

export const JBC_16: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 16' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 16: Pick 'Em Up`,
  },
  scripts: {
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    canIntersectsGarage: Script.ecmaScript('Can Intersects Garage', canIntersectsGarage),
    leftStartBox: Script.ecmaScript('Left Start Box', leftStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    circle_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    notStartBox_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(59),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
      },
    },
    greenGarage_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(23),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(23),
      },
    },
    yellowGarage_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(19),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(19),
      },
    },
    blueGarage_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(20.5),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(21),
      },
    },


    endBox_geom: {
      type: 'box',
      size: {
        x: Distance.inches(24),
        y: Distance.centimeters(15),
        z: Distance.centimeters(1),
      },
    },

  },
  nodes: {
    ...baseScene.nodes,
    robot: {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN,
    },
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.89),
          z: Distance.centimeters(0.6),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 255),
        },
      },
    },
    greenGarage: {
      type: 'object',
      geometryId: 'greenGarage_geom',
      name: { [LocalizedString.EN_US]: 'Green Garage' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0.1),
          y: Distance.centimeters(-6.89),
          z: Distance.centimeters(53),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 255, 0),
        },
      },
    },
    yellowGarage: {
      type: 'object',
      geometryId: 'yellowGarage_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18.8),
          y: Distance.centimeters(-6.89),
          z: Distance.centimeters(78.2),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },

    blueGarage: {
      type: 'object',
      geometryId: 'blueGarage_geom',
      name: { [LocalizedString.EN_US]: 'Blue Garage' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-12.6),
          y: Distance.centimeters(-6.89),
          z: Distance.centimeters(94.1),
        },
        orientation: {
          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(45),
          z: Angle.degrees(0),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 255),
        },
      },
      editable: true,

    },

    endBox: {
      type: 'object',
      geometryId: 'endBox_geom',
      name: { [LocalizedString.EN_US]: 'End Box' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(0),
          z: Distance.inches(43.685), // 24 for half the mat and 19.685 for the mat's origin
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(0, 255, 0),
        },
      },
    },

    circle2: {
      type: 'object',
      geometryId: 'circle_geom',
      name: { [LocalizedString.EN_US]: 'Circle 2' },
      visible: true,
      origin: {
        position: {
          ...canPositions[1],
          y: Distance.centimeters(-6.9),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(25, 29, 95),
        },

      },
    },

    circle9: {
      type: 'object',
      geometryId: 'circle_geom',
      name: { [LocalizedString.EN_US]: 'Circle 9' },
      visible: true,
      origin: {
        position: {
          ...canPositions[8],
          y: Distance.centimeters(-6.9),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(25, 29, 95),
        },

      },
    },

    circle10: {
      type: 'object',
      geometryId: 'circle_geom',
      name: { [LocalizedString.EN_US]: 'Circle 10' },
      visible: true,
      origin: {
        position: {
          ...canPositions[9],
          y: Distance.centimeters(-6.9),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(25, 29, 95),
        },

      },
    },


    can2: {
      ...createCanNode(2, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(28.8) }),
    },

    can9: {
      ...createCanNode(9, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(85.4) }, true),
    },
    can10: {
      ...createCanNode(10, { x: Distance.centimeters(19.3), y: Distance.centimeters(0), z: Distance.centimeters(96.9) }, false),
    }
  },
};
