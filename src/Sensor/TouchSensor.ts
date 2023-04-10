import Node from '../state/State/Robot/Node';
import SensorObject from './SensorObject';

import { Mesh as BabylonMesh } from '@babylonjs/core/Meshes/mesh';
import SensorParameters from './SensorParameters';

import { BoxBuilder as BabylonBoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { StandardMaterial as BabylonStandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ReferenceFrame, Vector3 } from '../unit-math';

class TouchSensor extends SensorObject<Node.TouchSensor, boolean> {
  private intersector_: BabylonMesh;
  
  constructor(parameters: SensorParameters<Node.TouchSensor>) {
    super(parameters);

    const { id, definition, parent, scene } = parameters;
    const { collisionBox, origin } = definition;

    // The parent already has RENDER_SCALE applied, so we don't need to apply it again.
    const rawCollisionBox = Vector3.toRaw(collisionBox, 'meters');

    this.intersector_ = BabylonBoxBuilder.CreateBox(id, {
      depth: rawCollisionBox.z,
      height: rawCollisionBox.y,
      width: rawCollisionBox.x,
    }, scene);

    this.intersector_.parent = parent;
    this.intersector_.material = new BabylonStandardMaterial('touch-sensor-material', scene);
    this.intersector_.material.wireframe = true;
    this.intersector_.visibility = 0;

    ReferenceFrame.syncBabylon(origin, this.intersector_, 'meters');
  }

  override getValue(): Promise<boolean> {
    const { scene, links } = this.parameters;

    const meshes = scene.getActiveMeshes();

    let hit = false;
    meshes.forEach(mesh => {
      if (hit || mesh === this.intersector_ || links.has(mesh as BabylonMesh)) return;
      if (!mesh.physicsImpostor) return;
      hit = this.intersector_.intersectsMesh(mesh, true);
    });

    return Promise.resolve(hit);
  }

  override dispose(): void {
    this.intersector_.dispose();
  }
}

export default TouchSensor;