import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, canPositions } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const foundBlack = `
scene.addOnRenderListener(() => {
  if(scene.programStatus === 'running'){
    if(scene.nodes['robot'].state.getAnalogValue(1) > 3500) {
      // console.log('Robot crossing black line', scene.nodes['robot'].state.getAnalogValue(1));
      scene.setChallengeEventValue('stopAtBlackLine', true);
    }
  }
});
`;

const onCircle = `
let startTime = 0;
let currentTime = 0;
let overTime = false;
scene.addOnRenderListener(() => {
  if (scene.programStatus === 'running') {
    if (currentTime - startTime > 500 && !overTime) {
      overTime = true;
    }
    if (startTime === 0) {
      startTime = new Date().getTime();
    }
    else {
      currentTime = new Date().getTime();
      if (!overTime) {
        const robotPosition = scene.nodes['robot'].origin.position;
        const circlePosition = scene.nodes['circle'].origin.position;
        const distance = Math.sqrt(
          Math.pow(robotPosition.x.value - circlePosition.x.value, 2) +
          Math.pow(robotPosition.z.value - circlePosition.z.value, 2)
        );
        if (distance < 1.5) {
          // console.log('Robot over selected circle', robotPosition, circlePosition, distance);
          scene.setChallengeEventValue('onCircle', true);
        }
      }
    }
  }
});
`;

function randomCircle(): Vector3wUnits {
  const circles = [2, 4, 6, 9, 11];
  const randomCircle = circles[Math.floor(Math.random() * circles.length)];
  const circle: Vector3wUnits = {
    ...canPositions[randomCircle - 1],
  };
  return circle;
}

const selectedCircle = randomCircle();

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: { ...selectedCircle },
  orientation: RotationwUnits.eulerDegrees(0, 180, 0)
};

export const JBC_23: Scene = {
  ...baseScene,
  name: tr('JBC 23'),
  description: tr('Junior Botball Challenge 23: Find the Black Line'),
  scripts: {
    foundBlack: Script.ecmaScript('Found Black Line', foundBlack),
    onCircle: Script.ecmaScript('On Circle', onCircle),
  },
  geometry: {
    ...baseScene.geometry,
    circle_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(3),
      height: Distance.centimeters(10),
    }
  },
  nodes: {
    ...baseScene.nodes,
    robot: {
      ...baseScene.nodes['robot'],
      origin: ROBOT_ORIGIN,
      startingOrigin: ROBOT_ORIGIN,
    },
    circle: {
      type: 'object',
      geometryId: 'circle_geom',
      name: tr('Circle'),
      visible: false,
      origin: {
        position: {
          ...selectedCircle,
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    }

  }
};
