import Dict from '../../../Dict';
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
}

interface PatchRobot {
  name: Patch<LocalizedString>;
  authorId: Patch<string>;
  description: Patch<LocalizedString>;
  nodes: Dict<Patch<Node>>;
  geometry: Dict<Patch<Geometry>>;
}

namespace Robot {
  export const diff = (a: Robot, b: Robot): PatchRobot => ({
    name: Patch.diff(a.name, b.name),
    authorId: Patch.diff(a.authorId, b.authorId),
    description: Patch.diff(a.description, b.description),
    nodes: Patch.diffDict(a.nodes, b.nodes, Node.diff),
    geometry: Patch.diffDict(a.geometry, b.geometry, Patch.diff),
  });
}

export default Robot;