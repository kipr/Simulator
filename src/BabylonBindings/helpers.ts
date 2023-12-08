
import { AbstractMesh,  Node as babylNode } from '@babylonjs/core';


export const apply = (g: babylNode, f: (m: AbstractMesh) => void) => {
  if (g instanceof AbstractMesh) {
    f(g);
  } else {
    (g.getChildren(c => c instanceof AbstractMesh) as AbstractMesh[]).forEach(f);
  }
};