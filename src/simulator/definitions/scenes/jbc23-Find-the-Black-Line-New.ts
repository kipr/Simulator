import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, canPositions } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';

const baseScene = createBaseSceneSurfaceA();

const foundBlack = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
    ...scene.nodes[nodeId],
    visible
  });

  console.log('Robot crossing black line', type, otherNodeId);
  if(scene.programStatus === 'running'){
    if(scene.nodes['robot'].state.getAnalogValue(1) > 2000) {
      scene.setChallengeEventValue('stopAtBlackLine', type === 'start');
      setNodeVisible('otherNodeId', true);
    }
  }
}, 'blackLine');
`;

function randomCircle(): Vector3wUnits {
  const circles = [2, 4, 6, 9, 11];
  const randomCircle = circles[Math.floor(Math.random() * circles.length)];
  console.log('randomCircle: ', randomCircle);
  const circle: Vector3wUnits = {
    ...canPositions[randomCircle - 1],
  };
  console.log('circle: ', circle);
  return circle;
}

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: { ...randomCircle() },
  orientation: RotationwUnits.eulerDegrees(0, 180, 0)
};

export const JBC_23: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 23' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 23: Find the Black Line`,
  },
  scripts: {
    foundBlack: Script.ecmaScript('Found Black Line', foundBlack),
  },
  geometry: {
    ...baseScene.geometry,
    blackLine_geom: {
      type: "box",
      size: {
        x: Distance.inches(24),
        y: Distance.centimeters(10),
        z: Distance.inches(0.65),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    robot: {
      ...baseScene.nodes['robot'],
      origin: ROBOT_ORIGIN,
      startingOrigin: ROBOT_ORIGIN,
    },
    blackLine: {
      type: "object",
      geometryId: "blackLine_geom",
      name: { [LocalizedString.EN_US]: "Black Line" },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-1.9),
          z: Distance.inches(5.95),
        },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(255, 255, 255),
        },
      },
    },
  },
};
