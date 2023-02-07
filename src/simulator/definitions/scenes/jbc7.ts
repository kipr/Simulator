import Scene from "../../../state/State/Scene";
import LocalizedString from "../../../util/LocalizedString";
import Script from "../../../state/State/Scene/Script";
import tr from '@i18n';

import { createCanNode, createBaseSceneSurfaceA } from "./jbcBase";
import { Color } from "../../../state/State/Scene/Color";
import { Distance } from "../../../util";
import Expr from "../../../state/State/Challenge/Expr";

const baseScene = createBaseSceneSurfaceA();

const startBoxIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

let count = 0;
scene.onBind = nodeId => {
  
  scene.addOnIntersectionListener(nodeId, (type, otherNodeId) => {
    //count++;
    //console.log(count);
    
  
    if(type === 'start'){
      console.log(nodeId + " entered start box!");
      count++; 
    }
  
    else if (count != 0 && type === "end"){
      console.log(nodeId + " left start box :(");
      count--;
    }
    else if (count > 3){
      count = 0;
    }

    switch (count){
      case 0:
        scene.setChallengeEventValue('canAIntersects', false);
        scene.setChallengeEventValue('canBIntersects', false);
        scene.setChallengeEventValue('canCIntersects', false);
      break;
      case 1:
        scene.setChallengeEventValue('canAIntersects', true);
        scene.setChallengeEventValue('canBIntersects', false);
        scene.setChallengeEventValue('canCIntersects', false);
      break;
      case 2:
        scene.setChallengeEventValue('canAIntersects', true);
        scene.setChallengeEventValue('canBIntersects', true);
        scene.setChallengeEventValue('canCIntersects', false);
      break;
      case 3:
        scene.setChallengeEventValue('canAIntersects', true);
        scene.setChallengeEventValue('canBIntersects', true);
        scene.setChallengeEventValue('canCIntersects', true);
      break;

    }
    console.log("Intersecting Count: " + count + " (" +nodeId + ")");
  }, 'startBox');


};
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

const uprightCans = `

let count = 0;
console.log("Beginning Upright Count: " + count);
scene.onBind = nodeId => {
  
  
  scene.addOnIntersectionListener(nodeId, (type, otherNodeId) => {
    const EULER_IDENTITY = Rotation.Euler.identity();
  const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));
  const upright = yAngle(nodeId) < 5;
  
    
    if(upright && type === "start"){
      count++;
    }
    else if(upright && (count != 0) && type === "end"){
      count--;
    }
    else if(!upright && (count != 0) && type === "start"){
      count--;
    }
    switch (count){
      case 0:
        scene.setChallengeEventValue('canAUpright', false);
        scene.setChallengeEventValue('canBUpright', false);
        scene.setChallengeEventValue('canCUpright', false);
      break;
      case 1:
        scene.setChallengeEventValue('canAUpright', true);
        scene.setChallengeEventValue('canBUpright', false);
        scene.setChallengeEventValue('canCUpright', false);
      break;
      case 2:
        scene.setChallengeEventValue('canAUpright', true);
        scene.setChallengeEventValue('canBUpright', true);
        scene.setChallengeEventValue('canCUpright', false);
      break;
      case 3:
        scene.setChallengeEventValue('canAUpright', true);
        scene.setChallengeEventValue('canBUpright', true);
        scene.setChallengeEventValue('canCUpright', true);
      break;

    }
    console.log("Upright Count: " + count + " (" +nodeId + ")");
    

   
  }, 'startBox');
};
`;

export const JBC_7: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: "JBC 7" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 7: Bulldozer Mania`,
  },
  scripts: {
    startBoxIntersects: Script.ecmaScript(
      "Start Box Intersects",
      startBoxIntersects
    ),
    uprightCans: Script.ecmaScript("Upright Cans", uprightCans),
    leftStartBox: Script.ecmaScript("Robot Left Start", leftStartBox),
    enterStartBox: Script.ecmaScript("Robot Reentered Start", enterStartBox),
  },
  geometry: {
    ...baseScene.geometry,
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
        z: Distance.centimeters(30),
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
          z: Distance.centimeters(-3),
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
    can1: {
      ...createCanNode(1),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can2: {
      ...createCanNode(2),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can3: {
      ...createCanNode(3),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can4: {
      ...createCanNode(4),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can5: {
      ...createCanNode(5),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can6: {
      ...createCanNode(6),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can7: {
      ...createCanNode(7),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can8: {
      ...createCanNode(8),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can9: {
      ...createCanNode(9),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can10: {
      ...createCanNode(10),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can11: {
      ...createCanNode(11),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
    can12: {
      ...createCanNode(12),
      scriptIds: ["startBoxIntersects", "uprightCans"],
    },
  },
};
