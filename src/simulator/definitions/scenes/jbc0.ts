import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceB, createCanNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';

const baseScene = createBaseSceneSurfaceB();

const leftStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
  
}, 'startBox');
`;

const touchingLine = `
// If the robot wheels touch Line B, it fails the challenge

const getYawRotation = (nodeId)=> {
  const node = scene.nodes[nodeId];

  if (!node || !node.origin || !node.origin.orientation) {
    // Return 0 if the node, its origin, or its orientation doesn't exist
    return 0;
  }

  // Extract the quaternion from the node's orientation
  const quaternion = RotationwUnits.toRawQuaternion(node.origin.orientation || EULER_IDENTITY);

  // Calculate yaw (rotation around Y-axis)
  const siny_cosp = 2 * (quaternion.w * quaternion.y + quaternion.x * quaternion.z);
  const cosy_cosp = 1 - 2 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z);
  const yaw = 180 / Math.PI * Math.atan2(siny_cosp, cosy_cosp);

  return yaw;
};

const getWheelXPosition = (nodeId, wheelXDistance) => {
  const node = scene.nodes[nodeId];
  const robotXOrigin = node.startingOrigin.position.x;
  const wheelXOrigin = Distance.add(robotXOrigin, wheelXDistance, 'meters');

  const robotXPosition = node.origin.position.x;
  const yawRad = (getYawRotation(nodeId) + 45) * Math.PI / 180;
  const wheelXPosition = Distance.add(robotXPosition, Distance.centimeters(Distance.toCentimetersValue(wheelXOrigin) * Math.cos(yawRad)), 'centimeters');
  return wheelXPosition;
};

scene.addOnRenderListener(() => {
  const leftWheelXPosition = getWheelXPosition('robot', Distance.centimeters(-7.492));
  const rightWheelXPosition = getWheelXPosition('robot', Distance.centimeters(7.492));
  console.log('Left: ', leftWheelXPosition.value, 'Right: ', rightWheelXPosition.value); 
  const leftWheelTouching = leftWheelXPosition.value > 0.5;
  const rightWheelTouching = rightWheelXPosition.value < -0.5;
  const robotTouchingLine = leftWheelTouching || rightWheelTouching;
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('robotTouchingLine', robotTouchingLine);
  }
});
`;

const reachedEnd = `
// If the robot reaches the end, it completes the challenge

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot reached end!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('reachedEnd', type === 'start');
  }
  
}, 'endBox');
`;

const offMat = `
// If the robot leaves the mat, it fails the challenge
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

export const JBC_0: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 0' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 0: Drive Straight',
  },
  scripts: {
    leftStartBox: Script.ecmaScript('Robot Left Start', leftStartBox),
    touchingLine: Script.ecmaScript('Robot Touching Line', touchingLine),
    reachedEnd: Script.ecmaScript('Robot Reached End', reachedEnd),
    offMat: Script.ecmaScript('Robot Off Mat', offMat),
  },
  geometry: {
    ...baseScene.geometry,
    mainSurface_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(1.77),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
      },
    },
    endBox_geom: {
      type: 'box',
      size: {
        x: Distance.inches(24),
        y: Distance.centimeters(15),
        z: Distance.centimeters(0),
      },
    },
    endOfMat_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
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
    mainSurface: {
      type: 'object',
      geometryId: 'mainSurface_geom',
      name: { [LocalizedString.EN_US]: 'Mat Surface' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 0),
        },
      },
    },
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.89),
          z: Distance.centimeters(0.685),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(0, 0, 255),
        },
      },
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
    endOfMat: {
      type: 'object',
      geometryId: 'endOfMat_geom',
      name: { [LocalizedString.EN_US]: 'End of Mat' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.89),
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
  },
};
