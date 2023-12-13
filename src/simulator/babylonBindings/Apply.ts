
import { AbstractMesh,  Node as babylonNode } from '@babylonjs/core';


export default (g: babylonNode, f: (m: AbstractMesh) => void) => {
  if (g instanceof AbstractMesh) {
    f(g);
  } else {
    (g.getChildren(c => c instanceof AbstractMesh) as AbstractMesh[]).forEach(f);
  }
};