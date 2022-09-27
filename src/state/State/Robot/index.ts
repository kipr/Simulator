import Dict from '../../../Dict';
import { ReferenceFrame } from '../../../unit-math';
import LocalizedString from '../../../util/LocalizedString';
import Patch from '../../../util/Patch';
import Geometry from './Geometry';
import Node from './Node';

interface Robot {
  name: LocalizedString;
  authorId: string;
  description?: LocalizedString;

  nodes: Dict<Node>;
  geometry: Dict<Geometry>;
  origin?: ReferenceFrame;
}

interface PatchRobot {
  name: Patch<LocalizedString>;
  authorId: Patch<string>;
  description: Patch<LocalizedString>;
  nodes: Dict<Patch<Node>>;
  geometry: Dict<Patch<Geometry>>;
}

namespace Robot {
  export const rootNodeIds = (robot: Robot): string[] => {
    const ret: string[] = [];
    
    for (const nodeId of Object.keys(robot.nodes)) {
      const node = robot.nodes[nodeId];
      if (node.parentId !== undefined) continue;
      ret.push(nodeId);
    }

    return ret;
  };

  export const childrenNodeIds = (robot: Robot): Dict<string[]> => {
    const ret: Dict<string[]> = {};

    for (const nodeId of Object.keys(robot.nodes)) ret[nodeId] = [];

    for (const nodeId of Object.keys(robot.nodes)) {
      const node = robot.nodes[nodeId];
      if (node.parentId === undefined) continue;
      ret[node.parentId].push(nodeId);
    }

    return ret;
  };

  export const breadthFirstNodeIds = (robot: Robot): string[] => {
    const ret: string[] = [];

    const queue: string[] = [...rootNodeIds(robot)];

    const children = childrenNodeIds(robot);

    while (queue.length > 0) {
      const nodeId = queue.shift();
      ret.push(nodeId);

      for (const childId of children[nodeId]) queue.push(childId);
    }

    return ret;
  };

  export const diff = (a: Robot, b: Robot): PatchRobot => ({
    name: Patch.diff(a.name, b.name),
    authorId: Patch.diff(a.authorId, b.authorId),
    description: Patch.diff(a.description, b.description),
    nodes: Patch.diffDict(a.nodes, b.nodes, Node.diff),
    geometry: Patch.diffDict(a.geometry, b.geometry, Patch.diff),
  });
}

export default Robot;