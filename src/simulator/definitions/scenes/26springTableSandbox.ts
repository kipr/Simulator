import Scene from '../../../state/State/Scene';
import Node from '../../../state/State/Scene/Node';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import Dict from '../../../util/objectOps/Dict';
import { createBaseSceneSurface } from './26springTableBase';
import Script from '../../../state/State/Scene/Script';
import { sprintf } from 'sprintf-js';

import tr from '@i18n';
import { setNodeVisible } from './jbcCommonComponents';

const baseScene = createBaseSceneSurface();

const DOOR_X = 97;
const DOOR_Y = 9;
const DOOR1_Z = 90;
const DOOR_ORIENTATION = RotationwUnits.eulerDegrees(0, 0, 91);
const DOOR1_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(DOOR_X, DOOR_Y, DOOR1_Z),
  orientation: DOOR_ORIENTATION
};
const DOOR2_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(DOOR_X, DOOR_Y, DOOR1_Z + 20.32),
  orientation: DOOR_ORIENTATION
};

const DOORS: Dict<Node.FromBBTemplate> = {
  dock_pallet_1: {
    type: 'from-bb-template',
    name: tr('Sliding Door #1'),
    templateId: 'slidingDoor',
    visible: true,
    editable: true,
    origin: DOOR1_ORIGIN,
    startingOrigin: DOOR1_ORIGIN
  },
  dock_pallet_2: {
    type: 'from-bb-template',
    name: tr('Sliding Door #2'),
    templateId: 'slidingDoor',
    visible: true,
    editable: true,
    origin: DOOR2_ORIGIN,
    startingOrigin: DOOR2_ORIGIN
  }
};
// This rotation prevents clipping into the pipe
const POM_ORIENTATION: RotationwUnits = RotationwUnits.eulerDegrees(0, 90, 0);
const LO_BLUE_X = 65;
const LO_Y = -3;
const LO_Z_EDGE = -17.4;
const POM_Z_GAP = 6 * 2.54;
const LO_Z_1 = LO_Z_EDGE + POM_Z_GAP;

const loBluePoms: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(LO_BLUE_X, LO_Y, LO_Z_1 + POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  loBluePoms[`loBlue${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Low Blue Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pomBlue2In',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}
const LO_ORANGE_X = 32;
const loOrangePoms: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(LO_ORANGE_X, LO_Y, LO_Z_1 + POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  loOrangePoms[`loOrange${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Low Orange Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pom_orange',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}

const HI_BLUE_X = 3.9;
const HI_Y = 12.5;
const HI_Z_EDGE = 204.5;
const HI_Z_1 = HI_Z_EDGE - POM_Z_GAP;
const hiBluePoms: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(HI_BLUE_X, HI_Y, HI_Z_1 - POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  hiBluePoms[`hiBlue${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('High Blue Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pomBlue2In',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}
const HI_ORANGE_X = HI_BLUE_X - 2 * 2.54;
const hiOrangePoms: Dict<Node> = {};
for (let i = 0; i < 6; i++) {
  const origin: ReferenceFramewUnits = {
    position: Vector3wUnits.centimeters(HI_ORANGE_X, HI_Y, HI_Z_1 - POM_Z_GAP * i),
    orientation: POM_ORIENTATION
  };
  hiOrangePoms[`hiOrange${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('High Orange Pom #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pom_orange',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}

const BASKET_ORIENTATION = RotationwUnits.eulerDegrees(0, 90, 0);
const BASKET_X = 2;
const BASKET_Y = -5;
const BASKET_Z = 208;
const BASKET_ORIGINS: ReferenceFramewUnits[] = [
  {
    position: Vector3wUnits.centimeters(BASKET_X, BASKET_Y, BASKET_Z),
    orientation: BASKET_ORIENTATION
  },
  {
    position: Vector3wUnits.centimeters(BASKET_X, BASKET_Y, BASKET_Z - 33.7),
    orientation: BASKET_ORIENTATION
  }
];
const BASKETS: Dict<Node> = {
  leftBasket: {
    type: 'from-bb-template',
    name: tr('Left Basket'),
    templateId: 'basket',
    visible: true,
    editable: true,
    startingOrigin: BASKET_ORIGINS[0],
    origin: BASKET_ORIGINS[0]
  },
  rightBasket: {
    type: 'from-bb-template',
    name: tr('Right Basket'),
    templateId: 'basket',
    visible: true,
    editable: true,
    startingOrigin: BASKET_ORIGINS[1],
    origin: BASKET_ORIGINS[1]
  }
};

const PIPE_2IN_CUBE_X = 91;
const PIPE_2IN_CUBE_Y = -2.8;
const PIPE_2IN_CUBE_GAP = 8.534 + 2 * 2.54;
const RED_Z_1 = 56.2;
const GREEN_Z_1 = 130.1;
const LOW_2IN_CUBE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(PIPE_2IN_CUBE_X, PIPE_2IN_CUBE_Y, RED_Z_1) },
  { position: Vector3wUnits.centimeters(PIPE_2IN_CUBE_X, PIPE_2IN_CUBE_Y, RED_Z_1 + PIPE_2IN_CUBE_GAP) },
  { position: Vector3wUnits.centimeters(PIPE_2IN_CUBE_X, PIPE_2IN_CUBE_Y, GREEN_Z_1) },
  { position: Vector3wUnits.centimeters(PIPE_2IN_CUBE_X, PIPE_2IN_CUBE_Y, GREEN_Z_1 + PIPE_2IN_CUBE_GAP) }
];
const LOW_2IN_CUBES: Dict<Node> = {
  leftRed: {
    type: 'from-bb-template',
    name: tr('Left Red Cube (2 inch)'),
    templateId: 'cubeRed2In',
    visible: true,
    editable: true,
    startingOrigin: LOW_2IN_CUBE_ORIGINS[0],
    origin: LOW_2IN_CUBE_ORIGINS[0]
  },
  rightRed: {
    type: 'from-bb-template',
    name: tr('Right Red Cube (2 inch)'),
    templateId: 'cubeRed2In',
    visible: true,
    editable: true,
    startingOrigin: LOW_2IN_CUBE_ORIGINS[1],
    origin: LOW_2IN_CUBE_ORIGINS[1]
  },
  leftGreen: {
    type: 'from-bb-template',
    name: tr('Left Green Cube (2 inch)'),
    templateId: 'cubeGreen2In',
    visible: true,
    editable: true,
    startingOrigin: LOW_2IN_CUBE_ORIGINS[2],
    origin: LOW_2IN_CUBE_ORIGINS[2]
  },
  rightGreen: {
    type: 'from-bb-template',
    name: tr('Right Green Cube (2 inch)'),
    templateId: 'cubeGreen2In',
    visible: true,
    editable: true,
    startingOrigin: LOW_2IN_CUBE_ORIGINS[3],
    origin: LOW_2IN_CUBE_ORIGINS[3]
  },
};

const LM_PALLET_X = 24.5375;
const LOW_PALLET_Y = -5;
const LOW_PALLET_Z = 47.9;
const PALLET_H = 1.8;
const PALLET_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(LM_PALLET_X, LOW_PALLET_Y, LOW_PALLET_Z) },
  { position: Vector3wUnits.centimeters(LM_PALLET_X, LOW_PALLET_Y + PALLET_H, LOW_PALLET_Z) },
  { position: Vector3wUnits.centimeters(LM_PALLET_X + 0.225, 0, 61.8) },
  { position: Vector3wUnits.centimeters(22.25, 10, 106.9) }
];

const pallets: Dict<Node> = {};
for (const [i, origin] of PALLET_ORIGINS.entries()) {
  pallets[`pallet${i}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Pallet #%d'), (str: string) => sprintf(str, i + 1)),
    templateId: 'pallet',
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}

const YELLOW_CUBE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.add(PALLET_ORIGINS[1].position, Vector3wUnits.centimeters(0, 2.54 + PALLET_H, 0)) },
  { position: Vector3wUnits.add(PALLET_ORIGINS[1].position, Vector3wUnits.centimeters(0, PALLET_H + 3 * 2.54, 0)) },
];

const YELLOW_2IN_CUBES: Dict<Node> = {
  lower: {
    type: 'from-bb-template',
    name: tr('Lower Yellow Cube (2 inch)'),
    templateId: 'cubeYellow2In',
    visible: true,
    editable: true,
    startingOrigin: YELLOW_CUBE_ORIGINS[0],
    origin: YELLOW_CUBE_ORIGINS[0]
  },
  upper: {
    type: 'from-bb-template',
    name: tr('Upper Yellow Cube (2 inch)'),
    templateId: 'cubeYellow2In',
    visible: true,
    editable: true,
    startingOrigin: YELLOW_CUBE_ORIGINS[1],
    origin: YELLOW_CUBE_ORIGINS[1]
  }
};

const MIDLINE_X = 106;
const BROWN_CUBE_Y = 0;
const BROWN_CUBE_LEFT_Z = RED_Z_1 + PIPE_2IN_CUBE_GAP + 5;
const BROWN_CUBE_RIGHT_Z = GREEN_Z_1 - 5;
const BROWN_CUBE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(MIDLINE_X, BROWN_CUBE_Y, BROWN_CUBE_LEFT_Z) },
  { position: Vector3wUnits.centimeters(MIDLINE_X, BROWN_CUBE_Y, BROWN_CUBE_RIGHT_Z) }
];

const BROWN_CUBES: Dict<Node> = {
  left: {
    type: 'from-bb-template',
    name: tr('Middle Left Brown Cube'),
    templateId: 'cubeBrown4In',
    visible: true,
    editable: true,
    startingOrigin: BROWN_CUBE_ORIGINS[0],
    origin: BROWN_CUBE_ORIGINS[0]
  },
  right: {
    type: 'from-bb-template',
    name: tr('Middle Right Brown Cube'),
    templateId: 'cubeBrown4In',
    visible: true,
    editable: true,
    startingOrigin: BROWN_CUBE_ORIGINS[1],
    origin: BROWN_CUBE_ORIGINS[1]
  }
};

const MIDLINE_Z = (BROWN_CUBE_LEFT_Z + BROWN_CUBE_RIGHT_Z - 2) / 2;
const LOW_4IN_Y = 4;
const BOTGUY_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(MIDLINE_X, LOW_4IN_Y, MIDLINE_Z)
};
const BOTGUY: Node = {
  type: 'from-bb-template',
  name: tr('Botguy'),
  templateId: 'botguy_gamepiece',
  visible: true,
  editable: true,
  startingOrigin: BOTGUY_ORIGIN,
  origin: BOTGUY_ORIGIN
};

const RAND_4IN_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(PIPE_2IN_CUBE_X - 2.54, 0, MIDLINE_Z) },
  { position: Vector3wUnits.add(PALLET_ORIGINS[3].position, Vector3wUnits.centimeters(0, PALLET_H + 2 * 2.54, 0)) }
  // Prefix with _ to silence unused warnings
].sort((_a, _b) => Math.random() - 0.5);

const GREEN_IDX = Math.floor(2 * Math.random());
const RED_IDX = (GREEN_IDX + 1) % 2;

const RAND_4IN_CUBES: Dict<Node> = {
  green: {
    type: 'from-bb-template',
    name: tr('Green Cube'),
    templateId: 'cubeGreen4In',
    visible: true,
    editable: true,
    startingOrigin: RAND_4IN_ORIGINS[0],
    origin: RAND_4IN_ORIGINS[0]
  },
  red: {
    type: 'from-bb-template',
    name: tr('Red Cube'),
    templateId: 'cubeRed4In',
    visible: true,
    editable: true,
    startingOrigin: RAND_4IN_ORIGINS[1],
    origin: RAND_4IN_ORIGINS[1]
  }
};

const STACK_HEIGHTS = [LO_Y, LO_Y + 2 * 2.54, LO_Y + 4 * 2.54].sort((a, b) => Math.random() - 0.5);
const STACK_ORDER = ['Red', 'Yellow', 'Green'];
const NEAR_STACK_ORIGINS: ReferenceFramewUnits[] = STACK_HEIGHTS.map((y) => ReferenceFramewUnits.create(Vector3wUnits.centimeters(-9, y, 8.645)));
const NEAR_STACK: Dict<Node> = {};
for (const [i, origin] of NEAR_STACK_ORIGINS.entries()) {
  const color = STACK_ORDER[i];
  NEAR_STACK[`near${color}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Near Stack %s Cube'), (str: string) => sprintf(str, color)),
    templateId: `cube${color}2In`,
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}
const FAR_STACK_ORIGINS: ReferenceFramewUnits[] = STACK_HEIGHTS.map((y) => ReferenceFramewUnits.create(Vector3wUnits.centimeters(64.894, y, 215.135)));
const FAR_STACK: Dict<Node> = {};
for (const [i, origin] of FAR_STACK_ORIGINS.entries()) {
  const color = STACK_ORDER[i];
  FAR_STACK[`far${color}`] = {
    type: 'from-bb-template',
    name: Dict.map(tr('Far Stack %s Cube'), (str: string) => sprintf(str, color)),
    templateId: `cube${color}2In`,
    visible: true,
    editable: true,
    startingOrigin: origin,
    origin
  };
}

const CONE_X = 65;
const CONE_ORIGINS: ReferenceFramewUnits[] = [
  { position: Vector3wUnits.centimeters(CONE_X, -5, 100) },
  { position: Vector3wUnits.centimeters(CONE_X, -5, 161) }
];
const CONES: Dict<Node> = {
  rightCone: {
    type: 'from-bb-template',
    name: tr('Right Traffic Cone'),
    templateId: 'trafficCone',
    visible: true,
    editable: true,
    startingOrigin: CONE_ORIGINS[0],
    origin: CONE_ORIGINS[0]
  },
  leftCone: {
    type: 'from-bb-template',
    name: tr('Left Traffic Cone'),
    templateId: 'trafficCone',
    visible: true,
    editable: true,
    startingOrigin: CONE_ORIGINS[1],
    origin: CONE_ORIGINS[1]
  }
};
const DROPPER_X = 106;
const DROPPER_Y = 4;
const DROPPER1_Z = -16.8;
const DROPPER1_ORIENTATION = RotationwUnits.eulerDegrees(0, 0, 0);
const DROPPER2_ORIENTATION = RotationwUnits.eulerDegrees(0, 180, 0);
const DROPPER1_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(DROPPER_X, DROPPER_Y, DROPPER1_Z),
  orientation: DROPPER1_ORIENTATION
};
const DROPPER2_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(DROPPER_X, DROPPER_Y, DROPPER1_Z + 233.7),
  orientation: DROPPER2_ORIENTATION
};
const DROPPERS: Dict<Node.FromBBTemplate> = {
  dropper1: {
    type: 'from-bb-template',
    name: tr('Dropper #1'),
    templateId: 'dropper26',
    visible: true,
    editable: true,
    origin: DROPPER1_ORIGIN,
    startingOrigin: DROPPER1_ORIGIN
  },
  dropper2: {
    type: 'from-bb-template',
    name: tr('Dropper #2'),
    templateId: 'dropper26',
    visible: true,
    editable: true,
    origin: DROPPER2_ORIGIN,
    startingOrigin: DROPPER2_ORIGIN
  }
};

const PVC_LEFT_X = 108;
const PVC_LEFT_Y = -0.5;
const PVC_LEFT_Z = -14;
const PVC1_ORIENTATION = RotationwUnits.eulerDegrees(0, 0, 90);
const PVC_LEFT_1_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(PVC_LEFT_X, PVC_LEFT_Y, PVC_LEFT_Z),
  orientation: PVC1_ORIENTATION
};
const PVC_OFFSET_CM_VALUES: [number, number, number][] = [
  [0, 0, -1.8],
  [0, 1.5, -4.75],
  [0, 3.5, -7.5],
  [0, 7, -7.75],
  [0, 10, -7.75],
  [0, 12.5, -5.25],
  [0, 12.75, -1.5],
  [0, 13.5, 3]
];
const PVC_LEFT_ORIGINS: ReferenceFramewUnits[] = PVC_OFFSET_CM_VALUES.map(
  ([x, y, z]) => ({
    position: Vector3wUnits.add(
      PVC_LEFT_1_ORIGIN.position,
      Vector3wUnits.centimeters(x, y, z)
    ),
    orientation: PVC1_ORIENTATION
  })
).sort((_a, _b) => Math.random() - 0.5);

const PVC_TEMPLATES = ['pvc2inBlue', 'pvc2inPink'];
const PVCS_LEFT: Dict<Node> = {};
for (const [i, origin] of PVC_LEFT_ORIGINS.entries()) {
  PVCS_LEFT[`pvc${i}_left`] = {
    type: 'from-bb-template',
    name: tr('PVC'),
    templateId: PVC_TEMPLATES[i % 2],
    visible: true,
    editable: true,
    origin,
    startingOrigin: origin
  };
}
const PVC_RIGHT_X = 108;
const PVC_RIGHT_Y = -0.5;
const PVC_RIGHT_Z = 214;
const PVC_RIGHT_1_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(PVC_RIGHT_X, PVC_RIGHT_Y, PVC_RIGHT_Z),
  orientation: PVC1_ORIENTATION
};
const PVC_RIGHT_ORIGINS: ReferenceFramewUnits[] = PVC_OFFSET_CM_VALUES.map(
  ([x, y, z]) => ({
    position: Vector3wUnits.add(
      PVC_RIGHT_1_ORIGIN.position,
      Vector3wUnits.centimeters(x, y, -1 * z)
    ),
    orientation: PVC1_ORIENTATION
  })
).sort((_a, _b) => Math.random() - 0.5);
const PVCS_RIGHT: Dict<Node> = {};
for (const [i, origin] of PVC_RIGHT_ORIGINS.entries()) {
  PVCS_RIGHT[`pvc${i}_right`] = {
    type: 'from-bb-template',
    name: tr('PVC'),
    templateId: PVC_TEMPLATES[i % 2],
    visible: true,
    editable: true,
    origin,
    startingOrigin: origin
  };
}

const GATE_LEFT_X = 106;
const GATE_LEFT_Y = -2;
const GATE_LEFT_Z = -13;
const GATE1_ORIENTATION = RotationwUnits.eulerDegrees(120, 0, 0);
const GATE_LEFT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(GATE_LEFT_X, GATE_LEFT_Y, GATE_LEFT_Z),
  orientation: GATE1_ORIENTATION
};
const GATE_OFFSET_CM_VALUES: [number, number, number][] = [
  [0, 1, -1.5],
  [0, 2, -4.75],
  [0, 3.25, -8],
  [0, 6.5, -8.5],
  [0, 9.75, -8.5],
  [0, 12.5, -7.25],
  [0, 13, -4.3],
  [0, 14, -0.5]
];
const GATE_ORIENTATIONS: number[] = [
  120,
  120,
  135,
  0,
  0,
  45,
  90,
  90,
];
const GATE_LEFT_ORIGINS: ReferenceFramewUnits[] = GATE_OFFSET_CM_VALUES.map(
  ([x, y, z], i) => ({
    position: Vector3wUnits.add(
      GATE_LEFT_ORIGIN.position,
      Vector3wUnits.centimeters(x, y, z)
    ),
    orientation: RotationwUnits.eulerDegrees(GATE_ORIENTATIONS[i], 0, 0)
  })
);

const GATES_LEFT: Dict<Node> = {};
for (const [i, origin] of GATE_LEFT_ORIGINS.entries()) {
  GATES_LEFT[`gate_left${i}`] = {
    type: 'from-bb-template',
    name: tr('Gate'),
    templateId: 'gate',
    visible: true,
    editable: true,
    origin,
    startingOrigin: origin
  };
}

const GATE_RIGHT_X = 106;
const GATE_RIGHT_Y = -2;
const GATE_RIGHT_Z = 213;
const GATE_RIGHT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(GATE_RIGHT_X, GATE_RIGHT_Y, GATE_RIGHT_Z),
  orientation: GATE1_ORIENTATION
};
const GATE_RIGHT_ORIGINS: ReferenceFramewUnits[] = GATE_OFFSET_CM_VALUES.map(
  ([x, y, z], i) => ({
    position: Vector3wUnits.add(
      GATE_RIGHT_ORIGIN.position,
      Vector3wUnits.centimeters(x, y, -1 * z)
    ),
    orientation: RotationwUnits.eulerDegrees(180 - GATE_ORIENTATIONS[i], 0, 0)
  })
);
const GATES_RIGHT: Dict<Node> = {};
for (const [i, origin] of GATE_RIGHT_ORIGINS.entries()) {
  GATES_RIGHT[`gate${i}_right`] = {
    type: 'from-bb-template',
    name: tr('Gate'),
    templateId: 'gate',
    visible: true,
    editable: true,
    origin,
    startingOrigin: origin
  };
}

const DROPPER = `
${setNodeVisible}

// After ten seconds, hide each left/right gate pair for one second every seven seconds (one pair at a time)
const intervalMs = 7000;
const hiddenDurationMs = 1100;
const gateDurationsMs = [
  900, // gate0
  1000, // gate1
  600,  // gate2 (shortened)
  400,  // gate3 (shortened)
  400,  // gate4 (shortened)
  hiddenDurationMs, // gate5
  hiddenDurationMs, // gate6
  hiddenDurationMs, // gate7
];
const gatePairs = gateDurationsMs.map((_duration, index) => [
  'gate_left' + index,
  'gate' + index + '_right',
]);
const setGatePairVisible = (gateIndex, visible) => {
  gatePairs[gateIndex].forEach((nodeId) => setNodeVisible(nodeId, visible));
};

let startTimeMs = Date.now();
let currentGateIndex = null;
let hideStartMs = null;
let waitingComplete = false;
let inCycle = false;
let nextGate0Time = null;

scene.addOnRenderListener(() => {
  let now = Date.now();

  if (!waitingComplete) {
    if (now - startTimeMs >= 10000) {
      waitingComplete = true;
      nextGate0Time = now;
    }
    return;
  }

  if (!inCycle && nextGate0Time !== null && now >= nextGate0Time) {
    inCycle = true;
    currentGateIndex = 0;
    hideStartMs = now;
    setGatePairVisible(currentGateIndex, false);
    nextGate0Time += intervalMs;
  }

  while (inCycle && currentGateIndex !== null && hideStartMs !== null && now - hideStartMs >= gateDurationsMs[currentGateIndex]) {
    setGatePairVisible(currentGateIndex, true);
    currentGateIndex++;

    if (currentGateIndex >= gatePairs.length) {
      inCycle = false;
      currentGateIndex = null;
      hideStartMs = null;
      break;
    }

    // Immediately hide the next gate
    hideStartMs = now = Date.now();
    setGatePairVisible(currentGateIndex, false);
  }
});
`;

export const SPRING_26_SANDBOX: Scene = {
  ...baseScene,
  name: tr('2026 Spring Game Table'),
  description: tr('2026 Spring Botball game table sandbox'),
  geometry: {
    ...baseScene.geometry,
  },
  scripts: {
    dropper: Script.ecmaScript('Dropper Script', DROPPER)
  },
  nodes: {
    ...baseScene.nodes,
    ...DOORS,
    ...loBluePoms,
    ...loOrangePoms,
    ...hiBluePoms,
    ...hiOrangePoms,
    ...BASKETS,
    ...LOW_2IN_CUBES,
    ...pallets,
    ...YELLOW_2IN_CUBES,
    ...BROWN_CUBES,
    ...RAND_4IN_CUBES,
    ...NEAR_STACK,
    ...FAR_STACK,
    ...CONES,
    ...DROPPERS,
    ...PVCS_LEFT,
    ...PVCS_RIGHT,
    ...GATES_LEFT,
    ...GATES_RIGHT,
    BOTGUY
  }
};
