import Scene from "../../../state/State/Scene";
import LocalizedString from "../../../util/LocalizedString";
import Script from "../../../state/State/Scene/Script";
import { createCanNode, createBaseSceneSurfaceA } from "./jbcBase";
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

const uprightStartBoxCans = `
let count = 0;
const cans = ['can1', 'can2', 'can3', 'can4', 'can5', 'can6', 'can7', 'can8', 'can9', 'can10', 'can11', 'can12'];

const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));

scene.addOnRenderListener(() => {
  if(scene.programStatus !== 'running'){
    count = 0;
  }
});
  
scene.addOnIntersectionListener('startBox', (type, otherNodeId) => {
  if(scene.programStatus === 'running'){
    if(upright && type === "start"){
      count++;
    }
    else if(upright && (count != 0) && type === "end"){
      count--;
    }
    else if(!upright && (count != 0) && type === "start"){
      count--;
    }

    scene.setChallengeEventValue('canAUpright', count > 0);
    scene.setChallengeEventValue('canBUpright', count > 1);
    scene.setChallengeEventValue('canCUpright', count > 2);
    scene.setChallengeEventValue('canDUpright', count > 3);
    scene.setChallengeEventValue('canEUpright', count > 4);
    // console.log("Upright Count: " + count + " (" + otherNodeId + ") " + type + " " + yAngle(otherNodeId));
  }
}, [...cans]);
`;

export const JBC_8: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: "JBC 8" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 8: Bulldozer Mania`,
  },
  scripts: {
    uprightStartBoxCans: Script.ecmaScript("Upright Start Box Cans", uprightStartBoxCans),
    notInStartBox: Script.ecmaScript("Not in Start Box", notInStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
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
    can1: createCanNode(1),
    can2: createCanNode(2),
    can3: createCanNode(3),
    can4: createCanNode(4),
    can5: createCanNode(5),
    can6: createCanNode(6),
    can7: createCanNode(7),
    can8: createCanNode(8),
    can9: createCanNode(9),
    can10: createCanNode(10),
    can11: createCanNode(11),
    can12: createCanNode(12),
  },
};
