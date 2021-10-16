import Dict from '../../../Dict';
import Geometry from './Geometry';
import Node from './Node';
import Script from './Script';

interface Scene {
  name: string;
  authorId: string;
  description: string;

  hdriUri?: string;

  geometry: Dict<Geometry>;
  nodes: Dict<Node>;
  scripts?: Dict<Script>;
}

namespace Scene {
  export const nodeOrdering = (scene: Scene): string[] => {
    // Find nodes with no parent
    const rootNodes = Object.keys(scene.nodes).filter(n => !scene.nodes[n].parentId);

    const children = new Map<string, string[]>();
    for (const nodeId of Object.keys(scene.nodes)) {
      const node = scene.nodes[nodeId];
      if (!node.parentId) continue;
      children.set(node.parentId, ([ ...(children.get(node.parentId) || []), nodeId ]));
    }

    const queue = [ ...rootNodes ];
    const visited = new Set<string>();
    const ret: string[] = [];

    while (visited.size < Object.keys(scene.nodes).length) {
      const next = queue.shift();
      if (visited.has(next)) continue;
      visited.add(next);

      ret.push(next);

      const c = children.get(next);
      if (c) ret.push(...c);
    }
    
    return ret;
  };
}

export default Scene;
