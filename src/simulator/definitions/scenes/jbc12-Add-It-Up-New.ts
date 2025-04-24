import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { canPositions, createBaseSceneSurfaceA, createBaseSceneSurfaceB, createCanNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import Robot from 'state/State/Robot';
import Node from 'state/State/Scene/Node';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot not in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const robotTouchCircle = `
scene.addOnIntersectionListener('circle1', (type, otherNodeId) => {
  console.log('arm touched circle 1!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('robotTouchCircle1', true);
  }
}, 'arm_link');
`;

const inStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('inStartBox', type === 'start');
  }
}, 'startBox');
`;

const touchingLine = `
// If the robot wheels touch Line B, it fails the challenge

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot touching line!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('robotTouchingLine', type === 'start');
    setNodeVisible('lineB', true);
  }
}, 'lineB');
`;

const reachedEnd = `
// If the robot reaches the end, it completes the challenge

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot reached end!', type, otherNodeId);
  const visible = type === 'start';
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('reachedEnd', visible);
    setNodeVisible('endBox', visible);
  }
}, 'endBox');
`;

const offMat = `
// If the robot leaves the mat, it fails the challenge

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot off mat!', type, otherNodeId);
  const visible = type === 'start';
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('offMat', visible);
    setNodeVisible('endOfMat', visible);
  }
}, 'endOfMat');
`;

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
  },
};

export const JBC_12: Scene = {
  ...baseScene,
  name: tr('JBC 12'),
  description: tr('Junior Botball Challenge 12: Add it Up'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not In Start Box', notInStartBox),
    inStartBox: Script.ecmaScript('In Start Box', inStartBox),
    touchingLine: Script.ecmaScript('Robot Touching Line', touchingLine),
    reachedEnd: Script.ecmaScript('Robot Reached End', reachedEnd),
    offMat: Script.ecmaScript('Robot Off Mat', offMat),
    robotTouchCircle: Script.ecmaScript('Robot Touch Circle', robotTouchCircle),
  },
  geometry: {
    ...baseScene.geometry,
    circle_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },

    notStartBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(30),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
      },
    },
    lineB_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(0.5),
        y: Distance.centimeters(0.1),
        z: Distance.inches(48),
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
    endOfMat_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(4),
        z: Distance.inches(24),
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

    notStartBox: {
      type: 'object',
      geometryId: 'notStartBox_geom',
      name: tr('Not Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-1.9),
          z: Distance.meters(1.223),
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
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.89),
          z: Distance.centimeters(0.685),
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
    lineB: {
      type: 'object',
      geometryId: 'lineB_geom',
      name: tr('Line B'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-0.5),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.685), // 24 for half the mat and 19.685 for the mat's origin
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },
    endBox: {
      type: 'object',
      geometryId: 'endBox_geom',
      name: tr('End Box'),
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
    endOfMat: {
      type: 'object',
      geometryId: 'endOfMat_geom',
      name: tr('End of Mat'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-4.90),
          z: Distance.inches(59.2),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },
    circle1: {
      type: 'object',
      geometryId: 'circle_geom',
      name: tr('Circle 1'),
      visible: true,
      origin: {
        position: {
          ...canPositions[0],
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
      scriptIds: ['robotTouchCircle'],
    },
  },
};
