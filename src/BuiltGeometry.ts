import { Mesh as BabylonMesh } from '@babylonjs/core/Meshes/mesh';

interface BuiltGeometry {
  mesh: BabylonMesh;
  colliders?: BuiltGeometry.Collider[];
}

namespace BuiltGeometry {
  export interface Collider {
    name: string;
    mesh: BabylonMesh;
    type: number;
    volume: number;
  }
}

export default BuiltGeometry;