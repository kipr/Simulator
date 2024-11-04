import Scene from "../../../state/State/Scene";
import LocalizedString from "../../../util/LocalizedString";
import Script from "../../../state/State/Scene/Script";
import { createCanNode, createBaseSceneSurfaceA, createCircleNode, canPositions } from "./jbcBase";
import { Color } from "../../../state/State/Scene/Color";
import { Distance } from "../../../util";

const baseScene = createBaseSceneSurfaceA();

const oddNumberIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

let circles = new Set(['circle1', 'circle3', 'circle5', 'circle7', 'circle9', 'circle11']);
const evenCircles = new Set(['circle2', 'circle4', 'circle6', 'circle8', 'circle10', 'circle12']);

let circlesMap = new Map([
  ['circle1', false],
  ['circle3', false],
  ['circle5', false],
  ['circle7', false],
  ['circle9', false],
  ['circle11', false],
]);


// When the robot is touching a circle with an odd number, the circle glows
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot intersects!', type, otherNodeId);
  if (evenCircles.has(otherNodeId)) {
    scene.setChallengeEventValue('touchedEvenCircle', true);
    return;
  }
  else {
    switch (otherNodeId) {
      case 'circle1':
        circlesMap.set(otherNodeId, true);
        scene.setChallengeEventValue('circle1Touched', true);
        setNodeVisible(otherNodeId, true);
        circles.delete('circle1');
        break;
      case 'circle3':
        if (circlesMap.get('circle1')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle3Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      case 'circle5':
        if (circlesMap.get('circle3')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle5Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      case 'circle7':
        if (circlesMap.get('circle5')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle7Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      case 'circle9':
        if (circlesMap.get('circle7')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle9Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      case 'circle11':
        if (circlesMap.get('circle9')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle11Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      default:
        console.warn('Unknown circle: ', otherNodeId);
        break;

    }
  }


}, new Set([...circles, ...evenCircles]));
`;

export const JBC_5: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: "JBC 5" },
  description: {
    [LocalizedString.EN_US]: "Junior Botball Challenge 5: Odd Numbers",
  },
  scripts: {
    oddNumberIntersects: Script.ecmaScript("Odd Number Intersects", oddNumberIntersects),
  },
  geometry: {
    ...baseScene.geometry,
    mainSurface_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
    circle_geom: {
      type: "cylinder",
      height: Distance.centimeters(0.1),
      radius: Distance.centimeters(3),
    },

  },

  nodes: {
    ...baseScene.nodes,
    mainSurface: {
      type: "object",
      geometryId: "mainSurface_geom",
      name: { [LocalizedString.EN_US]: "Mat Surface" },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(0, 0, 0),
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
    circle11: createCircleNode(11, undefined, false, false),
    circle12: createCircleNode(12, undefined, false, false),
  },
};
