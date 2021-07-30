import * as Babylon from 'babylonjs';
import Sensor from './Sensor';
import SensorObject from './SensorObject';

export class TouchSensor implements SensorObject {
  private config_: SensorObject.Config<Sensor.Touch>;

  // Keeps track of the meshes in the scene that are eligible for intersection checking
  private eligibleMeshes_: Babylon.AbstractMesh[];

  private isIntersecting_ = false;
  private prevIntersectingMesh_: Babylon.AbstractMesh = null;

  private sinceLastUpdate = 0;

  private meshAddedObserver_: Babylon.Observer<Babylon.AbstractMesh>;
  private meshRemovedObserver_: Babylon.Observer<Babylon.AbstractMesh>;

  get sensor(): Sensor.Touch {
    return this.config_.sensor;
  }

  constructor(config: SensorObject.Config<Sensor.Touch>) {
    this.config_ = config;

    // Initialize eligible meshes by looking through all meshes in the scene
    // For performance, might want to find a better way to initialize this
    this.eligibleMeshes_ = this.config_.scene.meshes.filter(TouchSensor.isMeshEligible);

    // Create observers to update eligible meshes when meshes are added/removed from the scene
    this.meshAddedObserver_ = this.config_.scene.onNewMeshAddedObservable.add(addedMesh => {
      if (TouchSensor.isMeshEligible(addedMesh)) {
        this.eligibleMeshes_.push(addedMesh);
      }
    });
    this.meshRemovedObserver_ = this.config_.scene.onMeshRemovedObservable.add(removedMesh => {
      const index = this.eligibleMeshes_.findIndex(mesh => mesh.name === removedMesh.name);
      if (index >= 0) {
        this.eligibleMeshes_.splice(index, 1);
      }
      if (this.prevIntersectingMesh_ && this.prevIntersectingMesh_.name === removedMesh.name) {
        this.prevIntersectingMesh_ = null;
      }
    });
  }

  public update(): boolean {
    this.sinceLastUpdate++;
    if (this.sinceLastUpdate < this.config_.sensor.maxUpdateFrequency) {
      return false;
    }

    this.sinceLastUpdate = 0;

    // After an intersection, it's likely that the sensor will continue intersecting with the same mesh for a while
    // So check the previous intersecting mesh upfront
    if (this.prevIntersectingMesh_ && this.config_.mesh.intersectsMesh(this.prevIntersectingMesh_)) {
      this.isIntersecting_ = true;
      return true;
    }

    for (const eligibleMesh of this.eligibleMeshes_) {
      // Skip the previous intersecting mesh since we already checked it
      if (this.prevIntersectingMesh_ && eligibleMesh.id === this.prevIntersectingMesh_.id) continue;

      if (this.config_.mesh.intersectsMesh(eligibleMesh)) {
        this.isIntersecting_ = true;
        this.prevIntersectingMesh_ = eligibleMesh;
        return true;
      }
    }

    this.isIntersecting_ = false;
    this.prevIntersectingMesh_ = null;

    return true;
  }

  public getValue(): SensorObject.Value {
    return this.isIntersecting_ ? SensorObject.Value.TRUE : SensorObject.Value.FALSE;
  }

  public updateVisual(): boolean {
    if (!this.isVisible) return false;
    
    return true;
  }

  public dispose(): void {
    this.config_.scene.onNewMeshAddedObservable.remove(this.meshAddedObserver_);
    this.config_.scene.onMeshRemovedObservable.remove(this.meshRemovedObserver_);
  }

  public get isVisible(): boolean {
    return false;
  }
  
  public set isVisible(v: boolean) {
    // Touch sensor visibility not yet supported
  }
  
  public get isNoiseEnabled(): boolean {
    return false;
  }
  
  public set isNoiseEnabled(v: boolean) {
    // Digital sensors aren't noisy
  }

  public get isRealisticEnabled(): boolean {
    return false;
  }

  public set isRealisticEnabled(r: boolean) {
    // Digital sensors don't have realism
  }

  // Determines whether the given mesh is eligible for intersection checking
  // Currently based on mesh name, but this should be made more flexible
  private static isMeshEligible = (mesh: Babylon.AbstractMesh) => {
    return mesh.name.startsWith('item');
  };
}

