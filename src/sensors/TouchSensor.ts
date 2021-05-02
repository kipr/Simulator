import * as Babylon from 'babylonjs';
import Sensor from './Sensor';
import SensorObject from './SensorObject';

const vecToLocal = (vector: Babylon.Vector3, mesh: Babylon.AbstractMesh): Babylon.Vector3 => {
  const matrix = mesh.getWorldMatrix();
  return Babylon.Vector3.TransformCoordinates(vector, matrix);
};

export class TouchSensor implements SensorObject {
  private config_: SensorObject.Config<Sensor.Touch>;

  private visualMesh: Babylon.LinesMesh;

  private readonly VISUAL_MESH_NAME = "etlinemesh";

  get sensor() { return this.config_.sensor; }

  constructor(config: SensorObject.Config<Sensor.Touch>) {
    this.config_ = config;

    this.visualMesh = Babylon.MeshBuilder.CreateLines(
      this.VISUAL_MESH_NAME,
      {
        points: [Babylon.Vector3.Zero(), Babylon.Vector3.Zero()],
        updatable: true,
      },
      this.config_.scene
    );

    this.isVisible = true;
  }

  public update() {
    return false;
  }

  public getValue() {
    return SensorObject.Value.FALSE;
  }

  public updateVisual() {
    if (!this.isVisible) return false;
    
    return true;
  }

  public dispose() {
    this.visualMesh.dispose();
  }

  public get isVisible() {
    return this.visualMesh.isEnabled();
  }
  
  public set isVisible(v: boolean) {
    this.visualMesh.setEnabled(v);
  }
}

