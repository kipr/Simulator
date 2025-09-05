import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { Distance, Angle } from '../../../util';
import { createBaseSceneSurfaceA } from './jbcBase';
import { setNodeVisible, matAStartBox, matANotStartBox, notInStartBox } from './jbcCommonComponents';
import { RotationwUnits } from '../../../util/math/unitMath';
import { Color } from '../../../state/State/Scene/Color';
import { RawVector2 } from '../../../util/math/math';
import Material from 'state/State/Scene/Material';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const garageIntersects = `
${setNodeVisible}

let chosenGarage = [];
let declaredGarage = [];
let clicked = true;
let instruction = 0;
//state == 0 (reset), state == 1 (1 garage parked), state == 2 (finished)
let state = 0;
let selected = 0;
let startTime = 0;
let runTime = 0;
let stopTime = 0;

scene.addOnRenderListener(() => {

  if(scene.programStatus === 'running'){
    runTime = new Date().getTime();

  }
  if(scene.programStatus !== 'running'){
    stopTime = new Date().getTime();
  }
  if(stopTime - runTime > 500){
    //Value resets
    state = 0;
    selected = 0;
    clicked = true;

  }
});

scene.addOnIntersectionListener('robot', (type, otherNodeId)  => {
  if(declaredGarage[state] == 'greenBox' && (otherNodeId == 'g1' || otherNodeId == 'g2' || otherNodeId == 'g3')){
    state = 0;
    selected = 0;
    // console.log('Touched Green Garage Lines');
    scene.setChallengeEventValue('touchGarageLines', true);
  }
  else if(declaredGarage[state] == 'blueBox' && (otherNodeId == 'b1' || otherNodeId == 'b2' || otherNodeId == 'b3')){
    state = 0;
    selected = 0;
    // console.log('Touched Blue Garage Lines');
    scene.setChallengeEventValue('touchGarageLines', true);
  }

  else if(declaredGarage[state] == 'yellowBox' && (otherNodeId == 'y1' || otherNodeId == 'y2' || otherNodeId == 'y3')){
    state = 0;
    selected = 0;
    // console.log('Touched Yellow Garage Lines');
    scene.setChallengeEventValue('touchGarageLines', true);
  }
}, ['greenBox', 'yellowBox', 'blueBox','g1', 'g2', 'g3', 'b1', 'b2', 'b3', 'y1', 'y2', 'y3']);

//User declares garage
scene.addOnClickListener(['greenBox','yellowBox','blueBox','volume'], id => {

  clicked = !clicked;

  switch(id){
    case 'greenBox':
      if(!chosenGarage.includes('greenGarage')){
        chosenGarage.push('greenGarage');
        declaredGarage.push('greenBox');
      }
      if(instruction == 0){
        setNodeVisible('greenBox', false);
        setNodeVisible('greenGarageMarker1', true);
      }
      else if (instruction == 1 )
      {
        setNodeVisible('greenBox', false);
        setNodeVisible('greenGarageMarker2', true);
      }
      instruction++;

      break;
    case 'yellowBox':
      if(!chosenGarage.includes('yellowGarage')){
        chosenGarage.push('yellowGarage');
        declaredGarage.push('yellowBox');
      }
      if(instruction == 0){
        setNodeVisible('yellowBox', false);
        setNodeVisible('yellowGarageMarker1', true);
      }
      else if (instruction == 1 )
      {
        setNodeVisible('yellowBox', false);
        setNodeVisible('yellowGarageMarker2', true);
      }
      instruction++;

      break;
    case 'blueBox':
      if(!chosenGarage.includes('blueGarage')){
        chosenGarage.push('blueGarage');
        declaredGarage.push('blueBox');
      }
      if(instruction == 0){
        setNodeVisible('blueBox', false);
        setNodeVisible('blueGarageMarker1', true);
      }
      else if (instruction == 1)
      {
        setNodeVisible('blueBox', false);
        setNodeVisible('blueGarageMarker2', true);
      }
      instruction++;
      break;
    default:
      // console.log('No box clicked');
      break;
  }

  if(instruction == 1){
    setNodeVisible('instructionBox1', false);
    setNodeVisible('instructionBox2', true);
  }
  else if(instruction == 2){

    setNodeVisible('instructionBox2', false);
    setNodeVisible('instructionBox1', false);
    setNodeVisible('mainInstructionBox', false);
    setNodeVisible('yellowBox', false);
    setNodeVisible('greenBox', false);
    setNodeVisible('blueBox', false);
    instruction = 0;
  }

});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  //Entering StartBox Events
  if(otherNodeId == 'startBox' && type == 'start'){

    if(state == 0)
    {
      chosenGarage = [];
      declaredGarage = [];
    }

    //Return to startbox after first garage park
      if(state == 1 && chosenGarage.length > 0){
      scene.setChallengeEventValue('returnStartBox', true);
      setNodeVisible(chosenGarage[0], false);
      clicked = true;
    }

  }

  //Entering Garage Events
  if(type == 'start' && otherNodeId != 'startBox'){

    if(otherNodeId == 'n1' && declaredGarage[state] == 'greenBox'){
      setNodeVisible('greenGarage', true);
      state = state == 1 ? state : state + 1
      selected++;

    }
    else if(otherNodeId == 'n2' && declaredGarage[state] == 'yellowBox') {
      setNodeVisible('yellowGarage', true);
      state = state == 1 ? state : state + 1
      selected++;
    }
    else if(otherNodeId == 'n3' && declaredGarage[state] == 'blueBox') {
      setNodeVisible('blueGarage', true);
      state = state == 1 ? state : state + 1
      selected++;
    }

  }


  if(selected == 1){
    scene.setChallengeEventValue('singleGarageRun1', true);
  }
  else if (selected == 2){
    scene.setChallengeEventValue('singleGarageRun2', true);
  }

}, ['startBox','n1','n2','n3', 'greenGarage', 'yellowGarage', 'blueGarage']);
`;

function generateNumberMarkers(marker: number): [string, boolean, RotationwUnits, Material, RawVector2[]] {
  const geometryId = 'numberMarker_geom';
  const visible = false;
  let material: Material;
  if (marker === 1) {
    material = {
      type: 'basic',
      color: {
        type: 'texture',
        uri: '/static/Number 1 Marker.png',
      },
    };
  } else {
    material = {
      type: 'basic',
      color: {
        type: 'texture',
        uri: '/static/Number 2 Marker.png',
      },
    };
  }
  const orientation: RotationwUnits = {
    type: 'euler',
    x: Angle.degrees(0),
    y: Angle.degrees(-90),
    z: Angle.degrees(90),
  };

  const faceUvs: RawVector2[] = [
    RawVector2.ZERO, RawVector2.ZERO,
    RawVector2.ZERO, RawVector2.ZERO,
    RawVector2.ZERO, RawVector2.ZERO,
    RawVector2.ZERO, RawVector2.ZERO,
    RawVector2.create(0, -1), RawVector2.create(1, 0), // TOP
    RawVector2.ZERO, RawVector2.ZERO,

  ];

  return [geometryId, visible, orientation, material, faceUvs];
}

const number1Markers = generateNumberMarkers(1);
const number2Markers = generateNumberMarkers(2);

export const JBC_3: Scene = {
  ...baseScene,
  name: tr('JBC 3'),
  description: tr('Junior Botball Challenge 3: Precision Parking'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    garageIntersects: Script.ecmaScript('Garage Intersects', garageIntersects),
  },
  geometry: {
    ...baseScene.geometry,
    startBoxGeom: matAStartBox.geom,
    notStartBoxGeom: matANotStartBox.geom,
    numberMarker_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(5),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(5),
      }
    },
    n_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(0.06),
      height: Distance.centimeters(0.1),
    },
    designatorBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(10),
        y: Distance.centimeters(1),
        z: Distance.centimeters(10),
      },
    },
    chosenGarageBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(8),
        y: Distance.centimeters(0.4),
        z: Distance.centimeters(8),
      },
    },
    greenGarage_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(18),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(18),
      },
    },
    blueGarage_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(18),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(18),
      },
    },
    yellowGarage_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(16),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(18),
      },
    },
    instructionBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(18),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(25),
      },
    },

    instructionNumberBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(10),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(10),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    startBox: matAStartBox.node,
    notStartBox: matANotStartBox.node,
    mainInstructionBox: {
      type: 'object',
      geometryId: 'instructionBox_geom',
      name: tr('Click Instruction Box'),
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(10),
          y: Distance.centimeters(10),
          z: Distance.centimeters(110),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-90),
          z: Angle.degrees(90),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Garage Declare.png',
        },
      },
      faceUvs: [
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.create(0, -1), RawVector2.create(1, 0), // TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },
    instructionBox1: {
      type: 'object',
      geometryId: 'instructionNumberBox_geom',
      name: tr('Click Instruction 1 Box'),
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(-12),
          y: Distance.centimeters(10),
          z: Distance.centimeters(110),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-90),
          z: Angle.degrees(90),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Number 1 Marker.png',
        },
      },
      faceUvs: [
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.create(0, -1), RawVector2.create(1, 0), // TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },
    instructionBox2: {
      type: 'object',
      geometryId: 'instructionNumberBox_geom',
      name: tr('Click Instruction 2 Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-12),
          y: Distance.centimeters(10),
          z: Distance.centimeters(110),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-90),
          z: Angle.degrees(90),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Number 2 Marker.png',
        },
      },
      faceUvs: [
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.create(0, -1), RawVector2.create(1, 0), // TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },
    chosenGarage1: {
      type: 'object',
      geometryId: 'chosenGarageBox_geom',
      name: tr('Chosen Garage Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(0),
          z: Distance.centimeters(0),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-135),
          z: Angle.degrees(90),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Declared Garage 1.png',
        },
      },
      faceUvs: [
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.create(0, -1), RawVector2.create(1, 0), // TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },
    greenBox: {
      type: 'object',
      geometryId: 'designatorBox_geom',
      name: tr('Green Garage Designator Box'),
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6),
          z: Distance.centimeters(53),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-90),
          z: Angle.degrees(0),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Click Here.png',
        },
      },
      faceUvs: [
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.create(0, -1), RawVector2.create(1, 0), // TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },
    yellowBox: {
      type: 'object',
      geometryId: 'designatorBox_geom',
      name: tr('Yellow Garage Designator Box'),
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(18.5),
          y: Distance.centimeters(-6),
          z: Distance.centimeters(78.9),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-90),
          z: Angle.degrees(0),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Click Here.png',
        },
      },
      faceUvs: [
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.create(0, -1), RawVector2.create(1, 0), // TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },
    blueBox: {
      type: 'object',
      geometryId: 'designatorBox_geom',
      name: tr('Blue Garage Designator Box'),
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(-12),
          y: Distance.centimeters(-6),
          z: Distance.centimeters(94),
        },
        orientation: {

          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(-135),
          z: Angle.degrees(0),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'texture',
          uri: '/static/Click Here.png',
        },
      },
      faceUvs: [
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.ZERO, RawVector2.ZERO,
        RawVector2.create(0, -1), RawVector2.create(1, 0), // TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },
    greenGarage: {
      type: 'object',
      geometryId: 'greenGarage_geom',
      name: tr('Green Garage'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 255, 0),
        },
      },
    },
    n1: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Green Garage node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(56),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    n2: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Yellow Garage node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18.5),
          y: Distance.centimeters(-6),
          z: Distance.centimeters(73.9),
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
    n3: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Blue Garage node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-14),
          y: Distance.centimeters(-6),
          z: Distance.centimeters(96),
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
    g1: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Green Garage Right Boundary node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-11.5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53.5),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    g2: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Green Garage Left Boundary node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(12),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53.5),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    g3: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Green Garage Top Boundary node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(65),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    blueGarage: {
      type: 'object',
      geometryId: 'blueGarage_geom',
      name: tr('Blue Garage'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-12.5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(94.5),
        },
        orientation: RotationwUnits.AxisAngle.fromRaw({
          axis: { x: 0, y: 1, z: 0 },
          angle: 115.5,
        }),
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 255),
        },
      },
    },
    b1: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Blue Garage Right Boundary node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-19.2),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(86.4),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    b2: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Blue Garage Left Boundary node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-6),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(101.5),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    b3: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Blue Garage Top Boundary node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-19.2),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(102),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    yellowGarage: {
      type: 'object',
      geometryId: 'yellowGarage_geom',
      name: tr('Yellow Garage'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18.8),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(78),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },
    y1: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Yellow Garage Right Boundary node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(29.3),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(77.9),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    y2: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Yellow Garage Left Boundary node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(9.3),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(77.9),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    y3: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Yellow Garage Top Boundary node'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18.3),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(68.9),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(132, 85, 206),
        },
      },
    },
    yellowGarageMarker1: {
      type: 'object',
      geometryId: number1Markers[0],
      name: tr('Yellow Garage Marker 1'),
      visible: number1Markers[1],
      origin: {
        position: {
          x: Distance.centimeters(18.8),
          y: Distance.centimeters(-4.5),
          z: Distance.centimeters(78),
        },
        orientation: number1Markers[2],
      },
      material: number1Markers[3],
      faceUvs: number1Markers[4],

    },
    yellowGarageMarker2: {
      type: 'object',
      geometryId: number2Markers[0],
      name: tr('Yellow Garage Marker 2'),
      visible: number2Markers[1],
      origin: {
        position: {
          x: Distance.centimeters(18.8),
          y: Distance.centimeters(-4.5),
          z: Distance.centimeters(78),
        },
        orientation: number2Markers[2],
      },
      material: number2Markers[3],
      faceUvs: number2Markers[4],
    },
    blueGarageMarker1: {

      type: 'object',
      geometryId: number1Markers[0],
      name: tr('Blue Garage Marker 1'),
      visible: number1Markers[1],
      origin: {
        position: {
          x: Distance.centimeters(-12.5),
          y: Distance.centimeters(-4.5),
          z: Distance.centimeters(94.5),
        },
        orientation: number1Markers[2],
      },
      material: number1Markers[3],
      faceUvs: number1Markers[4],
    },
    blueGarageMarker2: {
      type: 'object',
      geometryId: number2Markers[0],
      name: tr('Blue Garage Marker 2'),
      visible: number2Markers[1],
      origin: {
        position: {
          x: Distance.centimeters(-12.5),
          y: Distance.centimeters(-4.5),
          z: Distance.centimeters(94.5),
        },
        orientation: number2Markers[2],
      },
      material: number2Markers[3],
      faceUvs: number2Markers[4],
    },
    greenGarageMarker1: {
      type: 'object',
      geometryId: number1Markers[0],
      name: tr('Green Garage Marker 1'),
      visible: number1Markers[1],
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-4.5),
          z: Distance.centimeters(53),
        },
        orientation: number1Markers[2],
      },
      material: number1Markers[3],
      faceUvs: number1Markers[4],
    },
    greenGarageMarker2: {
      type: 'object',
      geometryId: number2Markers[0],
      name: tr('Green Garage Marker 2'),
      visible: number2Markers[1],
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-4.5),
          z: Distance.centimeters(53),
        },
        orientation: number2Markers[2],
      },
      material: number2Markers[3],
      faceUvs: number2Markers[4],
    },
  },
};
