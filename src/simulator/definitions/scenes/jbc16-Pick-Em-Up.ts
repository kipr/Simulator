import Scene from '../../../state/State/Scene';
import { Distance, Angle } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCanNode, createCircleNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const canIntersectsGarage = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When the can (can2) is intersecting the green garage, the garage glows
scene.addOnIntersectionListener('can2', (type, otherNodeId) => {
  const visible = type === 'start';
  scene.setChallengeEventValue('can2Intersects', visible);
  setNodeVisible('greenGarage', visible);
}, 'greenGarage');

// When the can (can9) is intersecting the blue garage, the garage glows
scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  const visible = type === 'start';
  scene.setChallengeEventValue('can9Intersects', visible);
  setNodeVisible('blueGarage', visible);
}, 'blueGarage');

scene.addOnIntersectionListener('can10', (type, otherNodeId) => {
  const visible = type === 'start';
  scene.setChallengeEventValue('can10Intersects', visible);
  setNodeVisible('yellowGarage', visible);
}, 'yellowGarage');
`;

const uprightCans = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));

scene.addOnRenderListener(() => {
  const upright2 = yAngle('can2') > 5;
  scene.setChallengeEventValue('can2Upright', upright2);
});
scene.addOnRenderListener(() => {
  const upright9 = yAngle('can9') > 5;
  scene.setChallengeEventValue('can9Upright', upright9);
});
scene.addOnRenderListener(() => {
  const upright10 = yAngle('can10') > 5;
  scene.setChallengeEventValue('can10Upright', upright10);
});
`;

const pickUpCan = `
// When can2 ends intersecting matA, the can is picked up
scene.addOnIntersectionListener('matA', (type, otherNodeId) => {
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('can2PickedUp', type === 'end');
  }
}, 'can2');

// When can9 ends intersecting matA, the can is picked up
scene.addOnIntersectionListener('matA', (type, otherNodeId) => {
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('can9PickedUp', type === 'end');
  }
}, 'can9');

// When can10 ends intersecting matA, the can is picked up
scene.addOnIntersectionListener('matA', (type, otherNodeId) => {
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('can10PickedUp', type === 'end');
  }
}, 'can10');
`;

export const JBC_16: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 16' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 16: Pick 'Em Up`,
  },
  scripts: {
    notInStartBox: Script.ecmaScript('Not In Start Box', notInStartBox),
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    canIntersectsGarage: Script.ecmaScript('Can Intersects Garage', canIntersectsGarage),
    pickUpCan: Script.ecmaScript('Pick Up Can', pickUpCan),
  },
  geometry: {
    ...baseScene.geometry,
    notStartBox_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
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
  },
  nodes: {
    ...baseScene.nodes,
    notStartBox: {
      type: "object",
      geometryId: "notStartBox_geom",
      name: { [LocalizedString.EN_US]: "Not Start Box" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-1.9),
          z: Distance.meters(1.208),
        },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(255, 0, 0),
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
    circle2: createCircleNode(2),
    circle9: createCircleNode(9),
    circle10: createCircleNode(10),
    can2: createCanNode(2),
    can9: createCanNode(9),
    can10: createCanNode(10),
  },
};
