import Scene from '../../../state/State/Scene';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceB } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';

const baseScene = createBaseSceneSurfaceB();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const inStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot started in start box!', type, otherNodeId, scene.programStatus);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('inStartBox', true);
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
  // console.log('Robot touching line!', type, otherNodeId);
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
  // console.log('Robot reached end!', type, otherNodeId);
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
  // console.log('Robot off mat!', type, otherNodeId);
  const visible = type === 'start';
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('offMat', visible);
    setNodeVisible('endOfMat', visible);
  }
}, 'endOfMat');
`;

export const JBC_0: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 0' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 0: Drive Straight',
  },
  scripts: {
    notInStartBox: Script.ecmaScript("Not In Start Box", notInStartBox),
    inStartBox: Script.ecmaScript("In Start Box", inStartBox),
    touchingLine: Script.ecmaScript('Robot Touching Line', touchingLine),
    reachedEnd: Script.ecmaScript('Robot Reached End', reachedEnd),
    offMat: Script.ecmaScript('Robot Off Mat', offMat),
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
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(16),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(10),
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
    notStartBox: {
      type: "object",
      geometryId: "notStartBox_geom",
      name: { [LocalizedString.EN_US]: "Not Start Box" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-1.9),
          z: Distance.meters(1.223),
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
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.89),
          z: Distance.centimeters(10.685),
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
      name: { [LocalizedString.EN_US]: 'Line B' },
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
  },
};
