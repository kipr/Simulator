import { Mesh, IPhysicsEnabledObject, Scene as babylonScene } from '@babylonjs/core';

interface SensorParameters<T> {
  id: string;
  definition: T;
  parent: Mesh;
  scene: babylonScene;
  links: Set<Mesh>;
  colliders: Set<IPhysicsEnabledObject>;
}

export default SensorParameters;