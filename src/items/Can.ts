import * as Babylon from 'babylonjs';
import Item from './Item';
import ItemObject from './ItemObject';

export class Can implements ItemObject {
  private config_: ItemObject.Config<Item.Can>;

  private mesh: Babylon.AbstractMesh;

  private scene: Babylon.Scene;

  get item(): Item.Can {
    return this.config_.item;
  }
  get id(): string {
    return this.config_.item.id;
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

    this.mesh = Babylon.MeshBuilder.CreateCylinder(
      this.config_.item.id,
      {
        height:11.15, 
        diameter:6, 
        faceUV: faceUV,
      }, 
      this.scene
    );

    this.mesh.material = canMaterial;
    this.mesh.visibility = 0.5;

    this.mesh.position = this.config_.item.startPosition;
    this.mesh.rotate(this.config_.item.rotationAxis, this.config_.item.startRotation);
  }

  // Used to create physics impostor of mesh in scene and make opaque
  // Can be used after mesh is created so that transparent item can be maniplated around scene before interacting with it
  public place(): void {
    this.mesh.visibility = 1;
    this.mesh.physicsImpostor = new Babylon.PhysicsImpostor(
      this.mesh, 
      Babylon.PhysicsImpostor.CylinderImpostor, 
      { 
        mass: 5, 
        friction: 5 
      }, 
      this.scene
    );
  }
}