import { Mesh as BabylonMesh } from '@babylonjs/core/Meshes/mesh';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { IPhysicsEnabledObject as BabylonIPhysicsEnabledObject } from '@babylonjs/core/Physics/physicsImpostor'

interface SensorParameters<T> {
  id: string;
  definition: T;
  parent: BabylonMesh;
  scene: BabylonScene;
  links: Set<BabylonMesh>;
  colliders: Set<BabylonIPhysicsEnabledObject>;
}

export default SensorParameters;