import Scene from "../state/State/Scene";
import LocalizedString from "../util/LocalizedString";
import Script from "../state/State/Scene/Script";
import { createCanNode, createBaseSceneSurfaceA } from "./jbcBase";
import { Color } from "../state/State/Scene/Color";
import { Distance } from "../util";
import { SharedRegistersRobot } from "../SharedRegistersRobot";

const baseScene = createBaseSceneSurfaceA();

const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When the can (can6) is intersecting circle6, the circle glows

scene.addOnIntersectionListener('can6', (type, otherNodeId) => {
  console.log('Can 6 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can6Intersects', visible);
  setNodeVisible('circle6', visible);
}, 'circle6');

`;

const leftStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
  
}, 'startBox');
`;
const robotTouches = `
scene.onBind = nodeId => {
  scene.addOnCollisionListener(nodeId, (otherNodeId, point)=> {
    console.log('Can 6 touched!', otherNodeId, point);
    scene.setChallengeEventValue(nodeId + 'Touched', true);
  }, 'robot');
};
`;
const enterStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('returnStartBox', type === 'start');
  }
}, 'startBox');
`;

const passedSide = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  switch(otherNodeId){
    case 'rightSideCan':
      console.log('Robot passed the right side of the can!', type, otherNodeId);
      if(scene.programStatus === 'running'){
        scene.setChallengeEventValue('rightSide', type === 'start');
      }
      break;
    case 'topSideCan':
      console.log('Robot passed the top side of the can!', type, otherNodeId);
      if(scene.programStatus === 'running'){
        scene.setChallengeEventValue('topSide', type === 'start');
      }
      break;
    case 'leftSideCan':
      console.log('Robot passed the left side of the can!', type, otherNodeId);
      if(scene.programStatus === 'running'){
        scene.setChallengeEventValue('leftSide', type === 'start');
      }
      break;
  }
}, ['rightSideCan', 'topSideCan', 'leftSideCan']);

`;
const uprightCans = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = Rotation.Euler.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));

scene.addOnRenderListener(() => {

  const upright6 = yAngle('can6') < 5;
  scene.setChallengeEventValue('can6Upright', upright6);

});
`;

const goingBackwards = `
scene.addOnRenderListener(() => {

  if(scene.nodes['robot'].state.motors[0].direction === 1 && scene.nodes['robot'].state.motors[3].direction === 1){
    scene.setChallengeEventValue('driveBackwards', false);
  }
  else {
    scene.setChallengeEventValue('driveBackwards', true);
  }
});`;



export const JBC_2C: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: "JBC 2C" },
  description: {
    [LocalizedString.EN_US]: "Junior Botball Challenge 2C: Back It Up",
  },
  scripts: {
    circleIntersects: Script.ecmaScript("Circle Intersects", circleIntersects),
    goingBackwards: Script.ecmaScript("Going Backwards", goingBackwards),
    uprightCans: Script.ecmaScript("Upright Cans", uprightCans),
    robotTouches: Script.ecmaScript("Robot Touches", robotTouches),
    passedSide: Script.ecmaScript("Passed Side", passedSide),
    leftStartBox: Script.ecmaScript("Robot Left Start", leftStartBox),
    enterStartBox: Script.ecmaScript("Robot Reentered Start", enterStartBox),
  },

  geometry: {
    ...baseScene.geometry,
    circle6_geom: {
      type: "cylinder",
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    mainSurface_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
    startBox_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(0),
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
    mainSurface: {
      type: "object",
      geometryId: "mainSurface_geom",
      name: { [LocalizedString.EN_US]: "Mat Surface" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(0, 0, 0),
        },
      },
    },
    circle6: {
      type: "object",
      geometryId: "circle6_geom",
      name: { [LocalizedString.EN_US]: "Circle 6" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(57.2),
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

    can6: {
      ...createCanNode(6, {
        x: Distance.centimeters(0),
        y: Distance.centimeters(0),
        z: Distance.centimeters(57),
      }),
      scriptIds: ["robotTouches"],
    },
  },
};
