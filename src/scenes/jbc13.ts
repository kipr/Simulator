import Scene from "../state/State/Scene";
import LocalizedString from "../util/LocalizedString";
import Script from "../state/State/Scene/Script";
import { createCanNode, createBaseSceneSurfaceA } from "./jbcBase";
import { Color } from "../state/State/Scene/Color";
import { Distance , Angle} from "../util";
import { Rotation, ReferenceFrame } from '../unit-math';
import { Vector2 } from '../math';

const baseScene = createBaseSceneSurfaceA();
const garageIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

let chosenGarage = [];
let declaredGarage = [];
let parkedCans = [];
let clicked = true;
let count = 0;
let state = 0;
scene.onBind = nodeId => {


  scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
    if (state >= 2){
      state = 0;
    }
    
    //Entering StartBox Events
    if(otherNodeId == 'startBox' && type == 'start'){

      //Reset Challenge Sequence
      if(parkedCans.length > 0 || chosenGarage.length > 0){
        for (let i = 0; i < chosenGarage.length; i++){
          chosenGarage.pop();
        }
        for (let i = 0; i < declaredGarage.length; i++){
          declaredGarage.pop();
        }
      
        for (let i = 0; i < parkedCans.length; i++){
          parkedCans.pop();
        }
        clicked = true;
  
      }

    }
    
  

  }, ['startBox']);


  scene.addOnIntersectionListener(nodeId, (type, otherNodeId) => {
   
    const visible = type === 'start';
    //Entering Garage Events
    if(type == 'start'){

      if(nodeId != 'robot' && otherNodeId == 'n1' && declaredGarage.includes('greenBox')){
        state++;
        if(parkedCans.includes(nodeId) == false){
          parkedCans.push(nodeId);
        }
        scene.setChallengeEventValue(nodeId+"Intersects",visible );
      }
      else if(nodeId != 'robot' && otherNodeId == 'n2' && declaredGarage.includes('yellowBox')) {
        state++;
        scene.setChallengeEventValue(nodeId+"Intersects",visible );
        if(parkedCans.includes(nodeId) == false){
          parkedCans.push(nodeId);
        }
        scene.setChallengeEventValue(nodeId+"Intersects",visible );
      }
      else if(nodeId != 'robot' && otherNodeId == 'n3' && declaredGarage.includes('blueBox')) {
        state++;
        scene.setChallengeEventValue(nodeId+"Intersects",visible );
        if(parkedCans.includes(nodeId) == false){
          parkedCans.push(nodeId);
        }
        scene.setChallengeEventValue(nodeId+"Intersects",visible );
      }
     
   
    }
    if(type == 'end' && parkedCans.includes(nodeId) && otherNodeId == declaredGarage[0]){
      const removeIndex = parkedCans.indexOf(nodeId);
      const x = parkedCans.splice(removeIndex,1);
    }

    

    console.log("Parked cans: " + parkedCans + " NodeId: "+  nodeId + " Type: " + type);
  }, ['n1','n2','n3']);

 
  //User declares garage
  scene.addOnClickListener(['greenBox','yellowBox','blueBox'], id => {
    
    clicked = !clicked;
    setNodeVisible('greenBox', clicked);
    setNodeVisible('yellowBox', clicked);
    setNodeVisible('blueBox', clicked);
    if(id == 'greenBox'){
      chosenGarage.push('greenGarage');
      declaredGarage.push('greenBox');
    }
    else if(id == 'yellowBox'){
      chosenGarage.push('yellowGarage');
      declaredGarage.push('yellowBox');
    }
    else if(id == 'blueBox'){
      chosenGarage.push('blueGarage');
      declaredGarage.push('blueBox');
    }
  });


}
`;

const uprightCans = `
// When a can is standing upright, the upright condition is met.
const EULER_IDENTITY = Rotation.Euler.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));


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
    n_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(20),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(20),
      },
    },
    designatorBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(10),
        y: Distance.centimeters(1),
        z: Distance.centimeters(10),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(-10),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    greenBox: {
      type: 'object',
      geometryId: 'designatorBox_geom',
      name: { [LocalizedString.EN_US]: 'Green Garage Designator Box' },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6),
          z: Distance.centimeters(53),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-90),
          z: Angle.degrees(0),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Click Here.png',
        },
      },
      faceUvs: [
        Vector2.ZERO, Vector2.ZERO,
        Vector2.ZERO, Vector2.ZERO,
        Vector2.ZERO, Vector2.ZERO,
        Vector2.ZERO, Vector2.ZERO,
        Vector2.create(0, 1), Vector2.create(1, 0), //TOP
        Vector2.ZERO, Vector2.ZERO,
      ],
    },

    yellowBox: {
      type: 'object',
      geometryId: 'designatorBox_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage Designator Box' },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(18.5),
          y: Distance.centimeters(-6),
          z: Distance.centimeters(78.9),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-90),
          z: Angle.degrees(0),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Click Here.png',
        },
      },
      faceUvs: [
        Vector2.ZERO, Vector2.ZERO,
        Vector2.ZERO, Vector2.ZERO,
        Vector2.ZERO, Vector2.ZERO,
        Vector2.ZERO, Vector2.ZERO,
        Vector2.create(0, 1), Vector2.create(1, 0), //TOP
        Vector2.ZERO, Vector2.ZERO,
      ],
    },

    blueBox: {
      type: 'object',
      geometryId: 'designatorBox_geom',
      name: { [LocalizedString.EN_US]: 'Blue Garage Designator Box' },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(-12), 
          y: Distance.centimeters(-6),
          z: Distance.centimeters(94),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-135),
          z: Angle.degrees(0),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Click Here.png',
        },
      },
      faceUvs: [
        Vector2.ZERO, Vector2.ZERO,
        Vector2.ZERO, Vector2.ZERO,
        Vector2.ZERO, Vector2.ZERO,
        Vector2.ZERO, Vector2.ZERO,
        Vector2.create(0, 1), Vector2.create(1, 0), //TOP
        Vector2.ZERO, Vector2.ZERO,
      ],
    },

    n1: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Green Garage node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53),
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
    n2: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18.5),
          y: Distance.centimeters(-6),
          z: Distance.centimeters(78),
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
    n3: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Blue Garage node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-13), 
          y: Distance.centimeters(-6),
          z: Distance.centimeters(94),
        },
        orientation: Rotation.AxisAngle.fromRaw({
          axis: { x: 0, y: 1, z: 0 },
          angle: 115.5,
        }),
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(0, 0, 0),
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
          color: Color.rgb(200, 200, 200),
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
          z: Distance.centimeters(96),
        },
        orientation: Rotation.AxisAngle.fromRaw({
          axis: { x: 0, y: 1, z: 0 },
          angle: 115.5,
        }),
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
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
    can2: {...createCanNode(2), scriptIds: ["garageIntersects","uprightCans"]},
    can5: {...createCanNode(5), scriptIds: ["garageIntersects","uprightCans"]},
    can8: {...createCanNode(8), scriptIds: ["garageIntersects","uprightCans"]},
    can10: {...createCanNode(10), scriptIds: ["garageIntersects","uprightCans"]},
    can11: {...createCanNode(11), scriptIds: ["garageIntersects","uprightCans"]},
  }
};