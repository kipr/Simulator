import Scene from '../state/State/Scene';
import { ReferenceFrame } from '../unit-math';
import { Distance } from '../util';
import LocalizedString from '../util/LocalizedString';
import Script from '../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
import { Color } from '../state/State/Scene/Color';

const baseScene = createBaseSceneSurfaceA();
const startBoxIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});
let circles = [];
let count = 0;
scene.onBind = nodeId => {
  
  scene.addOnIntersectionListener(nodeId, (type, otherNodeId) => {
    //count++;
    //console.log(count);
    console.log("Circles = " + circles);
   
    if(count == 0){
      circles = [];
    }
    
    if(type === 'start' && (circles.includes(otherNodeId) == false)){
      console.log(nodeId + " is on " + otherNodeId);
      
     
      setNodeVisible(otherNodeId, true);
      circles.push(otherNodeId);
      count++; 
     
    }
  
  
    if (count != 0 && type === "end"){
      if((circles.includes(otherNodeId) == true)){
        console.log(nodeId + " left " + otherNodeId +" :(");
        
        setNodeVisible(otherNodeId, false);
        const removeIndex = circles.indexOf(otherNodeId);
        const x = circles.splice(removeIndex,1);
        count--;
      }
    }
    else if (count > 5){
      count = 0;
    }

    switch (count){
      case 0:
        scene.setChallengeEventValue('canAIntersects', false);
        scene.setChallengeEventValue('canBIntersects', false);
        scene.setChallengeEventValue('canCIntersects', false);
        scene.setChallengeEventValue('canDIntersects', false);
        scene.setChallengeEventValue('canEIntersects', false);
      break;
      case 1:
        scene.setChallengeEventValue('canAIntersects', true);
        scene.setChallengeEventValue('canBIntersects', false);
        scene.setChallengeEventValue('canCIntersects', false);
        scene.setChallengeEventValue('canDIntersects', false);
        scene.setChallengeEventValue('canEIntersects', false);
      break;
      case 2:
        scene.setChallengeEventValue('canBIntersects', true);
        scene.setChallengeEventValue('canCIntersects', false);
        scene.setChallengeEventValue('canDIntersects', false);
        scene.setChallengeEventValue('canEIntersects', false);
      break;
      case 3:
        scene.setChallengeEventValue('canCIntersects', true);
        scene.setChallengeEventValue('canDIntersects', false);
        scene.setChallengeEventValue('canEIntersects', false);
      break;
      case 4:

        scene.setChallengeEventValue('canDIntersects', true);
        scene.setChallengeEventValue('canEIntersects', false);
      break;
      case 5:

        scene.setChallengeEventValue('canEIntersects', true);
      break;

    }
    console.log("Intersecting Count: " + count + " (" +nodeId + ")");
  }, ['circle1', 'circle2', 'circle3', 'circle4', 'circle5', 'circle6', 'circle7']);


};
`;

const leftStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
  
}, 'startBox');
`;

const enterStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('returnStartBox', type === 'start');
  }
}, 'startBox');
`;

const uprightCans = `
let circles = [];
let count = 0;
console.log("Beginning Upright Count: " + count);
scene.onBind = nodeId => {
  
  
  scene.addOnIntersectionListener(nodeId, (type, otherNodeId) => {
    const EULER_IDENTITY = Rotation.Euler.identity();
    const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3.dot(Vector3.applyQuaternion(Vector3.Y, Rotation.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3.Y));
    const upright = yAngle(nodeId) < 5;
  
    if(count == 0){
      circles = [];
    }
    if(upright && type === "start" && (circles.includes(otherNodeId) == false)){
      count++;
      circles.push(otherNodeId);
      if(!upright && (count != 0) && type === "end"){
        count--;
        const removeIndex = circles.indexOf(otherNodeId);
        const x = circles.splice(removeIndex,1);
      }
    }
    else if(upright && (count != 0) && type === "end"){
      
     if((circles.includes(otherNodeId) == true)){
      count--;
      const removeIndex = circles.indexOf(otherNodeId);
      const x = circles.splice(removeIndex,1);
     }
     
    }
    
    switch (count){
      case 0:
        scene.setChallengeEventValue('canAUpright', false);
        scene.setChallengeEventValue('canBUpright', false);
        scene.setChallengeEventValue('canCUpright', false);
        scene.setChallengeEventValue('canDUpright', false);
        scene.setChallengeEventValue('canEUpright', false);
      break;
      case 1:
        scene.setChallengeEventValue('canAUpright', true);
        scene.setChallengeEventValue('canBUpright', false);
        scene.setChallengeEventValue('canCUpright', false);
        scene.setChallengeEventValue('canDUpright', false);
        scene.setChallengeEventValue('canEUpright', false);
      break;
      case 2:
        scene.setChallengeEventValue('canBUpright', true);
        scene.setChallengeEventValue('canCUpright', false);
        scene.setChallengeEventValue('canDUpright', false);
        scene.setChallengeEventValue('canEUpright', false);
      break;
      case 3:
        scene.setChallengeEventValue('canCUpright', true);
        scene.setChallengeEventValue('canDUpright', false);
        scene.setChallengeEventValue('canEUpright', false);
      break;
      case 4:
        scene.setChallengeEventValue('canDUpright', true);
        scene.setChallengeEventValue('canEUpright', false);
      break;
      case 5:
        scene.setChallengeEventValue('canEUpright', true);
      break;


    }
    console.log("Upright Count: " + count + " (" +nodeId + ") in " + otherNodeId);
    

   
  }, ['circle1', 'circle2', 'circle3', 'circle4', 'circle5', 'circle6', 'circle7']);
};
`;
const ROBOT_ORIGIN: ReferenceFrame = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    z: Distance.centimeters(-8),
  },
};

export const JBC_7B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 7B' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 7B: Cover Your Bases`,
  },
  scripts: {
    startBoxIntersects: Script.ecmaScript(
      'Start Box Intersects',
      startBoxIntersects
    ),
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    leftStartBox: Script.ecmaScript('Robot Left Start', leftStartBox),
    enterStartBox: Script.ecmaScript('Robot Reentered Start', enterStartBox),
  },
  geometry: {
    ...baseScene.geometry,
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
        z: Distance.centimeters(30),
      },
    },
    circle1_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle2_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle3_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle4_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle5_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle6_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
    circle7_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
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
          z: Distance.centimeters(-3),
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
      geometryId: 'circle1_geom',
      name: { [LocalizedString.EN_US]: 'Circle 1' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(22.7), //can 1
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
    circle2: {
      type: 'object',
      geometryId: 'circle2_geom',
      name: { [LocalizedString.EN_US]: 'Circle 2' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0), //can 2
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
    circle3: {
      type: 'object',
      geometryId: 'circle3_geom',
      name: { [LocalizedString.EN_US]: 'Circle 3' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-16.2), //can 3
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
    circle4: {
      type: 'object',
      geometryId: 'circle4_geom',
      name: { [LocalizedString.EN_US]: 'Circle 4' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0), //can 4
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
    circle5: {
      type: 'object',
      geometryId: 'circle5_geom',
      name: { [LocalizedString.EN_US]: 'Circle 5' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(14.3), //can 5
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
    circle6: {
      type: 'object',
      geometryId: 'circle6_geom',
      name: { [LocalizedString.EN_US]: 'Circle 6' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0), //can 6
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(57.2),
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
    circle7: {
      type: 'object',
      geometryId: 'circle7_geom',
      name: { [LocalizedString.EN_US]: 'Circle 7' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-13.8), //can 7
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
    // The normal starting position of the robot covers the tape
    // Start the robot back a bit so that a can fits on the tape in front of the robot
    robot: {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN,
    },
    can1: {
      ...createCanNode(1, {
        x: Distance.centimeters(24),
        y: Distance.centimeters(0),
        z: Distance.centimeters(15.5),
      }),
      scriptIds: ['startBoxIntersects', 'uprightCans'],
    },
    can2: {
      ...createCanNode(2, {
        x: Distance.centimeters(16),
        y: Distance.centimeters(0),
        z: Distance.centimeters(15.5),
      }),
      scriptIds: ['startBoxIntersects', 'uprightCans'],
    },
    can3: {
      ...createCanNode(3, {
        x: Distance.centimeters(8),
        y: Distance.centimeters(0),
        z: Distance.centimeters(15.5),
      }),
      scriptIds: ['startBoxIntersects', 'uprightCans'],
    },
    can4: {
      ...createCanNode(4, {
        x: Distance.centimeters(0),
        y: Distance.centimeters(0),
        z: Distance.centimeters(15.5),
      }),
      scriptIds: ['startBoxIntersects', 'uprightCans'],
    },
    can5: {
      ...createCanNode(5, {
        x: Distance.centimeters(-8),
        y: Distance.centimeters(0),
        z: Distance.centimeters(15.5),
      }),
      scriptIds: ['startBoxIntersects', 'uprightCans'],
    },
    can6: {
      ...createCanNode(5, {
        x: Distance.centimeters(-16),
        y: Distance.centimeters(0),
        z: Distance.centimeters(15.5),
      }),
      scriptIds: ['startBoxIntersects', 'uprightCans'],
    },
    can7: {
      ...createCanNode(7, {
        x: Distance.centimeters(-24),
        y: Distance.centimeters(0),
        z: Distance.centimeters(15.5),
      }),
      scriptIds: ['startBoxIntersects', 'uprightCans'],
    },
  },
};
