import * as Babylon from 'babylonjs';
import { Quaternion, ReferenceFrame, Vector3 } from '../math';
import { Item } from '../state';
import ItemObject from './ItemObject';

export class PaperReam implements ItemObject {
  private config_: ItemObject.Config<Item.PaperReam>;

  private mesh: Babylon.AbstractMesh;

  private scene: Babylon.Scene;

  get item(): Item.PaperReam {
    return this.config_.item;
  }

  get id(): string {
    return this.config_.item.name;
  }

  constructor(scene: Babylon.Scene, config: ItemObject.Config<Item.PaperReam>) {
    const item = Item.PaperReam.fill(config.item);
    this.scene = scene;
    this.config_ = { ...config, item };

    const reamMaterial = new Babylon.StandardMaterial("ream", this.scene);
    reamMaterial.emissiveColor = new Babylon.Color3(0.25,0.25,0.25);

    this.mesh = Babylon.MeshBuilder.CreateBox(
      this.config_.item.name,
      {
        height:5.18,
        width:17.6,
        depth:22.77
      },
      this.scene
    );
    this.mesh.material = reamMaterial;
    this.mesh.visibility = 0.5;

    const origin = ReferenceFrame.fill(item.origin);

    this.mesh.position = Vector3.toBabylon(origin.position);
    this.mesh.rotationQuaternion = Quaternion.toBabylon(origin.orientation);
  }

  // Used to create physics impostor of mesh in scene and make opaque
  // Can be used after mesh is created so that transparent item can be maniplated around scene before interacting with it
  public place(): void {
    this.mesh.visibility = 1;
    this.mesh.physicsImpostor = new Babylon.PhysicsImpostor(
      this.mesh, 
      Babylon.PhysicsImpostor.BoxImpostor, 
      { 
        mass: 50, 
        friction: 5 
      }, 
      this.scene
    );
  }
}