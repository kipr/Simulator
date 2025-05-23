import { Mesh, StandardMaterial, CreateBox } from '@babylonjs/core';

import SensorParameters from './SensorParameters';
import SensorObject from './SensorObject';
import Node from '../../../state/State/Robot/Node';
import { ReferenceFramewUnits, Vector3wUnits } from '../../../util/math/unitMath';


class TouchSensor extends SensorObject<Node.TouchSensor, boolean> {
  private intersector_: Mesh;

  constructor(parameters: SensorParameters<Node.TouchSensor>) {
    super(parameters);

    const { id, definition, parent, scene, links, colliders } = parameters;
    const { collisionBox, origin } = definition;

    // The parent already has RENDER_SCALE applied, so we don't need to apply it again.
    const rawCollisionBox = Vector3wUnits.toRaw(collisionBox, 'meters');
    // convert id from snake case to camel case
    const idCamel = id.replace(/_([a-z])/g, g => g[1].toUpperCase());

    for (const collider of colliders) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      const collider_name = (collider as any)?.name;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (collider_name.includes(idCamel)) {
        const mesh = collider as Mesh;
        this.intersector_ = mesh;
      }
    }
    if (!this.intersector_) {
      this.intersector_ = CreateBox(id, {
        depth: rawCollisionBox.z,
        height: rawCollisionBox.y,
        width: rawCollisionBox.x,
      }, scene);
      this.intersector_.parent = parent;
      ReferenceFramewUnits.syncBabylon(origin, this.intersector_, 'meters');
    }
    this.intersector_.parent = parent;

    this.intersector_.material = new StandardMaterial('touch-sensor-material', scene);
    this.intersector_.material.wireframe = true;
    this.intersector_.visibility = 0;
    this.intersector_.isPickable = false;

    // ReferenceFramewUnits.syncBabylon(origin, this.intersector_, 'meters');
  }

  override getValue(): Promise<boolean> {
    const { scene, links } = this.parameters;

    const meshes = scene.getActiveMeshes();

    let hit = false;
    meshes.forEach(mesh => {
      if (!hit && mesh !== this.intersector_ && !links.has(mesh as Mesh) && mesh.physicsBody) {
        hit = this.intersector_.intersectsMesh(mesh, true);
      }
    });

    return Promise.resolve(hit);
  }

  override dispose(): void {
    this.intersector_.dispose();
  }
}

export default TouchSensor;
