import Scene from "../state/State/Scene";
import LocalizedString from "../util/LocalizedString";
import Script from "../state/State/Scene/Script";
import { createCanNode, createBaseSceneSurfaceA } from "./jbcBase";
import { Color } from "../state/State/Scene/Color";
import { Distance } from "../util";

const baseScene = createBaseSceneSurfaceA();
const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When the can (can5) is intersecting circle4, the circle glows

scene.addOnIntersectionListener('can5', (type, otherNodeId) => {
  console.log('Can 5 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can5Intersects', visible);
  setNodeVisible('circle5', visible);
}, 'circle5');
// When the can (can8) is intersecting circle4, the circle glows

scene.addOnIntersectionListener('can8', (type, otherNodeId) => {
  console.log('Can 8 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can8Intersects', visible);
  setNodeVisible('circle8', visible);
}, 'circle8');

// When the can (can9) is intersecting circle9, the circle glows

scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  console.log('Can 9 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can9Intersects', visible);
  setNodeVisible('circle9', visible);
}, 'circle9');

`;

const leftStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
  
}, 'startBox');
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

let count = 0;
let position = 0;
scene.onBind = nodeId => {
  
  scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
   
    if(otherNodeId == "startBox"){
      count = 0;
      position = 0;
    }

    if(type === "start"){
      position++;
      console.log(count + ":" + otherNodeId + ":" + type + ":Position:" +position );
    }
    
   
    if(type==="start" && (otherNodeId == "n" +position)){
      count++;
      console.log(count + ":" + otherNodeId + ":" + type);
     
    }

    if(count == 2 && otherNodeId == "n2"){
      scene.setChallengeEventValue('clockwise8', true);
    }
    else if (count == 4 && otherNodeId == "n4"){
      scene.setChallengeEventValue('counterClockwise5', true);
    }
    else if(count == 6 && otherNodeId == "n6"){
      scene.setChallengeEventValue('counterClockwise9', true);
    }
    if(position == 0 ){
      count = 0;
    }
    
    
  }, ['startBox', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6']);
};

`;
const uprightCans = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = Rotation.Euler.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));

scene.addOnRenderListener(() => {
 
  const upright5 = yAngle('can5') < 5;
  const upright8 = yAngle('can8') < 5;
  const upright9 = yAngle('can9') < 5;
  
  scene.setChallengeEventValue('can5Upright', upright5);
  scene.setChallengeEventValue('can8Upright', upright8);
  scene.setChallengeEventValue('can9Upright', upright9);
});
`;
export const JBC_4B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 4B' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 4B: Barrel Racing' },
  scripts: {
    circleIntersects: Script.ecmaScript("Circle Intersects", circleIntersects),
    uprightCans: Script.ecmaScript("Upright Cans", uprightCans),
    passedSide: Script.ecmaScript("Passed Side", passedSide),
    leftStartBox: Script.ecmaScript("Robot Left Start", leftStartBox),
    enterStartBox: Script.ecmaScript("Robot Reentered Start", enterStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    circle5_geom: {
      type: "cylinder",
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle8_geom: {
      type: "cylinder",
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle9_geom: {
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
    rightCan8_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(80),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(0.1),
      },
    },
    leftCan8_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(5),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(20),
      },
    },
    topCan5_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(30),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(0.1),
      },
    },
    leftCan5_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(80),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(0.1),
      },
    },
    topCan9_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(0.1),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(1),
      },
    },
    leftCan9_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(0.1),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(1),
      },
    },
  },

  nodes: {
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
    circle5: {
      type: "object",
      geometryId: "circle5_geom",
      name: { [LocalizedString.EN_US]: "Circle 5" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(14.3),
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
    circle8: {
      type: "object",
      geometryId: "circle8_geom",
      name: { [LocalizedString.EN_US]: "Circle 8" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-26),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(65.5),
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
    circle9: {
      type: "object",
      geometryId: "circle9_geom",
      name: { [LocalizedString.EN_US]: "Circle 9" },
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
    n2: {
      type: "object",
      geometryId: "leftCan8_geom",
      name: { [LocalizedString.EN_US]: "Can 8" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-37),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(43),
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
    n1: {
      type: "object",
      geometryId: "rightCan8_geom",
      name: { [LocalizedString.EN_US]: "Can 8" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-80),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(65.5),
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
    n3: {
      type: "object",
      geometryId: "topCan5_geom",
      name: { [LocalizedString.EN_US]: "Can 5" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(75),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(67.7),
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
    n4: {
      type: "object",
      geometryId: "leftCan5_geom",
      name: { [LocalizedString.EN_US]: "Can 5" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(75),
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
    n5: {
      type: "object",
      geometryId: "topCan9_geom",
      name: { [LocalizedString.EN_US]: "Can 9" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(110),
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
    n6: {
      type: "object",
      geometryId: "leftCan9_geom",
      name: { [LocalizedString.EN_US]: "Can 9" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(8),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(110),
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
    can5: { ...createCanNode(5), scriptIds: ["passedSide"] },
    can8: createCanNode(8),
    can9: createCanNode(9),
  }
};