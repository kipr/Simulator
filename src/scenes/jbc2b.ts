import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';
import { Color } from "../state/State/Scene/Color";
import { Distance } from "../util";
import Script from "../state/State/Scene/Script";


const baseScene = createBaseSceneSurfaceA();

const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When the can (can10) is intersecting circle10, the circle glows

scene.addOnIntersectionListener('can10', (type, otherNodeId) => {
  console.log('Can 10 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can10Intersects', visible);
  setNodeVisible('circle10', visible);
}, 'circle10');

// When the can (can11) is intersecting circle11, the circle glows

scene.addOnIntersectionListener('can11', (type, otherNodeId) => {
  console.log('Can 11 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can11Intersects', visible);
  setNodeVisible('circle11', visible);
}, 'circle11');


// When the can (can12) is intersecting circle12, the circle glows

scene.addOnIntersectionListener('can12', (type, otherNodeId) => {
  console.log('Can 12 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can12Intersects', visible);
  setNodeVisible('circle12', visible);
}, 'circle12');
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
    console.log(nodeId + 'touched!', otherNodeId, point);
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

// let startTime = Date.now();
const EULER_IDENTITY = Rotation.Euler.identity();
// const startingOrientationInv = (nodeId) => Quaternion.inverse(Rotation.toRawQuaternion(scene.nodes[nodeId].startingOrigin.orientation || EULER_IDENTITY));
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));


scene.addOnRenderListener(() => {
  // const currTime = Date.now();
  // const timeDiff = currTime - startTime;
  const upright10 = yAngle('can10') < 5;
  const upright11 = yAngle('can11') < 5;
  const upright12 = yAngle('can12') < 5;
  // if(timeDiff > 1000) {
  //   console.log('can6 angle: ', yAngle('can6'));
  //   startTime = currTime;
  // }
  scene.setChallengeEventValue('can10Upright', upright10);
  scene.setChallengeEventValue('can11Upright', upright11);
  scene.setChallengeEventValue('can12Upright', upright12);
});
`;

export const JBC_2B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 2B' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 2B: Ring Around the Can, Sr.' },
  scripts: {
    circleIntersects: Script.ecmaScript("Circle Intersects", circleIntersects),
    uprightCans: Script.ecmaScript("Upright Cans", uprightCans),
    robotTouches: Script.ecmaScript("Robot Touches", robotTouches),
    passedSide: Script.ecmaScript("Passed Side", passedSide),
    leftStartBox: Script.ecmaScript("Robot Left Start", leftStartBox),
    enterStartBox: Script.ecmaScript("Robot Reentered Start", enterStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    circle10_geom: {
      type: "cylinder",
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle11_geom: {
      type: "cylinder",
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle12_geom: {
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
        x: Distance.centimeters(30),
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
    circle10: {
      type: "object",
      geometryId: "circle10_geom",
      name: { [LocalizedString.EN_US]: "Circle 10" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(19.3),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(96.9),
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
    circle11: {
      type: "object",
      geometryId: "circle11_geom",
      name: { [LocalizedString.EN_US]: "Circle 11" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(106.6),
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
    circle12: {
      type: "object",
      geometryId: "circle12_geom",
      name: { [LocalizedString.EN_US]: "Circle 12" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-19.2),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(96.9),
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
          x: Distance.centimeters(-50),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(96.9),
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
          x: Distance.centimeters(50),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(96.9),
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

    ...baseScene.nodes,
    'can10': {...createCanNode(10), scriptIds: ["robotTouches"]},
    'can11': {...createCanNode(11), scriptIds: ["robotTouches"]},
    'can12': {...createCanNode(12), scriptIds: ["robotTouches"]},
  }
};