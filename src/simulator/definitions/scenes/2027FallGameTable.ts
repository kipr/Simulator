import { PhysicsMotionType } from '@babylonjs/core';

import Geometry from '../../../state/State/Scene/Geometry';
import Node from '../../../state/State/Scene/Node';
import Dict from '../../../util/objectOps/Dict';
import { Mass } from '../../../util';
import { RawQuaternion, RawVector3 } from '../../../util/math/math';
import {
  ReferenceFramewUnits,
  RotationwUnits,
  Vector3wUnits,
} from '../../../util/math/unitMath';
import tr from '@i18n';
import { MODELS } from '../models';

/**
 * 2026-2027 Botball fall game table, built from the building materials in
 * MODELS.common.building and the game pieces in MODELS.games[2027]. Positions
 * come from the reference model static/object_binaries/games/2027/full_table.glb
 * (not loaded by the simulator).
 *
 * Coordinates below are centimeters in the reference model's frame: the table
 * covers x -121.92..0 and z -121.92..121.92, and the playing surface (top of
 * the FRP) is at y = 2.12.
 *
 * The robot stays at the world origin with no rotation, so the whole table is
 * placed around it: FALL_27_ROBOT_START_* (in table coordinates) is the pose
 * that ends up at the origin. Change it to move or turn every table part and
 * game piece together.
 */

const H = Math.SQRT1_2;
const q = RawQuaternion.create;
const ID = RawQuaternion.IDENTITY;

type Vec3 = [number, number, number];

/** Robot origin in the starting box, in table coordinates. */
export const FALL_27_ROBOT_START_POSITION = RawVector3.create(-101.42, 9.72, 30);
/** Robot heading in the starting box: +90 degrees about y. */
export const FALL_27_ROBOT_START_ROTATION = q(0, H, 0, H);

// RawQuaternion.multiply is not a standard Hamilton product, so use our own.
const multiply = (l: RawQuaternion, r: RawQuaternion): RawQuaternion => ({
  x: l.w * r.x + l.x * r.w + l.y * r.z - l.z * r.y,
  y: l.w * r.y - l.x * r.z + l.y * r.w + l.z * r.x,
  z: l.w * r.z + l.x * r.y - l.y * r.x + l.z * r.w,
  w: l.w * r.w - l.x * r.x - l.y * r.y - l.z * r.z,
});

const rotate = (v: RawVector3, r: RawQuaternion): RawVector3 => {
  const p = multiply(multiply(r, { ...v, w: 0 }), { x: -r.x, y: -r.y, z: -r.z, w: r.w });
  return RawVector3.create(p.x, p.y, p.z);
};

// Undoes the robot's start rotation, so the robot ends up unrotated.
const TABLE_ROTATION = RawQuaternion.normalize({
  x: -FALL_27_ROBOT_START_ROTATION.x,
  y: -FALL_27_ROBOT_START_ROTATION.y,
  z: -FALL_27_ROBOT_START_ROTATION.z,
  w: FALL_27_ROBOT_START_ROTATION.w,
});

/** World position (centimeters) of a point given in table coordinates. */
export const fall27TablePoint = ([x, y, z]: Vec3): RawVector3 => rotate(
  RawVector3.create(
    x - FALL_27_ROBOT_START_POSITION.x,
    y - FALL_27_ROBOT_START_POSITION.y,
    z - FALL_27_ROBOT_START_POSITION.z,
  ),
  TABLE_ROTATION,
);

/** Center of the playing surface, in world coordinates. */
export const FALL_27_TABLE_CENTER = fall27TablePoint([-60.96, 2.12, 0]);

export const fall27TableOrigin = (
  position: Vec3,
  orientation: RawQuaternion = ID,
  scale: RawVector3 = RawVector3.ONE,
): ReferenceFramewUnits => {
  const p = fall27TablePoint(position);
  return {
    position: Vector3wUnits.centimeters(p.x, p.y, p.z),
    orientation: RotationwUnits.fromRawQuaternion(
      RawQuaternion.normalize(multiply(TABLE_ROTATION, orientation)),
      'axis-angle',
    ),
    scale,
  };
};

// Everything starts asleep, so Havok skips the game pieces until the robot or
// another moving piece touches them. Static parts need it too: an awake static
// body wakes the sleeping pieces resting on it.
const STATIC_MESH: Node.Physics = {
  type: 'mesh',
  motionType: PhysicsMotionType.STATIC,
  restitution: 0.2,
  friction: 1,
  startAsleep: true,
};

const STATIC_BOX: Node.Physics = { ...STATIC_MESH, type: 'box' };

const dynamic = (type: Node.Physics.Type, grams: number, friction: number, restitution = 0.2): Node.Physics => ({
  type,
  motionType: PhysicsMotionType.DYNAMIC,
  mass: Mass.grams(grams),
  friction,
  restitution,
  startAsleep: true,
});

// Masses are estimates.
// Each pom_*.glb has a node named "collider", used as a convex hull. The
// colliders are all the same shape, so any pom's will do.
const POM_PHYSICS: Node.Physics = { ...dynamic('none', 10, 5), colliderId: 'collider' };
const DUCK_PHYSICS = dynamic('box', 10, 1);
const BIG_DUCK_PHYSICS = dynamic('box', 40, 1);
const PICKLEBALL_PHYSICS = dynamic('sphere', 26, 1, 0.3);
// Rings sit around PVC posts, so they need a hollow shape. A loop of capsules
// keeps the hole and, unlike a mesh collider, is cheap and collides with other
// rings.
const RING_PHYSICS = dynamic('torus', 5, 1);
// Cups cover poms, so they also need their real (hollow) shape. Havok does not
// collide two dynamic mesh bodies, so cups pass through each other.
const CUP_PHYSICS = dynamic('mesh', 10, 1);
const BOTTLE_PHYSICS = dynamic('cylinder', 20, 1);

const object = (
  name: string,
  geometryId: string,
  physics: Node.Physics | undefined,
  origin: ReferenceFramewUnits,
  editable = false,
): Node.Obj => ({
  type: 'object',
  name: tr(name),
  geometryId,
  physics,
  visible: true,
  editable,
  startingOrigin: origin,
  origin,
});

const POM_COLORS = ['gold', 'green', 'lavender', 'red', 'turquoise'] as const;
type PomColor = typeof POM_COLORS[number];
const DUCK_COLORS = ['blue', 'green', 'lavender', 'red', 'yellow'] as const;
type DuckColor = typeof DUCK_COLORS[number];

const pomGeometryId = (color: PomColor) => `fall27_pom_${color}`;
const duckGeometryId = (color: DuckColor) => `fall27_duck_${color}`;

const BUILDING = MODELS.common.building;
const PIECES = MODELS.games[2027];

const file = (uri: string): Geometry => ({
  type: 'file',
  uri,
  resetPosition: true,
});

// Every node using the same geometry is drawn as an instance of one mesh.
export const FALL_27_TABLE_GEOMETRY: Dict<Geometry> = {
  fall27_particleBoard: file(BUILDING.particleBoard),
  fall27_frp: file(BUILDING.frp4x8),
  fall27_corrugatedPlastic: file(BUILDING.corrugatedPlastic),
  fall27_tape: file(BUILDING.tapeBlack8ft),
  fall27_pvc: file(BUILDING.pvcPipe),
  fall27_elbow: file(BUILDING.pvcElbow),
  fall27_tConnector: file(BUILDING.pvcTConnector),
  fall27_bottle: file(PIECES.bottle),
  fall27_cup: file(PIECES.cupBlack),
  fall27_pickleball: file(PIECES.pickleball),
  fall27_ring: file(PIECES.ring),
  fall27_duckBig: file(PIECES.duckBig),
  ...Object.fromEntries(POM_COLORS.map(color => [pomGeometryId(color), file(PIECES.pom[color])])),
  ...Object.fromEntries(DUCK_COLORS.map(color => [duckGeometryId(color), file(PIECES.duck[color])])),
};

// ---------------------------------------------------------------------------
// Table structure
// ---------------------------------------------------------------------------

// Mesh sizes of the source models, used to scale them to the reference parts.
const PARTICLE_BOARD_MESH_CM = RawVector3.create(129.2419, 1.905, 251.416);
const PVC_MESH_LENGTH_CM = 225.75; // along z
const TAPE_MESH_LENGTH_CM = 237.4922; // along z
const CORRUGATED_MESH_WIDTH_CM = 31.75; // along x once loaded

const INCH_CM = 2.54;

type Axis = 'x' | 'y' | 'z';
// pvc_pipe.glb runs along z; these rotate it onto each axis.
const PVC_AXIS_ROTATION: Record<Axis, RawQuaternion> = {
  x: q(0, H, 0, H),
  y: q(-H, 0, 0, H),
  z: ID,
};

// [length (inches), axis, center]
const PVC: [number, Axis, Vec3][] = [
  [1.75, 'z', [-119.86, 4.19, 115.89]],
  [1.75, 'z', [-92.23, 4.19, 115.89]],
  [1.75, 'z', [-14.45, 4.19, 18.78]],
  [1.75, 'x', [-115.25, 4.19, -119.86]],
  [2.5, 'y', [-119.86, 9.11, 111.28]],
  [2.5, 'y', [-119.86, 9.11, 63.02]],
  [2.5, 'y', [-92.23, 9.11, 63.02]],
  [2.5, 'y', [-92.23, 9.11, 111.28]],
  [2.5, 'z', [-111.28, 4.19, -114.94]],
  [2.5, 'z', [-87.47, 4.19, -114.94]],
  [8, 'x', [-99.38, 4.19, -119.86]],
  [8, 'x', [-99.38, 4.19, -110.01]],
  [8, 'y', [-119.86, 16.1, -62.71]],
  [8, 'y', [-53.5, 16.1, -119.86]],
  [9.5, 'x', [-106.05, 14.03, 63.02]],
  [9.5, 'x', [-106.05, 14.03, 111.28]],
  [9.5, 'x', [-106.05, 4.19, 119.86]],
  [9.5, 'z', [-14.45, 4.19, 36.83]],
  [10, 'z', [-14.45, 4.19, 0]],
  [12, 'x', [-70.48, 4.19, -119.86]],
  [12.875, 'z', [-14.45, 4.19, -32.54]],
  [13.875, 'x', [-72.87, 4.19, 119.86]],
  [14, 'x', [-33.97, 4.19, 119.86]],
  [14, 'x', [-33.97, 4.19, -119.86]],
  [17.625, 'z', [-119.86, 4.19, 87.15]],
  [17.625, 'z', [-92.23, 4.19, 87.15]],
  [21.125, 'z', [-119.86, 4.19, -91.28]],
  [23.375, 'z', [-119.86, 4.19, 31.59]],
  [23.375, 'z', [-119.86, 4.19, -31.27]],
  [25.875, 'z', [-14.45, 4.19, 85.25]],
  [25.875, 'z', [-14.45, 4.19, -85.25]],
];

const ELBOWS: [Vec3, RawQuaternion][] = [
  [[-118.11, 4.19, 118.11], q(0, 0, 1, 0)],
  [[-118.11, 12.29, 63.02], q(0, H, H, 0)],
  [[-118.11, 12.29, 111.28], q(0, H, H, 0)],
  [[-93.98, 12.29, 111.28], q(-H, 0, 0, H)],
  [[-93.98, 12.29, 63.02], q(-H, 0, 0, H)],
  [[-92.23, 5.94, 64.77], q(0.5, 0.5, -0.5, 0.5)],
  [[-118.11, 4.19, -118.11], q(0, 1, 0, 0)],
  [[-89.22, 4.19, -111.76], ID],
  [[-109.54, 4.19, -111.76], q(0, 0, 1, 0)],
];

const T_CONNECTORS: [Vec3, RawQuaternion][] = [
  [[-119.86, 4.19, -4.13], q(0, 0, -H, H)],
  [[-119.86, 4.19, -66.99], q(0, 0, -H, H)],
  [[-119.86, 4.19, 58.74], q(0, 0, -H, H)],
  [[-119.86, 4.19, 107], q(0, 0, -H, H)],
  [[-92.23, 4.19, 107], q(0, 0, -H, H)],
  [[-96.52, 4.19, 119.86], q(H, 0, H, 0)],
  [[-91.76, 4.19, -119.86], q(0, H, 0, H)],
  [[-18.73, 4.19, 119.86], q(H, 0, H, 0)],
  [[-14.45, 4.19, 18.73], q(0, 1, 0, 0)],
  [[-14.45, 4.19, 18.73], q(0, 0, -H, H)],
  [[-14.45, 4.19, 46.36], q(0, 0, -H, H)],
  [[-14.45, 4.19, -18.73], q(0, 0, 1, 0)],
  [[-18.73, 4.19, -119.86], q(0, H, 0, H)],
  [[-115.57, 4.19, -119.86], q(0, H, 0, H)],
  [[-14.45, 4.19, -54.93], q(0, 0, 1, 0)],
  [[-57.78, 4.19, -119.86], q(-0.5, 0.5, -0.5, 0.5)],
  [[-57.78, 4.19, 119.86], q(-0.5, 0.5, -0.5, 0.5)],
];

// [length (inches), center, rotation]
const TAPE: [number, Vec3, RawQuaternion][] = [
  [12, [-104.87, 2.14, 58.58], q(0, -H, 0, H)],
  [41.5, [-68.8, 2.14, 0.16], q(0, -H, 0, H)],
  [89.5, [-87.25, 2.14, 4.54], ID],
  [93.5, [-53.59, 2.14, -0.54], ID],
];

const tableNodes: Dict<Node> = {
  fall27_particle_board: object(
    'Particle Board',
    'fall27_particleBoard',
    STATIC_BOX,
    fall27TableOrigin([-60.96, 0.03, 0], q(0, 1, 0, 0), RawVector3.create(
      121.92 / PARTICLE_BOARD_MESH_CM.x,
      1.905 / PARTICLE_BOARD_MESH_CM.y,
      243.84 / PARTICLE_BOARD_MESH_CM.z,
    )),
  ),
  fall27_frp: object('FRP Surface', 'fall27_frp', STATIC_BOX, fall27TableOrigin([-60.96, 2.03, 0])),
  fall27_platform: object(
    'Platform (12.5x24 in)',
    'fall27_corrugatedPlastic',
    STATIC_BOX,
    fall27TableOrigin([-106.04, 16.33, 91.44]),
  ),
  fall27_platform_side: object(
    'Platform Side (5.5x24 in)',
    'fall27_corrugatedPlastic',
    STATIC_BOX,
    fall27TableOrigin(
      [-89.93, 9.11, 91.44],
      q(H, H, 0, 0),
      RawVector3.create(5.5 * INCH_CM / CORRUGATED_MESH_WIDTH_CM, 1, 1),
    ),
  ),
};

PVC.forEach(([inches, axis, center], i) => {
  tableNodes[`fall27_pvc_${i}`] = object(
    `PVC (${inches} in) #${i + 1}`,
    'fall27_pvc',
    STATIC_MESH,
    fall27TableOrigin(
      center,
      PVC_AXIS_ROTATION[axis],
      RawVector3.create(1, 1, inches * INCH_CM / PVC_MESH_LENGTH_CM),
    ),
  );
});

ELBOWS.forEach(([position, rotation], i) => {
  tableNodes[`fall27_elbow_${i}`] = object(
    `Elbow Connector #${i + 1}`,
    'fall27_elbow',
    STATIC_MESH,
    fall27TableOrigin(position, rotation),
  );
});

T_CONNECTORS.forEach(([position, rotation], i) => {
  tableNodes[`fall27_t_connector_${i}`] = object(
    `T Connector #${i + 1}`,
    'fall27_tConnector',
    STATIC_MESH,
    fall27TableOrigin(position, rotation),
  );
});

// Tape is visual only.
TAPE.forEach(([inches, center, rotation], i) => {
  tableNodes[`fall27_tape_${i}`] = object(
    `Black Tape (${inches} in)`,
    'fall27_tape',
    undefined,
    fall27TableOrigin(center, rotation, RawVector3.create(1, 1, inches * INCH_CM / TAPE_MESH_LENGTH_CM)),
  );
});

// Keep fixed structure out of the World list while retaining the full simulation.
export const FALL_27_TABLE_NODES: Dict<Node> = Dict.map(tableNodes, node => ({
  ...node,
  hiddenInWorldList: true,
}));

// ---------------------------------------------------------------------------
// Game pieces
// ---------------------------------------------------------------------------

// pom_*.glb is 3 in across; the reference poms are 1.5 in.
const POM_SCALE = RawVector3.create(0.5, 0.5, 0.5);

// [center, rotation]
type Pose = [Vec3, RawQuaternion];

// Each pyramid is three poms on the floor with one on top, laid out as in the
// reference: offsets from the top pom's center, and rotations. The pom
// colliders fit inside the poms, so each pom is lowered onto its collider's
// support (the tilted one sits lower). A pyramid of round colliders slumps
// once woken, but it starts asleep and holds its shape until touched.
const PYRAMID: Pose[] = [
  [[-1.69, -2.26, 1.42], q(0, -0.6457, 0, 0.7636)],
  [[2.06, -2.26, 0.76], ID],
  [[-0.38, -2.51, -2.16], q(-0.015, -0.0842, -0.2208, 0.9716)],
  [[0, 0, 0], ID],
];
const pyramid = ([x, y, z]: Vec3): Pose[] => PYRAMID.map(
  ([[dx, dy, dz], rotation]): Pose => [[x + dx, y + dy, z + dz], rotation],
);

// Single-color pyramids on the tape line, by top pom.
const linePyramid = (z: number) => pyramid([-53.59, 6.29, z]);
// The pyramid under the cup at (-53.6, 0.15) mixes colors.
const CUP_PYRAMID = pyramid([-53.49, 6.29, 0.23]);

const POMS: Record<PomColor, Pose[]> = {
  gold: [...linePyramid(-97.89), CUP_PYRAMID[1]],
  green: [...linePyramid(-36.93), CUP_PYRAMID[0]],
  lavender: [...linePyramid(-57.25), CUP_PYRAMID[2]],
  red: [...linePyramid(-16.61), [[-87.98, 4.03, -0.45], ID]], // under the other cup
  turquoise: [...linePyramid(-77.57), CUP_PYRAMID[3]],
};

const DUCKS: Record<DuckColor, Vec3> = {
  red: [-53.6, 3.98, 17.93],
  green: [-53.6, 3.98, 38.25],
  lavender: [-53.6, 3.98, 58.57],
  blue: [-53.6, 3.98, 78.89],
  yellow: [-53.6, 3.98, 99.21],
};

// Pieces start asleep and don't fall until something touches them, so these
// are poses where they already rest: heights are where they settle in the
// simulator, which can differ from the reference model.

// Stacked on top of the upright fitting sockets at the foot of each post.
// The socket tops are at y = 8.47 cm. Lowering the rings to the horizontal
// tube's height embeds them in the sockets; waking the stack then ejects them.
const RINGS: Vec3[] = [
  [-53.5, 8.84, -119.86],
  [-53.5, 9.76, -119.86],
  [-53.5, 10.67, -119.86],
  [-119.86, 8.84, -62.71],
  [-119.86, 9.76, -62.71],
  [-119.86, 10.67, -62.71],
];

// Balanced on top of PVC. Once woken, they roll off.
const PICKLEBALLS: Vec3[] = [
  [-14.45, 9.95, 23.02],
  [-14.45, 9.95, 50.64],
  [-53.5, 9.95, 119.86],
  [-119.86, 9.95, 0.16],
];

// Centered between the two PVC rails. The outer two still overlap the elbow
// sockets by about 3 mm (the gap there is 6.0 cm, the bottles 6.4 cm), so they
// pop out once woken.
const BOTTLES: Vec3[] = [
  [-92.4, 7.53, -114.94],
  [-99.38, 7.53, -114.94],
  [-106.37, 7.53, -114.94],
];

// Upside down (baked into cup_black.glb), each covering poms.
const CUPS: Vec3[] = [
  [-87.34, 11.54, 0.06],
  [-53.6, 11.54, 0.15],
];

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

const BOTGUY_ORIGIN = fall27TableOrigin([-10.45, 12.06, -0.01], q(0, H, 0, H));

const gamePieces: Dict<Node> = {
  fall27_big_duck: object(
    'Big Duck',
    'fall27_duckBig',
    BIG_DUCK_PHYSICS,
    fall27TableOrigin([-107.28, 21.74, 67.37]),
    true,
  ),
  fall27_botguy: {
    type: 'from-bb-template',
    name: tr('Botguy'),
    templateId: 'botguy_gamepiece',
    visible: true,
    editable: true,
    startingOrigin: BOTGUY_ORIGIN,
    origin: BOTGUY_ORIGIN,
  },
};

POM_COLORS.forEach(color => {
  POMS[color].forEach(([position, orientation], i) => {
    gamePieces[`fall27_pom_${color}_${i}`] = object(
      `${capitalize(color)} Pom #${i + 1}`,
      pomGeometryId(color),
      POM_PHYSICS,
      fall27TableOrigin(position, orientation, POM_SCALE),
      true,
    );
  });
});

DUCK_COLORS.forEach(color => {
  gamePieces[`fall27_duck_${color}`] = object(
    `${capitalize(color)} Duck`,
    duckGeometryId(color),
    DUCK_PHYSICS,
    fall27TableOrigin(DUCKS[color]),
    true,
  );
});

const addPieces = (key: string, name: string, geometryId: string, physics: Node.Physics, positions: Vec3[]) => {
  positions.forEach((position, i) => {
    gamePieces[`fall27_${key}_${i}`] = object(
      `${name} #${i + 1}`,
      geometryId,
      physics,
      fall27TableOrigin(position),
      true,
    );
  });
};

addPieces('ring', 'Ring', 'fall27_ring', RING_PHYSICS, RINGS);
addPieces('pickleball', 'Pickleball', 'fall27_pickleball', PICKLEBALL_PHYSICS, PICKLEBALLS);
addPieces('bottle', 'Blue Bottle', 'fall27_bottle', BOTTLE_PHYSICS, BOTTLES);
addPieces('cup', 'Black Cup', 'fall27_cup', CUP_PHYSICS, CUPS);

export const FALL_27_GAME_PIECE_NODES: Dict<Node> = gamePieces;
