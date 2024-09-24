import Scene from "../../../state/State/Scene";
import { ReferenceFramewUnits } from '../../../util/math/unitMath';
import { Distance } from "../../../util";
import { createCanNode, createBaseSceneSurfaceB } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import Script from '../../../state/State/Scene/Script';
import LocalizedString from '../../../util/LocalizedString';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceB();

const lineFollow = `

scene.onBind = nodeId => {
  let count = 0;
 scene.addOnIntersectionListener('robot', (type, otherNodeId) => {

    //Reset counter if robot in start box
    if(otherNodeId == 'startBox' && type === 'start'){
      count = 0;
    }
    //1st checkpoint
    if(otherNodeId == 'n1' && type === 'start' && count == 0){
      count = 1;
      console.log("Robot passed checkpoint 1");
    }
    //2nd checkpoint
    else if (otherNodeId == 'n2' && type === 'start' && count == 1){
      count = 2;
      console.log("Robot passed checkpoint 2 after checkpoint 1");
    }
    
    //Finish line after all other checkpoints
    else if(otherNodeId == 'lineB' && type === 'start' && count == 2){
      console.log("Robot completed the course!");
      scene.setChallengeEventValue('lineFollow', true);
    }

    console.log("Count: " + count);
 }, ['lineB', 'n1', 'n2', 'n3', 'startBox']);

};

`;
const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    x: Distance.centimeters(-16.5),
  },
};

export const JBC_17B: Scene = {
  ...baseScene,
  name: tr('JBC 17B'),
  description: tr('Junior Botball Challenge 17: Walk the Line II'),
  // Start the robot on the black tape
  scripts: {
    lineFollow: Script.ecmaScript('Line Follow', lineFollow),
  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(1.22),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(10),
      },
    },
    n_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(1),
      height: Distance.centimeters(0.1),
    },
    lineB_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(0.5),
        y: Distance.centimeters(0.1),
        z: Distance.meters(1.77),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN
    },
    lineB: {
      type: 'object',
      geometryId: 'lineB_geom',
      name: { [LocalizedString.EN_US]: 'Line B' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
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
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-70),
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

    n1: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Checkpoint 1' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-18),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(28),
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
      name: { [LocalizedString.EN_US]: 'Checkpoint 2' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-16),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(61),
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
      name: { [LocalizedString.EN_US]: 'Checkpoint 3' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(105),
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
    can12: {
      // Created an invisible can to attach script
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
      scriptIds: ['lineFollow'],
    },
  },
};
