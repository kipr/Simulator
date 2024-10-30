import Scene from "../../../state/State/Scene";
import LocalizedString from '../../../util/LocalizedString';
import Script from "../../../state/State/Scene/Script";
import { createCanNode, createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import { Color } from "../../../state/State/Scene/Color";
import { Distance } from "../../../util";

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When the can (can6) is intersecting circle6, the circle glows

scene.addOnIntersectionListener('can6', (type, otherNodeId) => {
  // console.log('Can 6 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can6Intersects', visible);
  setNodeVisible('circle6', visible);
}, 'circle6');

`;

const enterStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('returnStartBox', type === 'start');
  }
}, 'startBox');
`;

const passedSide = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  switch(otherNodeId){
    case 'rightSideCan':
      // console.log('Robot passed the right side of the can!', type, otherNodeId);
      if(scene.programStatus === 'running'){
        scene.setChallengeEventValue('rightSide', type === 'start');
      }
      break;
    case 'topSideCan':
      // console.log('Robot passed the top side of the can!', type, otherNodeId);
      if(scene.programStatus === 'running'){
        scene.setChallengeEventValue('topSide', type === 'start');
      }
      break;
    case 'leftSideCan':
      // console.log('Robot passed the left side of the can!', type, otherNodeId);
      if(scene.programStatus === 'running'){
        scene.setChallengeEventValue('leftSide', type === 'start');
      }
      break;
  }
}, ['rightSideCan', 'topSideCan', 'leftSideCan']);

`;

const uprightCans = `
const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));


scene.addOnRenderListener(() => {
  const upright6 = yAngle('can6') > 5;
  scene.setChallengeEventValue('can6Upright', upright6);
});
`;

export const JBC_2: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: "JBC 2" },
  description: {
    [LocalizedString.EN_US]: "Junior Botball Challenge 2: Ring Around the Can",
  },
  scripts: {
    notInStartBox: Script.ecmaScript("Not in Start Box", notInStartBox),
    circleIntersects: Script.ecmaScript("Circle Intersects", circleIntersects),
    uprightCans: Script.ecmaScript("Upright Cans", uprightCans),
    passedSide: Script.ecmaScript("Passed Side", passedSide),
    enterStartBox: Script.ecmaScript("Robot Reentered Start", enterStartBox),
  },

  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(0),
      },
    },
    notStartBox_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
    rightSideCan_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(30),
        y: Distance.centimeters(0.1),
        z: Distance.meters(0.05),
      },
    },
    topSideCan_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(0.01),
        y: Distance.centimeters(0.1),
        z: Distance.meters(1.77),
      },
    },
    leftSideCan_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(50),
        y: Distance.centimeters(0.1),
        z: Distance.meters(0.05),
      },
    },
  },

  nodes: {
    ...baseScene.nodes,
    startBox: {
      type: "object",
      geometryId: "startBox_geom",
      name: { [LocalizedString.EN_US]: "Start Box" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(0),
        },
      },
      material: {
        type: "pbr",
        emissive: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },
    },
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
    rightSideCan: {
      type: "object",
      geometryId: "rightSideCan_geom",
      name: { [LocalizedString.EN_US]: "Right Side Can" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-20),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(56.9),
        },
      },
      material: {
        type: "pbr",
        emissive: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    topSideCan: {
      type: "object",
      geometryId: "topSideCan_geom",
      name: { [LocalizedString.EN_US]: "Top Side Can" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(85.4),
        },
      },
      material: {
        type: "pbr",
        emissive: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    leftSideCan: {
      type: "object",
      geometryId: "leftSideCan_geom",
      name: { [LocalizedString.EN_US]: "Left Side Can" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(52),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(56.9),
        },
      },
      material: {
        type: "pbr",
        emissive: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    can6: createCanNode(6),
    circle6: createCircleNode(6),
  },
};