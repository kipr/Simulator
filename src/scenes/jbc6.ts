import Scene from "../state/State/Scene";
import LocalizedString from "../util/LocalizedString";
import { createBaseSceneSurfaceA, createCanNode } from "./jbcBase";
import { Color } from "../state/State/Scene/Color";
import { Distance , Angle} from "../util";
import Script from "../state/State/Scene/Script";
import { Euler } from "../math";
import { Rotation } from "../unit-math";
import {SharedRegistersRobot} from '../SharedRegistersRobot';

const baseScene = createBaseSceneSurfaceA();


const garageIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});
//const sharedRegistersRobot_ = SharedRegistersRobot;
// When the can (can2) is intersecting the green garage, the garage glows

scene.addOnIntersectionListener('can2', (type, otherNodeId) => {
  console.log('Can 2 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can2Intersects', visible);
  setNodeVisible('greenGarage', visible);
}, 'greenGarage');

// When the can (can9) is intersecting the blue garage, the garage glows

scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  console.log('Can 9 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can9Intersects', visible);
  setNodeVisible('blueGarage', visible);
}, 'blueGarage');


// // When the can (can10) is intersecting the yellow garage, the garage glows

// scene.addOnIntersectionListener('can12', (type, otherNodeId) => {
//   console.log('Can 12 placed!', type, otherNodeId);
//   const visible = type === 'start';
//   scene.setChallengeEventValue('can12Intersects', visible);
//   setNodeVisible('circle12', visible);
// }, 'circle12');
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
  const upright2 = yAngle('can2') < 5;
  const upright9 = yAngle('can9') < 5;
  const upright10 = yAngle('can10') < 5;
  // if(timeDiff > 1000) {
  //   console.log('can6 angle: ', yAngle('can6'));
  //   startTime = currTime;
  // }
  scene.setChallengeEventValue('can2Upright', upright2);
  scene.setChallengeEventValue('can9Upright', upright9);
  scene.setChallengeEventValue('can10Upright', upright10);
});
`;

export const JBC_6: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: "JBC 6" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 6: Load 'Em Up`,
  },
  scripts: {
    uprightCans: Script.ecmaScript("Upright Cans", uprightCans),
    garageIntersects: Script.ecmaScript("Garage Intersects", garageIntersects),
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
    greenGarage_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(20),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(20),
      },
    },

    blueGarage_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(16),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(18),
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

    greenGarage: {
      type: "object",
      geometryId: "greenGarage_geom",
      name: { [LocalizedString.EN_US]: "Green Garage" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53),
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

    blueGarage: {
      type: "object",
      geometryId: "blueGarage_geom",
      name: { [LocalizedString.EN_US]: "Blue Garage" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-13.4),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(94),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(45),
          z: Angle.degrees(0),
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
    can2: {...createCanNode(2), scriptIds: ["garageIntersects"]},
    can9: {...createCanNode(9,{
      x: Distance.centimeters(0.3),
      y: Distance.centimeters(0),
      z: Distance.centimeters(85),
    }), scriptIds: ["garageIntersects"]},
    can10: {...createCanNode(10), scriptIds: ["garageIntersects"]},
  },
};
