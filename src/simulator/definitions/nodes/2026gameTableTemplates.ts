import Dict from "../../../util/objectOps/Dict";
import Geometry from "../../../state/State/Scene/Geometry";
import Node from "../../../state/State/Scene/Node";
import { Mass } from "../../../util";
import { PhysicsMotionType } from "@babylonjs/core";

// TODO: Consider deep-freezing all of these objects

const gameTable2026Template: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'game_table_2026',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.STATIC,
    restitution: .2,
    friction: 1,
  },
};

export const BB2026Templates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'game_table_2026': gameTable2026Template,
});


export const BB2026Geometries = Object.freeze<Dict<Geometry>>({
  'game_table_2026': {
    type: 'file',
    uri: '/static/object_binaries/2026_Fall_Table.glb',
  },
});
