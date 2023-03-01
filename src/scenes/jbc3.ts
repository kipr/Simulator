import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';
import Script from '../state/State/Scene/Script';
import { Distance , Angle} from "../util";
import { createBaseSceneSurfaceA, createCanNode} from './jbcBase';
import {Rotation } from "../unit-math";
import { Color } from '../state/State/Scene/Color';
const baseScene = createBaseSceneSurfaceA();

const garageIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

let chosenGarage = [];
scene.onBind = nodeId => {

  scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
    console.log('Robot touched: ', otherNodeId);
    const visible = type === 'start';
    chosenGarage.pop();
  }, ['startBox']);

  scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
    // if(chosenGarage.length == 0){
    //   chosenGarage[0] == otherNodeId;
     
    // }
    if(chosenGarage.length < 1 && otherNodeId == 'n1') {
      chosenGarage.push('greenGarage');
      console.log('Robot: ', type, otherNodeId);
      const visible = type === 'start';
      setNodeVisible('greenGarage', true);
    }
    console.log("Chosen Garages: " + chosenGarage);
  }, ['n1', ]);

  scene.addOnIntersectionListener('robot', (type, otherNodeId)  => {
    if(otherNodeId == 'n2'){
      console.log('Robot touched: greenGarage right boundary');
      const visible = type === 'start';
      //setNodeVisible('n2', visible);
      scene.setChallengeEventValue('touchGarageLines', true);
    }
  }, ['n2']);

  
}
`;




export const JBC_3: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 3' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 3: Precision Parking' },
  scripts: {

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
    n_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(0.01),
      height: Distance.centimeters(0.1),
    },
    greenGarage_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(18),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(18),
      },
    },
    greenGarageL_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(0.01),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(22),
      },
    },
    greenGarageR_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(0.1),
        y: Distance.centimeters(0.01),
        z: Distance.centimeters(18),
      },
    },
    greenGarageT_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(24),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(1),
      },
    },


    blueGarage_geom: {
      type: "box",
      size: {
        x: Distance.centimeters(18),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(18),
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
    n1: {
      type: "object",
      geometryId: "n_geom",
      name: { [LocalizedString.EN_US]: "Green Garage node" },
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
    greenGarageL: {
      type: "object",
      geometryId: "greenGarageL_geom",
      name: { [LocalizedString.EN_US]: "Green Garage Left Boundary" },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(12),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53.5),
        },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(44,104,27),
        },
      },
    },
    greenGarageR: {
      type: "object",
      geometryId: "greenGarageR_geom",
      name: { [LocalizedString.EN_US]: "Green Garage Right Boundary" },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(-11.5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53.5),
        },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(44,104,27),
        },
      },
    },
    n2: {
      type: "object",
      geometryId: "n_geom",
      name: { [LocalizedString.EN_US]: "Green Garage Right Boundary node" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-11.5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53.5),
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
    greenGarageT: {
      type: "object",
      geometryId: "greenGarageT_geom",
      name: { [LocalizedString.EN_US]: "Green Garage Top Boundary" },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(65),
        },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(44,104,27),
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
          x: Distance.centimeters(-12.5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(94.5),
        },
        orientation: Rotation.AxisAngle.fromRaw({
          axis: { x: 0, y: 1, z: 0 },
          angle: 115.5,
        }),
      },
      material: {
        type: "pbr",
        emissive: {
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
    can12: { //Created an invisible can to attach script
      ...createCanNode(
        12,
        {
          x: Distance.centimeters(11),
          y: Distance.centimeters(0),
          z: Distance.centimeters(91),
        },
        false,
        false
      ),
      scriptIds: ['garageIntersects'],
    },
    
  },
};                                                     