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

// When the can (can4) is intersecting circle4, the circle glows

scene.addOnIntersectionListener('can4', (type, otherNodeId) => {
  console.log('Can 4 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can4Intersects', visible);
  setNodeVisible('circle4', visible);
}, 'circle4');

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
    
    //Sets values for second crossing in the middle
    if(count == 2 && (otherNodeId == "n1")){ 
      count++;
      position = 3;
      console.log(count + ":" + otherNodeId + ":" + type);
    }
    if(type==="start" && (otherNodeId == "n" +position)){
      count++;
      console.log(count + ":" + otherNodeId + ":" + type);
     
    }

    //Passed three checkmarks and recently passed the middle checkmark
    if(count == 3 && otherNodeId == "n1"){
      scene.setChallengeEventValue('figureEight', true);
    }
    else{
      scene.setChallengeEventValue('figureEight', false);
    }
  
    if(position == 0 ){
      count = 0;
    }
    
    
  }, ['startBox', 'n1', 'n2']);
};

`;
const uprightCans = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = Rotation.Euler.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));

scene.addOnRenderListener(() => {
 
  const upright4 = yAngle('can4') < 5;
  const upright9 = yAngle('can9') < 5;
  
  scene.setChallengeEventValue('can4Upright', upright4);
  scene.setChallengeEventValue('can9Upright', upright9);
});
`;

export const JBC_4: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: "JBC 4" },
  description: {
    [LocalizedString.EN_US]: "Junior Botball Challenge 4: Figure Eight",
  },
  scripts: {
    circleIntersects: Script.ecmaScript("Circle Intersects", circleIntersects),
    uprightCans: Script.ecmaScript("Upright Cans", uprightCans),
    passedSide: Script.ecmaScript("Passed Side", passedSide),
    leftStartBox: Script.ecmaScript("Robot Left Start", leftStartBox),
    enterStartBox: Script.ecmaScript("Robot Reentered Start", enterStartBox),
  },

  geometry: {
    ...baseScene.geometry,
    circle4_geom: {
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

    leftCan4_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(150),
        y: Distance.centimeters(1),
        z: Distance.centimeters(5),
      },
    },
    middle_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(-1),
        y: Distance.centimeters(-8),
        z: Distance.centimeters(30),
      },
    },
    rightCan9_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(150),
        y: Distance.centimeters(1),
        z: Distance.centimeters(5),
      },
    },
    topCan9_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(-1),
        y: Distance.centimeters(-8),
        z: Distance.centimeters(50),
      },
    },
    rightCan4_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(150),
        y: Distance.centimeters(1),
        z: Distance.centimeters(5),
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
    circle4: {
      type: "object",
      geometryId: "circle4_geom",
      name: { [LocalizedString.EN_US]: "Circle 4" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(42.7),
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
    n1: {
      type: "object",
      geometryId: "middle_geom",
      name: { [LocalizedString.EN_US]: "Between cans 4 and 9" },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(70),
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
      geometryId: "topCan9_geom",
      name: { [LocalizedString.EN_US]: "Top side of can 9" },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(115),
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

    
    can4: { ...createCanNode(4) },
    can9: { ...createCanNode(9), scriptIds: ["passedSide"] },
  },
};
