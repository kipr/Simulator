import * as Babylon from 'babylonjs';
import { Quaternion, ReferenceFrame as RawReferenceFrame, Vector3 as RawVector3 } from '../math';
import { ReferenceFrame, Rotation, Vector3 } from '../unit-math';
import { Item } from '../state';
import ItemObject from './ItemObject';
import { Distance, Mass } from '../util';
import * as uuid from 'uuid';

export class Can implements ItemObject {
  private config_: ItemObject.Config<Item.Can>;

  private mesh: Babylon.AbstractMesh;

  private scene: Babylon.Scene;

  get item(): Item.Can {
    return this.config_.item;
  }
  get id(): string {
    return this.mesh.name;
  }

  constructor(scene: Babylon.Scene, config: ItemObject.Config<Item.Can>) {
    const item = Item.Can.fill(config.item);
    this.scene = scene;
    this.config_ = { ...config, item };

    const canMaterial = new Babylon.StandardMaterial("can", this.scene);
    canMaterial.diffuseTexture = new Babylon.Texture('static/Can Texture.png',this.scene);
    canMaterial.emissiveTexture = canMaterial.diffuseTexture.clone();
    canMaterial.emissiveColor = new Babylon.Color3(0.1,0.1,0.1);

    const faceUV: Babylon.Vector4[] = [];
    faceUV[0] = Babylon.Vector4.Zero();
    faceUV[1] = new Babylon.Vector4(1, 0, 0, 1);
    faceUV[2] = Babylon.Vector4.Zero();

    // Generate random mesh name to avoid name collisions
    // TODO: Must be prefixed with "item_" to be detected by sensors. Make this more flexible
    const meshName = `item_${item.name}_${uuid.v4()}`;
    this.mesh = Babylon.MeshBuilder.CreateCylinder(
      meshName,
      {
        height: 11.15, 
        diameter: 6, 
        faceUV: faceUV,
      }, 
      this.scene
    );

    this.mesh.material = canMaterial;
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
      Babylon.PhysicsImpostor.CylinderImpostor, 
      { 
        mass: this.config_.item.mass ? Mass.toGramsValue(this.config_.item.mass) : 5, 
        friction: this.config_.item.friction ? this.config_.item.friction.value : 5,
      }, 
      this.scene
    );
  }
}