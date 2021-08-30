import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { StandardMaterial as BabylonStandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 as BabylonColor3 } from '@babylonjs/core/Maths/math.color';
import '@babylonjs/core/Meshes/Builders/boxBuilder';
import { BoxBuilder as BabylonBoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { PhysicsImpostor as BabylonPhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';

import { Quaternion, Vector3 as RawVector3 } from '../math';
import { Rotation, Vector3 } from '../unit-math';
import { Item } from '../state';
import { Distance, Mass } from '../util';
import ItemObject from './ItemObject';
import * as uuid from 'uuid';

export class PaperReam implements ItemObject {
  private config_: ItemObject.Config<Item.PaperReam>;

  private mesh: BabylonAbstractMesh;

  private scene: BabylonScene;

  get item(): Item.PaperReam {
    return this.config_.item;
  }

  get id(): string {
    return this.mesh.name;
  }

  constructor(scene: BabylonScene, config: ItemObject.Config<Item.PaperReam>) {
    const item = Item.PaperReam.fill(config.item);
    this.scene = scene;
    this.config_ = { ...config, item };

    const reamMaterial = new BabylonStandardMaterial("ream", this.scene);
    reamMaterial.emissiveColor = new BabylonColor3(0.25,0.25,0.25);

    // Generate random mesh name to avoid name collisions
    // TODO: Must be prefixed with "item_" to be detected by sensors. Make this more flexible
    const meshName = `item_${item.name}_${uuid.v4()}`;
    this.mesh = BabylonBoxBuilder.CreateBox(
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
    this.mesh.physicsImpostor = new BabylonPhysicsImpostor(
      this.mesh, 
      BabylonPhysicsImpostor.BoxImpostor, 
      { 
        mass: this.config_.item.mass ? Mass.toGramsValue(this.config_.item.mass) : 50, 
        friction: this.config_.item.friction ? this.config_.item.friction.value : 5,
      }, 
      this.scene
    );
  }
}