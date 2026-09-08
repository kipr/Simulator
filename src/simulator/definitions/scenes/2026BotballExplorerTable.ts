import { PhysicsMotionType } from '@babylonjs/core';

import Geometry from '../../../state/State/Scene/Geometry';
import Node from '../../../state/State/Scene/Node';
import Dict from '../../../util/objectOps/Dict';
import { RawQuaternion, RawVector3 } from '../../../util/math/math';
import {
  ReferenceFramewUnits,
  RotationwUnits,
  Vector3wUnits,
} from '../../../util/math/unitMath';
import tr from '@i18n';

const TABLE_POSITION = RawVector3.create(75, -4, 100);
const TABLE_ROTATION = RawQuaternion.create(0, 1, 0, 0);
const IDENTITY_ROTATION = RawQuaternion.IDENTITY;

// Babylon world units in this simulator are centimeters. Preserve the layout
// export's numeric transforms as centimeter values; applying glTF's nominal
// meter conversion here would reproduce the reported 100x mismatch. Repeated
// placements were recovered from the complete previous export and shifted by
// the uniform offset measured from the four objects retained in the update.

const normalizeQuaternion = (q: RawQuaternion): RawQuaternion => RawQuaternion.normalize(q);

const multiplyQuaternions = (lhs: RawQuaternion, rhs: RawQuaternion): RawQuaternion => ({
  x: lhs.w * rhs.x + lhs.x * rhs.w + lhs.y * rhs.z - lhs.z * rhs.y,
  y: lhs.w * rhs.y - lhs.x * rhs.z + lhs.y * rhs.w + lhs.z * rhs.x,
  z: lhs.w * rhs.z + lhs.x * rhs.y - lhs.y * rhs.x + lhs.z * rhs.w,
  w: lhs.w * rhs.w - lhs.x * rhs.x - lhs.y * rhs.y - lhs.z * rhs.z,
});

/** Convert a table-local, centimeter pose to the world pose formerly supplied by the table node. */
const tableOrigin = (
  position: RawVector3,
  orientation: RawQuaternion = IDENTITY_ROTATION,
  scale: RawVector3 = RawVector3.ONE,
): ReferenceFramewUnits => ({
  position: Vector3wUnits.centimeters(
    TABLE_POSITION.x - position.x,
    TABLE_POSITION.y + position.y,
    TABLE_POSITION.z - position.z,
  ),
  orientation: RotationwUnits.fromRawQuaternion(
    normalizeQuaternion(multiplyQuaternions(TABLE_ROTATION, orientation)),
    'axis-angle',
  ),
  scale,
});

const STATIC_MESH: Node.Physics = {
  type: 'mesh',
  motionType: PhysicsMotionType.STATIC,
  restitution: 0.2,
  friction: 1,
};

const STATIC_BOX: Node.Physics = {
  ...STATIC_MESH,
  type: 'box',
};

const component = (
  name: string,
  geometryId: string,
  position: RawVector3,
  orientation: RawQuaternion = IDENTITY_ROTATION,
  scale: RawVector3 = RawVector3.ONE,
  physics: Node.Physics = STATIC_MESH,
): Node.Obj => ({
  type: 'object',
  name: tr(name),
  geometryId,
  physics,
  visible: true,
  editable: false,
  startingOrigin: tableOrigin(position, orientation, scale),
  origin: tableOrigin(position, orientation, scale),
});

// pipe.glb is centered at its origin and authored along Z as the full long run.
const PIPE_MESH_LENGTH_CM = 225.750;

const pipe = (
  name: string,
  center: RawVector3,
  lengthCm: number,
  orientation: RawQuaternion = IDENTITY_ROTATION,
): Node.Obj => {
  const scale = RawVector3.create(1, 1, lengthCm / PIPE_MESH_LENGTH_CM);
  return component(
    name,
    'botballExplorerTable26_pvc',
    center,
    orientation,
    scale,
  );
};

export const BOTBALL_EXPLORER_TABLE_26_GEOMETRY: Dict<Geometry> = {
  botballExplorerTable26_2x4: {
    type: 'file',
    uri: '/static/object_binaries/build_components/2x4.glb',
    resetPosition: true,
  },
  botballExplorerTable26_loadingDock: {
    type: 'file',
    uri: '/static/object_binaries/build_components/loading_dock.glb',
    resetPosition: true,
  },
  botballExplorerTable26_particleBoard: {
    type: 'file',
    uri: '/static/object_binaries/build_components/particle_board.glb',
    resetPosition: true,
  },
  botballExplorerTable26_mat: {
    type: 'file',
    uri: '/static/object_binaries/build_components/mat.glb',
    resetPosition: true,
  },
  botballExplorerTable26_elbow: {
    type: 'file',
    uri: '/static/object_binaries/build_components/elbow.glb',
    resetPosition: true,
  },
  botballExplorerTable26_tConnector: {
    type: 'file',
    uri: '/static/object_binaries/build_components/t_connector.glb',
    resetPosition: true,
  },
  botballExplorerTable26_pvc: {
    type: 'file',
    uri: '/static/object_binaries/build_components/pipe.glb',
    resetPosition: true,
  },
};

const ID = IDENTITY_ROTATION;
const Y_90 = RawQuaternion.create(0, Math.SQRT1_2, 0, Math.SQRT1_2);
const Y_180 = RawQuaternion.create(0, 1, 0, 0);
const SHORT_PIPE_LENGTH_CM = 7.620;
const LONG_PIPE_TOP_CM = 66.738 + 68.263 / 2;
const LONG_PIPE_BOTTOM_CM = -124.238;
const LONG_PIPE_LENGTH_CM = LONG_PIPE_TOP_CM - LONG_PIPE_BOTTOM_CM;
const LONG_PIPE_CENTER_CM = (LONG_PIPE_TOP_CM + LONG_PIPE_BOTTOM_CM) / 2;

export const BOTBALL_EXPLORER_TABLE_26_NODES: Dict<Node> = {
  botball_explorer_game_table_2026: {
    ...component(
      '2026 Botball Explorer particle board',
      'botballExplorerTable26_particleBoard',
      RawVector3.create(34.889, -17.609, -5.180),
    ),
    physics: undefined,
  },
  explorer_table_mat: component(
    '2026 Botball Explorer mat',
    'botballExplorerTable26_mat',
    RawVector3.create(34.889, -15.596, -5.180),
    ID,
    RawVector3.ONE,
    STATIC_MESH,
  ),

  explorer_table_2x4_left: component(
    '2026 Botball Explorer left 2x4',
    'botballExplorerTable26_2x4',
    RawVector3.create(34.914, -11.175, 118.675),
    ID,
    RawVector3.ONE,
    STATIC_BOX,
  ),
  explorer_table_2x4_low: component(
    '2026 Botball Explorer lower 2x4',
    'botballExplorerTable26_2x4',
    RawVector3.create(97.766, -11.175, -5.180),
    Y_90,
    RawVector3.create(1.883, 1, 1),
    STATIC_BOX,
  ),
  explorer_table_2x4_right: component(
    '2026 Botball Explorer right 2x4',
    'botballExplorerTable26_2x4',
    RawVector3.create(34.914, -11.175, -129.005),
    ID,
    RawVector3.ONE,
    STATIC_BOX,
  ),
  explorer_table_2x4_top: component(
    '2026 Botball Explorer upper 2x4',
    'botballExplorerTable26_2x4',
    RawVector3.create(-27.842, -11.175, -5.180),
    Y_90,
    RawVector3.create(1.883, 1, 1),
    STATIC_BOX,
  ),

  explorer_table_loading_dock: component(
    '2026 Botball Explorer loading dock',
    'botballExplorerTable26_loadingDock',
    RawVector3.create(0.257, -12.481, 110.760),
    ID,
    RawVector3.ONE,
    STATIC_BOX,
  ),

  explorer_table_elbow_low: component(
    '2026 Botball Explorer lower elbow connector',
    'botballExplorerTable26_elbow',
    RawVector3.create(-17.187, -13.350, -123.290),
    Y_90,
  ),
  explorer_table_elbow_high: component(
    '2026 Botball Explorer upper elbow connector',
    'botballExplorerTable26_elbow',
    RawVector3.create(-17.187, -13.350, 101.559),
  ),

  explorer_table_t_low: component(
    '2026 Botball Explorer lower T connector',
    'botballExplorerTable26_tConnector',
    RawVector3.create(-15.435, -13.350, -47.403),
  ),
  explorer_table_t_high: component(
    '2026 Botball Explorer upper T connector',
    'botballExplorerTable26_tConnector',
    RawVector3.create(-15.435, -13.350, 26.574),
  ),
  explorer_table_pvc_long: pipe(
    '2026 Botball Explorer long PVC',
    RawVector3.create(-15.435, -13.350, LONG_PIPE_CENTER_CM),
    LONG_PIPE_LENGTH_CM,
  ),
  explorer_table_pvc_short_low: pipe(
    '2026 Botball Explorer short lower PVC',
    RawVector3.create(-20.991, -13.350, -43.117),
    SHORT_PIPE_LENGTH_CM,
    Y_90,
  ),
  explorer_table_pvc_short_high: pipe(
    '2026 Botball Explorer short upper PVC',
    RawVector3.create(-20.991, -13.350, 30.860),
    SHORT_PIPE_LENGTH_CM,
    Y_90,
  ),
  explorer_table_pvc_short_top: pipe(
    '2026 Botball Explorer short top PVC',
    RawVector3.create(-20.991, -13.350, 103.304),
    SHORT_PIPE_LENGTH_CM,
    Y_90,
  ),
  explorer_table_pvc_short_bottom: pipe(
    '2026 Botball Explorer short bottom PVC',
    RawVector3.create(-20.991, -13.350, -125.389),
    SHORT_PIPE_LENGTH_CM,
    Y_90,
  ),
};
