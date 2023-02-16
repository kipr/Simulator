import Scene from "../state/State/Scene";
import LocalizedString from "../util/LocalizedString";
import Script from "../state/State/Scene/Script";
import { createCanNode, createBaseSceneSurfaceA } from "./jbcBase";
import { Color } from "../state/State/Scene/Color";
import { Distance } from "../util";
import { ReferenceFrame, Rotation, Vector3 } from "../unit-math";

const baseScene = createBaseSceneSurfaceA();




const leftStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
  
}, 'startBox');
`;




const goingBackwards = `

scene.addOnRenderListener(() => {
  const EULER_IDENTITY = Rotation.Euler.identity();
  const xAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.X, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.X));
  
  console.log("Robot orientation: " + xAngle('robot')); 
});

`;


export const JBC_5: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 5' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 5: Dance Party' },
  scripts: {
    goingBackwards: Script.ecmaScript("Going Backwards", goingBackwards),
    leftStartBox: Script.ecmaScript("Robot Reentered Start", leftStartBox),
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
        z: Distance.centimeters(0),
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
 
  },
};