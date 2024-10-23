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
    // circle1: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 1' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[0],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle2: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 2' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[1],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle3: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 3' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[2],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle4: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 4' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[3],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle5: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 5' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[4],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle6: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 6' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[5],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle7: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 7' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[6],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle8: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 8' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[7],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle9: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 9' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[8],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle10: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 10' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[9],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle11: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 11' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[10],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
    // circle12: {
    //   type: 'object',
    //   geometryId: 'circle_geom',
    //   name: { [LocalizedString.EN_US]: 'Circle 12' },
    //   visible: false,
    //   origin: {
    //     position: {
    //       ...canPositions[11],
    //     },
    //   },
    //   material: {
    //     type: 'pbr',
    //     emissive: {
    //       type: 'color3',
    //       color: Color.rgb(255, 255, 255),
    //     },
    //   },
    // },
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
