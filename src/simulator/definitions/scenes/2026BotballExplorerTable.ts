import { PhysicsMotionType } from '@babylonjs/core';

import Geometry from '../../../state/State/Scene/Geometry';
import Node from '../../../state/State/Scene/Node';
import { Color } from '../../../state/State/Scene/Color';
import Dict from '../../../util/objectOps/Dict';
import { Distance } from '../../../util';
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

const STATIC_CYLINDER: Node.Physics = {
  ...STATIC_MESH,
  type: 'cylinder',
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

const EXPLORER_PVC_MATERIAL: Node.Obj['material'] = {
  type: 'basic',
  color: {
    type: 'color3',
    color: Color.rgb(242, 242, 238),
  },
};

const PVC_RADIUS_CM = 1.651;
const PVC_REFERENCE_LENGTH_CM = 7.62;

const pipeCenter = (
  origin: RawVector3,
  rotation: RawQuaternion,
  centerAlongLocalXCm: number,
): RawVector3 => RawVector3.add(
  origin,
  RawVector3.applyQuaternion(RawVector3.create(centerAlongLocalXCm, 0, 0), rotation),
);

/** Quaternion rotating Babylon's cylinder Y axis onto the source model's local X axis. */
const pipeRotation = (sourceRotation: RawQuaternion): RawQuaternion => {
  const axis = RawVector3.normalize(
    RawVector3.applyQuaternion(RawVector3.create(1, 0, 0), sourceRotation),
  );
  return normalizeQuaternion(RawQuaternion.create(axis.z, 0, -axis.x, 1 + axis.y));
};

const pipe = (
  name: string,
  sourceOrigin: RawVector3,
  sourceRotation: RawQuaternion,
  lengthCm: number,
  centerAlongLocalXCm: number,
): Node.Obj => {
  const ret = component(
    name,
    'botballExplorerTable26_pvc',
    pipeCenter(sourceOrigin, sourceRotation, centerAlongLocalXCm),
    pipeRotation(sourceRotation),
    RawVector3.create(1, lengthCm / PVC_REFERENCE_LENGTH_CM, 1),
    STATIC_CYLINDER,
  );
  ret.material = EXPLORER_PVC_MATERIAL;
  return ret;
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
    type: 'cylinder',
    radius: Distance.centimeters(PVC_RADIUS_CM),
    height: Distance.centimeters(PVC_REFERENCE_LENGTH_CM),
  },
};

const ID = IDENTITY_ROTATION;
const Y_90 = RawQuaternion.create(0, Math.SQRT1_2, 0, Math.SQRT1_2);
const Y_180 = RawQuaternion.create(0, 1, 0, 0);
const PVC_Y_90 = RawQuaternion.create(0, 0.70710688829422, 0, 0.7071067094802856);
const PVC_ANGLED = RawQuaternion.create(
  0.0635659471154213,
  -0.7042438387870789,
  0.0635659471154213,
  0.7042438387870789,
);

export const BOTBALL_EXPLORER_TABLE_26_NODES: Dict<Node> = {
  botball_explorer_game_table_2026: {
    ...component(
      '2026 Botball Explorer particle board',
      'botballExplorerTable26_particleBoard',
      RawVector3.create(34.88873481750488, -17.60936222076416, -5.1800994873046875),
    ),
    physics: undefined,
  },
  explorer_table_mat: component(
    '2026 Botball Explorer mat',
    'botballExplorerTable26_mat',
    RawVector3.create(34.88873481750488, -15.595561027526855, -5.1800994873046875),
    ID,
    RawVector3.ONE,
    STATIC_MESH,
  ),

  explorer_table_2x4_left: component(
    '2026 Botball Explorer left 2x4',
    'botballExplorerTable26_2x4',
    RawVector3.create(34.91424560546875, -11.175169944763184, 118.6752700805664),
    ID,
    RawVector3.ONE,
    STATIC_BOX,
  ),
  explorer_table_2x4_low: component(
    '2026 Botball Explorer lower 2x4',
    'botballExplorerTable26_2x4',
    RawVector3.create(97.765953540802, -11.175169944763184, -5.1800994873046875),
    Y_90,
    RawVector3.create(1.8834857940673828, 1, 1),
    STATIC_BOX,
  ),
  explorer_table_2x4_right: component(
    '2026 Botball Explorer right 2x4',
    'botballExplorerTable26_2x4',
    RawVector3.create(34.91424560546875, -11.175169944763184, -129.00533294677734),
    ID,
    RawVector3.ONE,
    STATIC_BOX,
  ),
  explorer_table_2x4_top: component(
    '2026 Botball Explorer upper 2x4',
    'botballExplorerTable26_2x4',
    RawVector3.create(-27.842219829559326, -11.175169944763184, -5.1800994873046875),
    Y_90,
    RawVector3.create(1.8834857940673828, 1, 1),
    STATIC_BOX,
  ),

  explorer_table_loading_dock: component(
    '2026 Botball Explorer loading dock',
    'botballExplorerTable26_loadingDock',
    RawVector3.create(0.2569279670715332, -12.481172561645508, 110.75975799560547),
    ID,
    RawVector3.ONE,
    STATIC_BOX,
  ),

  explorer_table_elbow_low: component(
    '2026 Botball Explorer lower elbow connector',
    'botballExplorerTable26_elbow',
    RawVector3.create(-17.187068462371826, -13.350078582763672, -123.29010009765625),
    Y_90,
  ),
  explorer_table_elbow_high: component(
    '2026 Botball Explorer upper elbow connector',
    'botballExplorerTable26_elbow',
    RawVector3.create(-17.187068462371826, -13.350078582763672, 101.55863952636719),
  ),

  explorer_table_t_low: component(
    '2026 Botball Explorer lower T connector',
    'botballExplorerTable26_tConnector',
    RawVector3.create(-15.43501615524292, -13.350078582763672, -47.40341567993164),
  ),
  explorer_table_t_high: component(
    '2026 Botball Explorer upper T connector',
    'botballExplorerTable26_tConnector',
    RawVector3.create(-15.43501615524292, -13.350078582763672, 26.57408332824707),
  ),
  explorer_table_pvc_short_low: pipe(
    '2026 Botball Explorer short lower PVC',
    RawVector3.create(-24.80126142501831, -13.350078582763672, -43.11716842651367),
    ID,
    7.62,
    3.81,
  ),
  explorer_table_pvc_short_high: pipe(
    '2026 Botball Explorer short upper PVC',
    RawVector3.create(-17.181270122528076, -13.350078582763672, 30.860334396362305),
    Y_180,
    7.62,
    3.81,
  ),
  explorer_table_pvc_short_top: pipe(
    '2026 Botball Explorer short top PVC',
    RawVector3.create(-17.181270122528076, -13.350078582763672, 103.30431365966797),
    Y_180,
    7.62,
    3.81,
  ),
  explorer_table_pvc_short_bottom: pipe(
    '2026 Botball Explorer short bottom PVC',
    RawVector3.create(-17.181270122528076, -13.350078582763672, -125.38945770263672),
    Y_180,
    7.62,
    3.81,
  ),
  explorer_table_pvc_26_875: pipe(
    '2026 Botball Explorer 26.875 inch PVC',
    RawVector3.create(-15.43501615524292, -13.350078582763672, 66.73779678344727),
    PVC_Y_90,
    68.2625,
    0,
  ),
  explorer_table_pvc_27_75: pipe(
    '2026 Botball Explorer 27.75 inch PVC',
    RawVector3.create(-15.43501615524292, -13.350078582763672, 29.114084243774414),
    PVC_Y_90,
    70.485,
    35.2425,
  ),
  explorer_table_pvc_31_25: pipe(
    '2026 Botball Explorer 31.25 inch PVC',
    RawVector3.create(-15.43501615524292, -13.350078582763672, -124.2384262084961),
    PVC_ANGLED,
    79.375,
    39.6875,
  ),
};
