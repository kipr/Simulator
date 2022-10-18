import Dict from "../Dict";
import { Vector2 } from "../math";
import { Color } from "../state/State/Scene/Color";
import Geometry from "../state/State/Scene/Geometry";
import Node from "../state/State/Scene/Node";
import { Distance, Mass } from "../util";

// TODO: Consider deep-freezing all of these objects

const canTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'can',
  physics: {
    type: 'cylinder',
    mass: Mass.grams(5),
    friction: 0.7,
    restitution: 0.3,
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/Can Texture.png'
    },
  },
  faceUvs: [Vector2.ZERO, Vector2.ZERO, Vector2.create(1, 0), Vector2.create(0, 1), Vector2.ZERO, Vector2.ZERO],
};

const reamTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'ream',
  physics: {
    type: 'box',
    restitution: 0,
    friction: 1,
    mass: Mass.pounds(5),
  },
  material: {
    type: 'basic',
    color: {
      type: 'color3',
      color: Color.Rgb.create(250, 249, 246),
    },
  },
};

const jbcMatATemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'jbc_mat_a',
  physics: {
    type: 'box',
    restitution: 0,
    friction: 1
  },
};

const jbcMatBTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'jbc_mat_b',
  physics: {
    type: 'box',
    restitution: 0,
    friction: 1
  },
};

export const preBuiltTemplates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'can': canTemplate,
  'ream': reamTemplate,
  'jbc_mat_a': jbcMatATemplate,
  'jbc_mat_b': jbcMatBTemplate,
});

export const preBuiltGeometries = Object.freeze<Dict<Geometry>>({
  'can': {
    type: 'cylinder',
    height: Distance.centimeters(11.15),
    radius: Distance.centimeters(3),
  },
  'ream': {
    type: 'box',
    size: {
      x: Distance.centimeters(27.94),
      y: Distance.centimeters(5.08),
      z: Distance.centimeters(21.59),
    },
  },
  'jbc_mat_a': {
    type: 'file',
    uri: '/static/jbcMatA.glb'
  },
  'jbc_mat_b': {
    type: 'file',
    uri: '/static/jbcMatB.glb'
  },
});