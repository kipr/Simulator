import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import { Distance } from '../../../util';
import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import Script from '../../../state/State/Scene/Script';

const baseScene = createBaseSceneSurfaceA();

const leftStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
}, 'startBox');
`;

const canStacked = `
scene.addOnIntersectionListener('can5Bottom', (type, otherNodeId) => {
  if(otherNodeId == 'can7Top'){
    console.log("Can5 stacked ontop of Can7!");
  scene.setChallengeEventValue('canStacked', true);
  }
  else if (otherNodeId == 'mainSurface'){
    scene.setChallengeEventValue('canStacked', false);
  }
}, ['can7Top', 'mainSurface']);

scene.addOnIntersectionListener('can7Bottom', (type, otherNodeId) => {
  if(otherNodeId == 'can5Top'){
    console.log("Can7 stacked ontop of Can5!");
    scene.setChallengeEventValue('canStacked', true);
  }
  else if (otherNodeId == 'mainSurface'){
    scene.setChallengeEventValue('canStacked', false);
  }
}, ['can5Top', 'mainSurface']);
`;

const robotTouchesCan = `
scene.onBind = nodeId => {
  scene.addOnCollisionListener(nodeId, (otherNodeId, point)=> {
    if(nodeId == 'can5' || nodeId == 'can7'){
      scene.setChallengeEventValue('robotTouchCan', true);
    }
  }, ['robot']);
};
`;

export const JBC_18: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 18' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 18: Stackerz`,
  },
  scripts: {
    leftStartBox: Script.ecmaScript('Robot Left Start', leftStartBox),
    canStacked: Script.ecmaScript('Cans Stacked', canStacked),
    robotTouchesCan: Script.ecmaScript('Robot Touches Can', robotTouchesCan),
  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(1.77),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
      },
    },
    canEnd_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
  },
  nodes: {
    ...baseScene.nodes,
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },

      visible: true,
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

    can5: { ...createCanNode(5), scriptIds: ['canStacked', 'robotTouchesCan'] },
    can7: { ...createCanNode(7), scriptIds: ['canStacked', 'robotTouchesCan'] },
    can5Bottom: {
      parentId: 'can5',
      type: 'object',
      geometryId: 'canEnd_geom',
      name: { [LocalizedString.EN_US]: 'Bottom of can5' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-5.8),
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
    can7Top: {
      parentId: 'can7',
      type: 'object',
      geometryId: 'canEnd_geom',
      name: { [LocalizedString.EN_US]: 'Top of can7' },

      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(5.75),
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
    can7Bottom: {
      parentId: 'can7',
      type: 'object',
      geometryId: 'canEnd_geom',
      name: { [LocalizedString.EN_US]: 'Bottom of can7' },

      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-5.8),
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
    can5Top: {
      parentId: 'can5',
      type: 'object',
      geometryId: 'canEnd_geom',
      name: { [LocalizedString.EN_US]: 'Top of can5' },

      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(5.75),
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
