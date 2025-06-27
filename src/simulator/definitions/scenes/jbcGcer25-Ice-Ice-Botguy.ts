import Scene from "../../../state/State/Scene";
import { ReferenceFramewUnits, RotationwUnits } from "../../../util/math/unitMath";
import { Distance } from "../../../util";
import { createBaseSceneSurfaceA, canPositions, } from './jbcBase';

import tr from '@i18n';
import Script from "../../../state/State/Scene/Script";
import { Color } from "../../../state/State/Scene/Color";

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const POMS_BLUE = {};
const POM_COLLIDER_SCRIPTS = {};
for (const [i, pos] of canPositions.entries()) {
  const p = {
    position: pos,
    scale: { x: 100, y: 100, z: 100 },
  };
  POM_COLLIDER_SCRIPTS[`pom_blue${i}_collision`] = Script.ecmaScript(`Pom ${i+1} Collided`, `
scene.addOnIntersectionListener('pom_blue${i}', (type, otherNodeId) => {
  // scene.setChallengeEventValue('offMat', visible);
  console.log('pom_blue${i} collided');
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('pom_blue${i}', type === 'start');
  }
}, 'botguy');
`);
  POMS_BLUE[`pom_blue${i}`] = {
    type: 'from-bb-template',
    name: tr(`Blue pom #${i+1}`),
    templateId: 'pom_blue',
    visible: true,
    editable: true,
    startingOrigin: p,
    origin: p,
  };
}

const BOTGUY_ORIGIN = {
  position: {
    x: Distance.centimeters(22.7),
    y: Distance.centimeters(-1),
    z: Distance.centimeters(-7),
  },
  scale: { x: 50, y: 50, z: 50 },
};

export const Ice_Ice_Botguy: Scene = {
  ...baseScene,
  name: tr('GCER 2025: Ice Ice Botguy'),
  description: tr('GCER 2025 special event. Botguy is overheating! Collect the ice and dump it on Botguy to cool him off!'),
  scripts: {
    ...POM_COLLIDER_SCRIPTS,
    notInStartBox: Script.ecmaScript("Not in Start Box", notInStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    notStartBox_geom: {
      type: "box",
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    notStartBox: {
      type: "object",
      geometryId: "notStartBox_geom",
      name: tr('Not Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-1.9),
          z: Distance.meters(1.208),
        },
      },
      material: {
        type: "basic",
        color: {
          type: "color3",
          color: Color.rgb(255, 0, 0),
        },
      },
    },
    ...POMS_BLUE,
    'botguy': {
      type: 'from-bb-template',
      name: tr('Botguy'),
      templateId: 'botguy_gamepiece_static',
      visible: true,
      startingOrigin: BOTGUY_ORIGIN,
      origin: BOTGUY_ORIGIN,
    },
  }
};
