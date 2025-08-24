import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot not in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const addItUp = `
const values = {
  circle1: 1,
  circle2: 2,
  circle3: 3,
  circle4: 4,
  circle5: 5,
  circle6: 6,
  circle7: 7,
  circle8: 8,
  circle9: 9,
  circle10: 10,
  circle11: 11,
  circle12: 12
};

let total = 0;
const touched = new Set();

Object.entries(values).forEach(([nodeId, value]) => {
  scene.addOnIntersectionListener(nodeId, (type) => {
    console.log('Circle touched:', nodeId);
    if(scene.programStatus === 'running' && type === 'start' && !touched.has(nodeId)){
      touched.add(nodeId);
      
      total += value;
      if(total >= 20){
        scene.setChallengeEventValue('addItUp', true);
      }
    }
  }, 'arm_link');
});

// const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
//   ...scene.nodes[nodeId],
//   visible
//   });

// let circles = ['circle1','circle2','circle3','circle4','circle5','circle6','circle7','circle8', 'circle9','circle10','circle11','circle12'];

// let total = 0;

// scene.addOnRenderListener(() => {
//   if(scene.programStatus !== 'running') {
//     total = 0;
//   }
//   else {
//     if(total >= 20) {
//       scene.setChallengeEventValue('addItUp', true);
//     }
//   }
// });

// const arm = ...scene.nodes['robot'].

// scene.addOnIntersectionListener('claw_link', (type, otherNodeId) => {
//   if(scene.programStatus !== 'running') return;
//   const circleNumber = otherNodeId.charAt(otherNodeId.length-1);
//   if(scene.programStatus === 'running'){
//     if(type === "start"){
//       total = total + circleNumber;
//     }
//   }
// }, [...circles]);
`;

const inStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('inStartBox', type === 'start');
  }
}, 'startBox');
`;

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
  },
};

export const JBC_12: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 12' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 12: Add it Up',
  },
  scripts: {
    notInStartBox: Script.ecmaScript("Not In Start Box", notInStartBox),
    inStartBox: Script.ecmaScript("In Start Box", inStartBox),
    addItUp: Script.ecmaScript('Add It Up', addItUp),
  },
  geometry: {
    ...baseScene.geometry,
    circle_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },

    notStartBox_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(30),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
      },
    },
    lineB_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(0.5),
        y: Distance.centimeters(0.1),
        z: Distance.inches(48),
      },
    },
    endBox_geom: {
      type: 'box',
      size: {
        x: Distance.inches(24),
        y: Distance.centimeters(15),
        z: Distance.centimeters(1),
      },
    },
    endOfMat_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(4),
        z: Distance.inches(24),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    robot: {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN,
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
          z: Distance.meters(1.223),
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
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.89),
          z: Distance.centimeters(0.685),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 255),
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
    circle12: createCircleNode(12, undefined, false, false),
    circle11: createCircleNode(11, undefined, false, false),
  },
};
