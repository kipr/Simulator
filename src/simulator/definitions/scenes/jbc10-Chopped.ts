import Scene from "../../../state/State/Scene";
import LocalizedString from "../../../util/LocalizedString";
import { createBaseSceneSurfaceA, createCanNode } from "./jbcBase";
import { Color } from "../../../state/State/Scene/Color";
import { Distance } from "../../../util";
import Script from "../../../state/State/Scene/Script";

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const waitToChop = `
// Need to wait 5 seconds before the can can be chopped
let currentDate;
let stopTime = 0;
scene.addOnRenderListener(() => {
  const robotNode = scene.nodes['robot'];
  if (robotNode.state.getMotor(0).speedGoal <= 15 && robotNode.state.getMotor(3).speedGoal <= 15) {
    if (stopTime == 0) {
      currentDate = new Date();
      stopTime = currentDate.getTime();
      // console.log('Waiting at ', stopTime);
    }
    else {
      currentDate = new Date();
      if (currentDate.getTime() - stopTime > 5000) {
        scene.setChallengeEventValue('waitedToChop', true);
        // console.log("Waited 5 seconds");
      }
    }
  }
  else {
    stopTime = 0;
  }
});
`;

const uprightCan = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));

scene.addOnRenderListener(() => {
  const upright7 = yAngle('can7') > 5;
  scene.setChallengeEventValue('can7Upright', upright7);
});
`;

export const JBC_10: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: "JBC 10" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 10: Chopped`,
  },
  scripts: {
    inStartBox: Script.ecmaScript("In Start Box", notInStartBox),
    waitToChop: Script.ecmaScript("Wait to Chop", waitToChop),
    uprightCan: Script.ecmaScript("Upright Can", uprightCan),
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
    can7: createCanNode(7),
  },
};

