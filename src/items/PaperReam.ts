import * as Babylon from 'babylonjs';
import { Quaternion, ReferenceFrame as RawReferenceFrame, Vector3 as RawVector3 } from '../math';
import { ReferenceFrame, Rotation, Vector3 } from '../unit-math';
import { Item } from '../state';
import { Distance, Mass } from '../util';
import ItemObject from './ItemObject';
import * as uuid from 'uuid';

export class PaperReam implements ItemObject {
  private config_: ItemObject.Config<Item.PaperReam>;

  private mesh: Babylon.AbstractMesh;

  private scene: Babylon.Scene;

  get item(): Item.PaperReam {
    return this.config_.item;
  }

  get id(): string {
    return this.mesh.name;
  }

  constructor(scene: Babylon.Scene, config: ItemObject.Config<Item.PaperReam>) {
    const item = Item.PaperReam.fill(config.item);
    this.scene = scene;
    this.config_ = { ...config, item };

    const reamMaterial = new Babylon.StandardMaterial("ream", this.scene);
    reamMaterial.emissiveColor = new Babylon.Color3(0.25,0.25,0.25);

    // Generate random mesh name to avoid name collisions
    // TODO: Must be prefixed with "item_" to be detected by sensors. Make this more flexible
    const meshName = `item_${item.name}_${uuid.v4()}`;
    this.mesh = Babylon.MeshBuilder.CreateBox(
      meshName,
      {
        height:5.18,
        width:17.6,
        depth:22.77
      },
      this.scene
    );
    this.mesh.material = reamMaterial;
    this.mesh.visibility = 0.5;

    const position = item.origin.position ? Vector3.toRaw(item.origin.position, Distance.Type.Centimeters) : RawVector3.ZERO;
    const orientation = item.origin.orientation ? Rotation.toRawQuaternion(item.origin.orientation) : Quaternion.IDENTITY;


    this.mesh.position = RawVector3.toBabylon(position);
    this.mesh.rotationQuaternion = Quaternion.toBabylon(orientation);
  }

  // Used to create physics impostor of mesh in scene and make opaque
  // Can be used after mesh is created so that transparent item can be maniplated around scene before interacting with it
  public place(): void {
    this.mesh.visibility = 1;
    this.mesh.physicsImpostor = new Babylon.PhysicsImpostor(
      this.mesh, 
      Babylon.PhysicsImpostor.BoxImpostor, 
      { 
        mass: this.config_.item.mass ? Mass.toGramsValue(this.config_.item.mass) : 50, 
        friction: this.config_.item.friction ? this.config_.item.friction.value : 5,
      }, 
      this.scene
    );
  }
}