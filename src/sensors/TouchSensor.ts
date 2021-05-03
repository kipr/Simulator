import * as Babylon from 'babylonjs';
import Sensor from './Sensor';
import SensorObject from './SensorObject';

export class TouchSensor implements SensorObject {
  private config_: SensorObject.Config<Sensor.Touch>;

  private visualMesh: Babylon.LinesMesh;

  private readonly VISUAL_MESH_NAME = "etlinemesh";

  get sensor(): Sensor.Touch {
    return this.config_.sensor;
  }

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

  public update(): boolean {
    return false;
  }

  public getValue(): SensorObject.Value.Bool {
    return SensorObject.Value.FALSE;
  }

  public updateVisual(): boolean {
    if (!this.isVisible) return false;
    
    return true;
  }

  public dispose(): void {
    this.visualMesh.dispose();
  }

  public get isVisible(): boolean {
    return this.visualMesh.isEnabled();
  }
  
  public set isVisible(v: boolean) {
    this.visualMesh.setEnabled(v);
  }
}

