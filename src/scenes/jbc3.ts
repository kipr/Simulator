import Scene from '../state/State/Scene';
import LocalizedString from '../util/LocalizedString';
import Script from '../state/State/Scene/Script';
import { Distance, Angle } from '../util';
import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
import { RotationwUnits, ReferenceFramewUnits } from '../util/math/unitMath';
import { Color } from '../state/State/Scene/Color';
import { RawVector2 } from '../util/math/math';
const baseScene = createBaseSceneSurfaceA();


const garageIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

let chosenGarage = [];
let declaredGarage = [];
let clicked = true;

//state == 0 (reset), state == 1 (1 garage parked), state == 2 (finished)
let state = 0;

let selected = 0;

scene.onBind = nodeId => {


  scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
   
    //Value resets
    if (state >= 2){
      state = 0;
    }
    if(selected >= 2){
      selected = 0;
    }
    
    //Entering StartBox Events
    if(otherNodeId == 'startBox' && type == 'start'){

      //Reset Challenge Sequence
      if(state == 0 && chosenGarage.length > 0){
        for (let i = 0; i < chosenGarage.length; i++){
          chosenGarage.pop();
        }
        for (let i = 0; i < declaredGarage.length; i++){
          declaredGarage.pop();
        }
      
        clicked = true;
  
      }

      //Return to startbox after first garage park
      else if(state == 1 && chosenGarage.length > 0){
        scene.setChallengeEventValue('returnStartBox', true);
        setNodeVisible(chosenGarage[0], false);
        clicked = true;
      

        if(declaredGarage.includes('greenBox')){ 
          setNodeVisible('yellowBox', true);
          setNodeVisible('blueBox', true);

        }
        else if (declaredGarage.includes('yellowBox')){
          setNodeVisible('greenBox', true);
          setNodeVisible('blueBox', true);
      
        }
        else if (declaredGarage.includes('blueBox')){
          setNodeVisible('greenBox', true);
          setNodeVisible('yellowBox', true);
      
        }
        chosenGarage.pop();
        declaredGarage.pop();
      }
    }
    //Entering Garage Events
    if(type == 'start'){

      if(otherNodeId == 'n1' && declaredGarage.includes('greenBox')){
        setNodeVisible('greenGarage', true);
        state++;
        selected++;
      }
      else if(otherNodeId == 'n2' && declaredGarage.includes('yellowBox')) {
        setNodeVisible('yellowGarage', true);
        state++;
        selected++;
      }
      else if(otherNodeId == 'n3' && declaredGarage.includes('blueBox')) {
        setNodeVisible('blueGarage', true);
        state++;
        selected++;
      }
    }
  
 
    if(selected == 1){
      scene.setChallengeEventValue('singleGarageRun1', true);
    }
    else if (selected == 2){
      scene.setChallengeEventValue('singleGarageRun2', true);
    }

  }, ['startBox', 'greenBox', 'yellowBox', 'blueBox','n1','n2','n3']);

 
  //User declares garage
  scene.addOnClickListener(['greenBox','yellowBox','blueBox'], id => {
    
    clicked = !clicked;
    setNodeVisible('greenBox', clicked);
    setNodeVisible('yellowBox', clicked);
    setNodeVisible('blueBox', clicked);
    if(id == 'greenBox'){
      chosenGarage.push('greenGarage');
      declaredGarage.push('greenBox');
    }
    else if(id == 'yellowBox'){
      chosenGarage.push('yellowGarage');
      declaredGarage.push('yellowBox');
    }
    else if(id == 'blueBox'){
      chosenGarage.push('blueGarage');
      declaredGarage.push('blueBox');
    }
  });




  scene.addOnIntersectionListener('robot', (type, otherNodeId)  => {
    if(declaredGarage.includes('greenBox') && 
      (otherNodeId == 'g1' || otherNodeId == 'g2' || otherNodeId == 'g3')){
      state = 0;
      selected = 0;
      scene.setChallengeEventValue('touchGarageLines', true);
    }
    else if(declaredGarage.includes('blueBox') && 
    (otherNodeId == 'b1' || otherNodeId == 'b2' || otherNodeId == 'b3')){
    state = 0;
    selected = 0;
    scene.setChallengeEventValue('touchGarageLines', true);
    }
    else if(declaredGarage.includes('yellowBox') && 
    (otherNodeId == 'y1' || otherNodeId == 'y2' || otherNodeId == 'y3')){
    state = 0;
    selected = 0;
    scene.setChallengeEventValue('touchGarageLines', true);
  }
  }, ['g1', 'g2','g3', 'b1','b2','b3', 'y1', 'y2', 'y3']);




}
`;

export const JBC_3: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 3' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 3: Precision Parking',
  },
  scripts: {
    garageIntersects: Script.ecmaScript('Garage Intersects', garageIntersects),
    //clicked: Script.ecmaScript('Garage Intersects', clicked),
  },
  geometry: {
    ...baseScene.geometry,
    mainSurface_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(0),
      },
    },
    n_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(0.01),
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
  },
  nodes: {
    ...baseScene.nodes,
    mainSurface: {
      type: 'object',
      geometryId: 'mainSurface_geom',
      name: { [LocalizedString.EN_US]: 'Mat Surface' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 0),
        },
      },
    },
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: false,
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
    greenBox: {
      type: 'object',
      geometryId: 'designatorBox_geom',
      name: { [LocalizedString.EN_US]: 'Green Garage Designator Box' },
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
        RawVector2.create(0, 1), RawVector2.create(1, 0), //TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },

    yellowBox: {
      type: 'object',
      geometryId: 'designatorBox_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage Designator Box' },
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
        RawVector2.create(0, 1), RawVector2.create(1, 0), //TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },

    blueBox: {
      type: 'object',
      geometryId: 'designatorBox_geom',
      name: { [LocalizedString.EN_US]: 'Blue Garage Designator Box' },
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
        RawVector2.create(0, 1), RawVector2.create(1, 0), //TOP
        RawVector2.ZERO, RawVector2.ZERO,
      ],
    },

    greenGarage: {
      type: 'object',
      geometryId: 'greenGarage_geom',
      name: { [LocalizedString.EN_US]: 'Green Garage' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53),
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
    n1: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Green Garage node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(58),
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
    n2: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage node' },
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
      name: { [LocalizedString.EN_US]: 'Blue Garage node' },
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
      name: { [LocalizedString.EN_US]: 'Green Garage Right Boundary node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-11.5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53.5),
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
    g2: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Green Garage Left Boundary node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(12),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(53.5),
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
    g3: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Green Garage Top Boundary node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(65),
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

    blueGarage: {
      type: 'object',
      geometryId: 'blueGarage_geom',
      name: { [LocalizedString.EN_US]: 'Blue Garage' },
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
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    b1: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Blue Garage Right Boundary node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-19.2),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(86.4),
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
    b2: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Blue Garage Left Boundary node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(102.6),
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
    b3: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Blue Garage Top Boundary node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-19.2), 
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(102),
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
    yellowGarage: {
      type: 'object',
      geometryId: 'yellowGarage_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18.8),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(78),
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
    y1: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage Right Boundary node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(29.3),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(77.9),
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
    y2: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage Left Boundary node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(9.3),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(77.9),
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
    y3: {
      type: 'object',
      geometryId: 'n_geom',
      name: { [LocalizedString.EN_US]: 'Yellow Garage Top Boundary node' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18.3),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(68.9),
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
    can12: {
      //Created an invisible can to attach script
      ...createCanNode(
        12,
        {
          x: Distance.centimeters(11),
          y: Distance.centimeters(0),
          z: Distance.centimeters(91),
        },
        false,
        false
      ),
      scriptIds: ['garageIntersects'],
    },
  },
};
