import Scene from '../../../../state/State/Scene';
import LocalizedString from '../../../../util/LocalizedString';
import Script from '../../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA } from '../jbcBase';
import { Color } from '../../../../state/State/Scene/Color';
import { Distance } from '../../../../util';

const baseScene = createBaseSceneSurfaceA();

const beginsStart = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot begins in start box!', type, otherNodeId);
  if(type === "start"){
    scene.setChallengeEventValue('start', true);
  }
  
}, 'startBox');
`;

const passedSide = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});
let circles = ['circle1','circle2','circle3','circle4','circle5'];
let count = 0;
let position = 0;

scene.onBind = nodeId => {
  
  scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
    const visible = type === 'start';
    if(otherNodeId == "startBox"){
      count = 0;
      position = 0;
    }

    if(type === "start" && (circles.includes(otherNodeId) == false)){
      position++;
      console.log(count + ":" + otherNodeId + ":" + type + ":Position:" +position );
    }
    
    if(type==="start" && (count == position -1) && (otherNodeId == "n" +position)){
      count++;
      console.log(count + ":" + otherNodeId + ":" + type);
     
    }

    switch(count){
      case 1:
         if(otherNodeId == "n1"){
          setNodeVisible('circle1',true);
          scene.setChallengeEventValue('passed1', true);
         }
      break;
      case 2:
         if(otherNodeId == "n2"){
          setNodeVisible('circle2',true);
          scene.setChallengeEventValue('passed2', true);
         }
      break;
      case 3:
        if(otherNodeId == "n3"){
         setNodeVisible('circle3',true);
         scene.setChallengeEventValue('passed3', true);
        }
      break;
      case 4:
        if(otherNodeId == "n4"){
         setNodeVisible('circle4',true);
         scene.setChallengeEventValue('passed4', true);
        }
      break;
      case 5:
        if(otherNodeId == "n5"){
         setNodeVisible('circle5',true);
         scene.setChallengeEventValue('passed5', true);
        }
      break;
    }
 
  
    if(position == 0 ){
      count = 0;
    }
    
    
  }, ['startBox', 'circle1','circle2','circle3','circle4','circle5',
        'n1','n2','n3','n4','n5']);
};

`;

export const JBC_8B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 8B' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 8B: Serpentine Jr.',
  },
  scripts: {
    passedSide: Script.ecmaScript('Passed Side', passedSide),
    beginsStart: Script.ecmaScript('Robot Begins In Start', beginsStart),
  },
  geometry: {
    ...baseScene.geometry,
    circle_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(1),
      height: Distance.centimeters(0.1),
    },
    n_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(0.01),
      height: Distance.centimeters(0.1),
    },
    mainSurface_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
    startBox_geom: {
      type: 'box',
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
      type: 'object',
      geometryId: 'mainSurface_geom',
      name: { [LocalizedString.EN_US]: 'Mat Surface' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 0),
        },
      },
    },
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(-14),
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
    circle1: {
      type: 'object',
      geometryId: 'circle_geom',
      name: { [LocalizedString.EN_US]: 'Circle 1' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(22.7), // can 1
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(35.2),
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
    n1: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Circle 1' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(23.5), // can 1
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(32.5),
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
    circle2: {
      type: 'object',
      geometryId: 'circle_geom',
      name: { [LocalizedString.EN_US]: 'Circle 2' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0), // can 2
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(28.8),
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
      name: { [LocalizedString.EN_US]: 'Circle 2' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0), // can 2
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(26.5),
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
    circle3: {
      type: 'object',
      geometryId: 'circle_geom',
      name: { [LocalizedString.EN_US]: 'Circle 3' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-16.2), // can 3
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(25.7),
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
      name: { [LocalizedString.EN_US]: 'Circle 3' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-16.2), // can 3
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(22.5),
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
    circle4: {
      type: 'object',
      geometryId: 'circle_geom',
      name: { [LocalizedString.EN_US]: 'Circle 4' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0), // can 4
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(42.7),
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
    n4: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Circle 4' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-3), // can 4
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(45),
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
    circle5: {
      type: 'object',
      geometryId: 'circle_geom',
      name: { [LocalizedString.EN_US]: 'Circle 5' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(14.3), // can 5
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(56.9),
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
    n5: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Circle 5' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(17), // can 5
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(59),
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
    can8: {
      ...createCanNode(8, {
        x: Distance.centimeters(-26), // can 8
        y: Distance.centimeters(-6.9),
        z: Distance.centimeters(65.5),
      },false,false),
      scriptIds: ['passedSide'],
    },
  },
};
