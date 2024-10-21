import Scene from '../../../../state/State/Scene';
import { ReferenceFramewUnits } from '../../../../util/math/unitMath';
import { Distance } from '../../../../util';
import LocalizedString from '../../../../util/LocalizedString';
import Script from '../../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCanNode } from '../jbcBase';
import tr from '@i18n';

const uprightCans = `
// When a can is standing upright on the ream, the upright condition is met.


scene.onBind = nodeId => {
  const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
  const yAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));
  
  scene.addOnRenderListener(() => {
   
    const canUpright2 = yAngle('can2') < 5;
    const canUpright9 = yAngle('can9') < 5;
    const canUpright10 = yAngle('can10') < 5;
    const canUpright12 = yAngle('can12') < 5;
    scene.setChallengeEventValue('can2Upright', canUpright2);
    scene.setChallengeEventValue('can9Upright', canUpright9);
    scene.setChallengeEventValue('can10Upright', canUpright10);
    scene.setChallengeEventValue('can12Upright', canUpright12);
    
  });
  scene.addOnIntersectionListener(nodeId, (type, otherNodeId) => {
    const visible = type === 'start';
    scene.setChallengeEventValue(nodeId +'Intersects', visible); 
    
  }, 'ream');

};
  
`;

const baseScene = createBaseSceneSurfaceA();

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    x: Distance.centimeters(18),
  },
};

const REAM_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(-12),
    y: Distance.centimeters(-3),
    z: Distance.centimeters(3),
  },
};

export const JBC_20: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 20' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 20: Rescue the Cans`,
  },
  scripts: {
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
  },
  nodes: {
    ...baseScene.nodes,
    // The normal starting position of the robot doesn't leave room for the paper ream in the starting box
    // Start the robot on the left side so that a ream fits on the right side
    robot: {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN,
    },
    can2: {
      ...createCanNode(2),
      scriptIds: ['uprightCans'],
    },
    can9: {
      ...createCanNode(9),
      scriptIds: ['uprightCans'],
    },
    can10: {
      ...createCanNode(10),
      scriptIds: ['uprightCans'],
    },
    can12: {
      ...createCanNode(12),
      scriptIds: ['uprightCans'],
    },
    ream: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream'),
      startingOrigin: REAM_ORIGIN,
      origin: REAM_ORIGIN,
      visible: true,
    },
  },
};
