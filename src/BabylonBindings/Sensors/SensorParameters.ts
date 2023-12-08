import { Mesh, IPhysicsEnabledObject, Scene as babylScene } from '@babylonjs/core';

interface SensorParameters<T> {
  id: string;
  definition: T;
  parent: Mesh;
  scene: babylScene;
  links: Set<Mesh>;
  colliders: Set<IPhysicsEnabledObject>;
}

export default SensorParameters;