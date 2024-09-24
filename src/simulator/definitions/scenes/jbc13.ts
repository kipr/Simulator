import Scene from "../../../state/State/Scene";
import LocalizedString from "../../../util/LocalizedString";
import Script from "../../../state/State/Scene/Script";
import { createCanNode, createBaseSceneSurfaceA } from "./jbcBase";
import { Color } from "../../../state/State/Scene/Color";
import { Distance , Angle } from "../../../util";

const baseScene = createBaseSceneSurfaceA();

const garageIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

// When a can (can2, can5, can8, can10, can11) is intersecting a garage, the garage glows
let chosenGarage = [];
let garageCans = []
let begin = 0;
scene.onBind = nodeId => {
  
  scene.addOnIntersectionListener(nodeId, (type, otherNodeId) => {
    const visible = type === 'start';

    //No chosen garage yet and enters
    if(chosenGarage.length == 0){
      chosenGarage[0] = otherNodeId;
      
      setNodeVisible(chosenGarage[0], true);
    }
   
    //If the garage the can moved into is the desired garage
    if(otherNodeId == chosenGarage[0] && type === 'start'){
      console.log(nodeId +' placed!', type, otherNodeId);
      garageCans.push(nodeId);
      scene.setChallengeEventValue(nodeId + 'Intersects', true);
      if(chosenGarage.length > 0){
        setNodeVisible(chosenGarage[0], true);
      }
    }

    //If a previously entered can leaves desired garage
    if(otherNodeId == chosenGarage[0] && type === 'end' && (garageCans.includes(nodeId) == true)){
      const removeIndex = garageCans.indexOf(nodeId);
      const x = garageCans.splice(removeIndex,1);
      scene.setChallengeEventValue(nodeId + 'Intersects', false);
      
    }

    //If a previously enterted can in desired garage enters a different garage
    else if(otherNodeId != chosenGarage[0] && (garageCans.includes(nodeId) == true)){
      const removeIndex = garageCans.indexOf(otherNodeId);
      const x = garageCans.splice(removeIndex,1);
      
      
    }
    
    
    //If there aren't any cans in a garage, reset chosen garage
    if(garageCans.length == 0){
      setNodeVisible(chosenGarage[0], false);
      chosenGarage.pop();
      
    }
    
   
    console.log("Chosen Garage: " + chosenGarage);
    console.log("Cans In Chosen Garage: " + garageCans);
  }, ['yellowGarage','blueGarage','greenGarage']);
  
}

`;
const uprightCans = `
// When a can is standing upright, the upright condition is met.
const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));


scene.addOnRenderListener(() => {
  const upright2 = yAngle('can2') < 5;
  const upright5 = yAngle('can5') < 5;
  const upright8 = yAngle('can8') < 5;
  const upright10 = yAngle('can10') < 5;
  const upright11 = yAngle('can11') < 5;

  scene.setChallengeEventValue('can2Upright', upright2);
  scene.setChallengeEventValue('can5Upright', upright5);
  scene.setChallengeEventValue('can8Upright', upright8);
  scene.setChallengeEventValue('can10Upright', upright10);
  scene.setChallengeEventValue('can11Upright', upright11);
});
`;

export const JBC_13: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 13' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 13: Clean the Mat` },
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
        z: Distance.centimeters(16),
      },
    },
    yellowGarage_geom: {
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
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(-13.4),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(96),
        },
        // orientation: {

        //   type: 'euler',
        //   x: Angle.degrees(0),
        //   y: Angle.degrees(-45),
        //   z: Angle.degrees(0),
        // },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },

      
    },
    yellowGarage: {
      type: "object",
      geometryId: "yellowGarage_geom",
      name: { [LocalizedString.EN_US]: "Yellow Garage" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18.8),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(78),
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
    can2: { ...createCanNode(2), scriptIds: ["garageIntersects","uprightCans"] },
    can5: { ...createCanNode(5), scriptIds: ["garageIntersects","uprightCans"] },
    can8: { ...createCanNode(8), scriptIds: ["garageIntersects","uprightCans"] },
    can10: { ...createCanNode(10), scriptIds: ["garageIntersects","uprightCans"] },
    can11: { ...createCanNode(11), scriptIds: ["garageIntersects","uprightCans"] },
  }
};