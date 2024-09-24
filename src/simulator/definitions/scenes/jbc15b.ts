import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const bumpReam = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});
let count = 0;
let position = 0;

scene.onBind = nodeId => {
  
  if(count == 3){
    count = 0;
  }
  scene.addOnCollisionListener('robot', (otherNodeId, point) => {

    //If front bumper is pressed
    if(scene.nodes['robot'].state.digitalValues[0] === true) {
      count = 1;
      scene.setChallengeEventValue('driveForwardTouch', true);
      console.log("Touched 1st ream");
    }

    //If either left or right back bumpers are pressed and front touch sensor was pressed first
    if((scene.nodes['robot'].state.digitalValues[1] === true || scene.nodes['robot'].state.digitalValues[2] === true) && count == 1)
    {
      count = 2;
      scene.setChallengeEventValue('driveBackwardTouch', true);
      console.log("Touched 2nd ream");
    }

    
  }, ['ream1','ream2',]);

  scene.addOnIntersectionListener('robot', (type, otherNodeId) => {

    //If touching first (front) and second (back) paper reams then going to circle 2
    if(count == 2){
      const visible = type === 'start';
      console.log('Robot intersecting circle 2!', type, otherNodeId);
      scene.setChallengeEventValue('driveForward2', visible);
      setNodeVisible('circle2', visible);
      count = 3;
    }
  }, 'circle2');
  
};

`;

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    z: Distance.centimeters(7),
  },
};

const REAM1_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(5),
    z: Distance.centimeters(48),
  },
  orientation: RotationwUnits.AxisAngle.fromRaw({
    axis: { x: 1, y: 0, z: 0 },
    angle: -Math.PI / 2,
  }),
};

const REAM2_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(5),
    z: Distance.centimeters(-12),
  },
  orientation: RotationwUnits.AxisAngle.fromRaw({
    axis: { x: 1, y: 0, z: 0 },
    angle: -Math.PI / 2,
  }),
};

export const JBC_15B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 15B' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 15B: Bump Bump`,
  },
  scripts: {
    bumpReam: Script.ecmaScript('Bump Ream', bumpReam),
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
    circle2_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
  },
  nodes: {
    ...baseScene.nodes,
    // The normal starting position of the robot doesn't leave room for the paper ream in the starting box
    // Start the robot forward a bit so that a ream fits behind it
    robot: {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN,
    },
    circle2: {
      type: 'object',
      geometryId: 'circle2_geom',
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
    ream1: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 1'),
      startingOrigin: REAM1_ORIGIN,
      origin: REAM1_ORIGIN,
      visible: true,
    },
    ream2: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 2'),
      startingOrigin: REAM2_ORIGIN,
      origin: REAM2_ORIGIN,
      visible: true,
    },
    can12: { // Created an invisible can to attach script
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
      scriptIds: ['bumpReam'],
    },
  },
};
