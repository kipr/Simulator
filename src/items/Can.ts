import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { StandardMaterial as BabylonStandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture as BabylonTexture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3 as BabylonColor3 } from '@babylonjs/core/Maths/math.color';
import { Vector4 as BabylonVector4 } from '@babylonjs/core/Maths/math.vector';
import '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import { CylinderBuilder as BabylonCylinderBuilder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import { PhysicsImpostor as BabylonPhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';

import { Quaternion, Vector3 as RawVector3 } from '../math';
import { Rotation, Vector3 } from '../unit-math';
import { Item } from '../state';
import ItemObject from './ItemObject';
import { Distance, Mass } from '../util';
import * as uuid from 'uuid';

export class Can implements ItemObject {
  private config_: ItemObject.Config<Item.Can>;

  private mesh: BabylonAbstractMesh;

  private scene: BabylonScene;

  get item(): Item.Can {
    return this.config_.item;
  }
  get id(): string {
    return this.mesh.name;
  }

  constructor(scene: BabylonScene, config: ItemObject.Config<Item.Can>) {
    const item = Item.Can.fill(config.item);
    this.scene = scene;
    this.config_ = { ...config, item };

    const canMaterial = new BabylonStandardMaterial("can", this.scene);
    canMaterial.diffuseTexture = new BabylonTexture('static/Can Texture.png',this.scene);
    canMaterial.emissiveTexture = canMaterial.diffuseTexture.clone();
    canMaterial.emissiveColor = new BabylonColor3(0.1,0.1,0.1);

    const faceUV: BabylonVector4[] = [];
    faceUV[0] = BabylonVector4.Zero();
    faceUV[1] = new BabylonVector4(1, 0, 0, 1);
    faceUV[2] = BabylonVector4.Zero();

    // Generate random mesh name to avoid name collisions
    // TODO: Must be prefixed with "item_" to be detected by sensors. Make this more flexible
    const meshName = `item_${item.name}_${uuid.v4()}`;
    this.mesh = BabylonCylinderBuilder.CreateCylinder(
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
    this.mesh.physicsImpostor = new BabylonPhysicsImpostor(
      this.mesh, 
      BabylonPhysicsImpostor.CylinderImpostor, 
      { 
        mass: this.config_.item.mass ? Mass.toGramsValue(this.config_.item.mass) : 5, 
        friction: this.config_.item.friction ? this.config_.item.friction.value : 5,
      }, 
      this.scene
    );
  }
}