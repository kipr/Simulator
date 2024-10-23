import Scene from "../../../state/State/Scene";
import LocalizedString from "../../../util/LocalizedString";
import { createBaseSceneSurfaceA, createCanNode, createCircleNode } from "./jbcBase";
import { Color } from "../../../state/State/Scene/Color";
import { Distance } from "../../../util";
import Script from "../../../state/State/Scene/Script";
import Node from "state/State/Scene/Node";

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

// const addItUp = {
//   scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
//   }




export const JBC_12: Scene = {
  ...baseScene,
  name: tr('JBC 12'),
  description: tr('Junior Botball Challenge 12: Add It Up'),
  scripts: {
    inStartBox: Script.ecmaScript("In Start Box", notInStartBox),
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
    circle1: createCircleNode(1, undefined, false, false),
    circle2: createCircleNode(2, undefined, false, false),
    circle3: createCircleNode(3, undefined, false, false),
    circle4: createCircleNode(4, undefined, false, false),
    circle5: createCircleNode(5, undefined, false, false),
    circle6: createCircleNode(6, undefined, false, false),
    circle7: createCircleNode(7, undefined, false, false),
    circle8: createCircleNode(8, undefined, false, false),
    circle9: createCircleNode(9, undefined, false, false),
    circle10: createCircleNode(10, undefined, false, false),
    circle11: createCircleNode(11, undefined, false, false),
    circle12: createCircleNode(12, undefined, false, false),
  },
};