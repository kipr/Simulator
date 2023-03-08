import Scene from "../state/State/Scene";
import LocalizedString from "../util/LocalizedString";
import { createBaseSceneSurfaceA, createCanNode } from "./jbcBase";
import { Color } from "../state/State/Scene/Color";
import { Distance , Angle} from "../util";
import Script from "../state/State/Scene/Script";

const baseScene = createBaseSceneSurfaceA();

const garageIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});


scene.onBind = nodeId => {
  scene.addOnIntersectionListener(nodeId, (type, otherNodeId) => {

    //green garage and can2 intersecting
    if(nodeId == 'can2' && otherNodeId == 'n1'){
      console.log('Can 2 placed!', type, otherNodeId);
      const visible = type === 'start';
      scene.setChallengeEventValue('can2Intersects', visible);
      setNodeVisible('greenGarage', visible);
    }
    //yellow garage and can10 intersecting
    else if(nodeId == 'can10' && otherNodeId == 'n2')
    {
      console.log('Can 10 placed!', type, otherNodeId);
      const visible = type === 'start';
      scene.setChallengeEventValue('can10Intersects', visible);
      setNodeVisible('yellowGarage', visible);
    }
    //blue garage and can9 intersecting
    else if(nodeId == 'can9' && otherNodeId == 'n3'){
      console.log('Can 9 placed!', type, otherNodeId);
      const visible = type === 'start';
      scene.setChallengeEventValue('can9Intersects', visible);
      setNodeVisible('blueGarage', visible);
    }
  }, ['n1','n2','n3']);
}

`;


const uprightCans = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = Rotation.Euler.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));


scene.addOnRenderListener(() => {

  const upright2 = yAngle('can2') < 5;
  const upright9 = yAngle('can9') < 5;
  const upright10 = yAngle('can10') < 5;
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
    n_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(2),
      height: Distance.centimeters(0.1),
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
          z: Distance.centimeters(96),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-45),
          z: Angle.degrees(0),
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
    n1: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Green Garage node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(52),
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
    n2: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18.5),
          y: Distance.centimeters(-6),
          z: Distance.centimeters(78.9),
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
    n3: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Blue Garage node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-13), 
          y: Distance.centimeters(-6),
          z: Distance.centimeters(95),
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
    ...baseScene.nodes,
    can2: {...createCanNode(2), scriptIds: ["garageIntersects"]},
    can9: {...createCanNode(9,{
      x: Distance.centimeters(0.3),
      y: Distance.centimeters(0),
      z: Distance.centimeters(85.4),
    }), scriptIds: ["garageIntersects"]},
    can10: {...createCanNode(10), scriptIds: ["garageIntersects"]},
  },
};
