import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import { Distance } from '../../../util';

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
let degrees = [];
scene.addOnRenderListener(() => {
  
  const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
  const xAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.X, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.X));
  let angle = xAngle('robot');
  console.log(angle);
  if(angle >= 179 && angle <= 180){
    degrees[0] = 0;
    degrees[1] = 180;
    
  }
  if(angle <= 1 && (degrees[1] == 180)&& ((scene.nodes['robot'].state.motors[0].pwm > scene.nodes['robot'].state.motors[3].pwm) || scene.nodes['robot'].state.motors[3].direction === 2)){
    scene.setChallengeEventValue('counterClockwise360', true);
    degrees.pop();
    degrees.pop();
  }
  else if (angle <=1 && (degrees[1] == 180) && (scene.nodes['robot'].state.motors[3].pwm > scene.nodes['robot'].state.motors[0].pwm) && scene.nodes['robot'].state.motors[3].direction != 2 )
  {
    scene.setChallengeEventValue('clockwise360', true);
    degrees.pop();
    degrees.pop();
  }
  console.log("0 PDM: " + scene.nodes['robot'].state.motors[0].pwm);
  console.log("3 PDM: " + scene.nodes['robot'].state.motors[3].pwm);
  console.log("0 direction: " + scene.nodes['robot'].state.motors[0].direction);
  console.log("3 direction: " + scene.nodes['robot'].state.motors[3].direction);
  console.log(degrees) ;
});

`;

export const JBC_14: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 14' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 14: Dance Party',
  },
  scripts: {
    goingBackwards: Script.ecmaScript('Going Backwards', goingBackwards),
    leftStartBox: Script.ecmaScript('Robot Reentered Start', leftStartBox),
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
          z: Distance.centimeters(0),
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
  },
};
