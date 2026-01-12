import Scene from '../../../state/State/Scene';
import { Distance } from '../../../util';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import tr from '@i18n';
import { matAStartGeoms, matAStartNodes, setNodeVisible, notInStartBox } from './jbcCommonComponents';

const baseScene = createBaseSceneSurfaceA();

const enterStartBox = `
${setNodeVisible}

scene.addOnIntersectionListener('can', (type, otherNodeId) => {
  // console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('canInStartBox', type === 'start');
    setNodeVisible('startBox', type == 'start');
  }
}, 'startBox');
`;

const uprightCan = `
// When a can is standing upright, the upright condition is met.
const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));

scene.addOnRenderListener(() => {
  const upright = yAngle('can') > 5;
  scene.setChallengeEventValue('canUpright', upright);
});
`;

function randomCan(): number {
  const cans = [2, 4, 6];
  const randomCan = cans[Math.floor(Math.random() * cans.length)];
  return randomCan;
}

export const JBC_22: Scene = {
  ...baseScene,
  name: tr('JBC 22'),
  description: tr('Junior Botball Challenge 22: Search and Rescue'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    enterStartBox: Script.ecmaScript('Enter Start Box', enterStartBox),
    uprightCan: Script.ecmaScript('Upright Can', uprightCan),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box'),
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
    can: createCanNode(randomCan()),
  },
};
