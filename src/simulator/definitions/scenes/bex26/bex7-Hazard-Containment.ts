import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
// import { createBaseSceneSurfaceB } from './jbcBase';
// import { setNodeVisible } from './jbcCommonComponents';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from '../jbcCommonComponents';
import { LO_BLUE_POMS, LO_ORANGE_POMS } from '../26botballExplorerSandbox';
import { RotationwUnits } from '../../../../util/math/unitMath';



const baseScene = createBaseSceneSurface();

const pomEnteredPVC = `
const orangePoms = ['loOrange0', 'loOrange1', 'loOrange2', 'loOrange3', 'loOrange4', 'loOrange5', ];
const bluePoms = ['loBlue0', 'loBlue1', 'loBlue2', 'loBlue3', 'loBlue4', 'loBlue5'];

const leftPVCSet = new Set();
const middlePVCSet = new Set();
const rightPVCSet = new Set();

const setsEqual = (a, b) =>
  a.size === b.size && [...a].every(x => b.has(x));


function checkPomsInDifferentPVC() {
  const leftPVCHasOrange = [...leftPVCSet].some(item => item.startsWith('loOrange'));
  const leftPVCHasBlue = [...leftPVCSet].some(item => item.startsWith('loBlue'));

  const middlePVCHasOrange = [...middlePVCSet].some(item => item.startsWith('loOrange'));
  const middlePVCHasBlue = [...middlePVCSet].some(item => item.startsWith('loBlue'));

  const rightPVCHasOrange = [...rightPVCSet].some(item => item.startsWith('loOrange'));
  const rightPVCHasBlue = [...rightPVCSet].some(item => item.startsWith('loBlue'));

  const leftEnclosureFull = leftPVCHasOrange && leftPVCHasBlue;
  const middleEnclosureFull = middlePVCHasOrange && middlePVCHasBlue;
  const rightEnclosureFull = rightPVCHasOrange && rightPVCHasBlue;

  if (leftEnclosureFull || middleEnclosureFull || rightEnclosureFull) {
    console.log('blueAndOrangePomsInPVC', true);

    scene.setChallengeEventValue('blueAndOrangePomsInPVC', true);

    if((leftEnclosureFull && middleEnclosureFull) || (leftEnclosureFull && rightEnclosureFull) || (middleEnclosureFull && rightEnclosureFull)) {
      console.log('blueAndOrangePomsInDifferentPVC', true);
      scene.setChallengeEventValue('blueAndOrangePomsInDifferentPVC', true);
    } else {
      console.log('blueAndOrangePomsInDifferentPVC', false);
      scene.setChallengeEventValue('blueAndOrangePomsInDifferentPVC', false);
    }
  } else {
    console.log('blueAndOrangePomsInPVC', false);
    scene.setChallengeEventValue('blueAndOrangePomsInPVC', false);
  }
} 

orangePoms.forEach(pom => {
  scene.addOnIntersectionListener(pom, (type, otherNodeId) => {
    if (type === 'start') {
      switch(otherNodeId) {
        case 'pvcEncloseLeft':
          leftPVCSet.add(pom);
          break;
        case 'pvcEncloseMiddle':
          middlePVCSet.add(pom);
          break;
        case 'pvcEncloseRight':
          rightPVCSet.add(pom);
          break;
      }
    }
    else if (type === 'end') {
      switch(otherNodeId) {
        case 'pvcEncloseLeft':
          leftPVCSet.delete(pom);
          break;
        case 'pvcEncloseMiddle':
          middlePVCSet.delete(pom);
          break;
        case 'pvcEncloseRight':
          rightPVCSet.delete(pom);
          break;
      }
    }
    console.log('orangePoms', pom, type, otherNodeId, leftPVCSet, middlePVCSet, rightPVCSet);
    checkPomsInDifferentPVC();
  }, ['pvcEncloseLeft', 'pvcEncloseMiddle', 'pvcEncloseRight']);
});

bluePoms.forEach(pom => {
  scene.addOnIntersectionListener(pom, (type, otherNodeId) => {
    if (type === 'start') {
      switch(otherNodeId) {
        case 'pvcEncloseLeft':
          leftPVCSet.add(pom);
          break;
        case 'pvcEncloseMiddle':
          middlePVCSet.add(pom);
          break;
        case 'pvcEncloseRight':
          rightPVCSet.add(pom);
          break;
      }
    }
    else if (type === 'end') {
      switch(otherNodeId) {
        case 'pvcEncloseLeft':
          leftPVCSet.delete(pom);
          break;
        case 'pvcEncloseMiddle':
          middlePVCSet.delete(pom);
          break;
        case 'pvcEncloseRight':
          rightPVCSet.delete(pom);
          break;
      }
    }
      checkPomsInDifferentPVC();
    console.log('bluePoms', pom, type, otherNodeId, leftPVCSet, middlePVCSet, rightPVCSet);
  }, ['pvcEncloseLeft', 'pvcEncloseMiddle', 'pvcEncloseRight']);
});
`;



export const BEX_7: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 7'),
  description: tr('Botball Explorer Mission 7: Hazard Containment'),
  scripts: {

    pomEnteredPVC: Script.ecmaScript('Pom Entered PVC', pomEnteredPVC),
  },
  geometry: {
    ...baseScene.geometry,
    pvcEnclose_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(70),
        y: Distance.centimeters(10),
        z: Distance.centimeters(9),
      },
    },
    pvcEncloseRight_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(78),
        y: Distance.centimeters(10),
        z: Distance.centimeters(9),
      },
    },

  },
  nodes: {
    ...baseScene.nodes,
    ...LO_BLUE_POMS,
    ...LO_ORANGE_POMS,
    pvcEncloseLeft: {
      type: 'object',
      geometryId: 'pvcEnclose_geom',
      name: tr('PVC Enclosure Left'),
      origin: {
        position: {
          x: Distance.centimeters(72.73),
          y: Distance.centimeters(-16.15),
          z: Distance.centimeters(90.43),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    pvcEncloseMiddle: {
      type: 'object',
      geometryId: 'pvcEnclose_geom',
      name: tr('PVC Enclosure Middle'),
      origin: {
        position: {
          x: Distance.centimeters(-0.62),
          y: Distance.centimeters(-16.15),
          z: Distance.centimeters(90.43),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },

    pvcEncloseRight: {
      type: 'object',
      geometryId: 'pvcEncloseRight_geom',
      name: tr('PVC Enclosure Right'),
      origin: {
        position: {
          x: Distance.centimeters(-78.95),
          y: Distance.centimeters(-16.15),
          z: Distance.centimeters(90.43),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },

  }
};