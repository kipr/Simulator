import * as Babylon from 'babylonjs';
import Sensor from './Sensor';
import SensorObject from './SensorObject';

const vecToLocal = (vector: Babylon.Vector3, mesh: Babylon.AbstractMesh): Babylon.Vector3 => {
  const matrix = mesh.getWorldMatrix();
  return Babylon.Vector3.TransformCoordinates(vector, matrix);
};

export class IrSensor implements SensorObject {
  private config_: SensorObject.Config<Sensor.Ir>;

  private ray: Babylon.Ray;
  private visualMesh: Babylon.LinesMesh;

  private sinceLastUpdate = 0;
  
  private __isNoiseEnabled: boolean;
  private __isRealisticEnabled: boolean;

  private readonly VISUAL_MESH_NAME = "irlinemesh";

  private lastHitTextureId: string | null = null;
  private lastHitPixels: ArrayBufferView | null = null;

  get sensor(): Sensor.Ir {
    return this.config_.sensor;
  }

  constructor(config: SensorObject.Config<Sensor.Ir>) {
    const sensor = Sensor.Ir.fill(config.sensor);
    this.config_ = { ...config, sensor };

    this.ray = new Babylon.Ray(Babylon.Vector3.Zero(), Babylon.Vector3.Zero(), this.config_.sensor.maxRange);
    this.visualMesh = Babylon.MeshBuilder.CreateLines(
      this.VISUAL_MESH_NAME,
      {
        points: [Babylon.Vector3.Zero(), Babylon.Vector3.Zero()],
        updatable: true,
      },
      this.config_.scene
    );

    this.isVisible = false;
  }

  // Updates the state of the sensor
  // Should call before getValue() or updateVisual()
  public update(): boolean {
    this.sinceLastUpdate++;
    if (this.sinceLastUpdate < this.config_.sensor.maxUpdateFrequency) {
      return false;
    }

    this.sinceLastUpdate = 0;
    
    const forwardPoint = vecToLocal(this.config_.sensor.forward, this.config_.mesh);
    const originPoint = vecToLocal(this.config_.sensor.origin, this.config_.mesh);

    let forwardDirection = forwardPoint.subtract(this.config_.mesh.absolutePosition);
    forwardDirection = Babylon.Vector3.Normalize(forwardDirection);
    
    this.ray.origin = originPoint;
    this.ray.direction = forwardDirection;
    // this.ray.length = this.maxRange;

    return true;
  }

  public getValue(): SensorObject.Value {
    let sensorValue = 0;
    const hit = this.config_.scene.pickWithRay(this.ray, null);

    if (hit.pickedMesh && hit.pickedMesh.material && hit.pickedMesh.material.getActiveTextures().length > 0) {
      const hitTexture = hit.pickedMesh.material.getActiveTextures()[0];

      // Only reprocess the texture if we hit a different texture than before
      if (this.lastHitTextureId === null || this.lastHitTextureId !== hitTexture.uid) {
        if (hitTexture.isReady()) {
          this.lastHitTextureId = hitTexture.uid;
          this.lastHitPixels = hitTexture.readPixels();
        } else {
          // Texture isn't ready yet, so nothing we can do
          this.lastHitTextureId = null;
          this.lastHitPixels = null;
        }
      }

      if (this.lastHitPixels !== null) {
        const hitTextureCoordinates = hit.getTextureCoordinates();
        const arrayIndex = Math.floor(hitTextureCoordinates.x * (hitTexture.getSize().width - 1)) * 4 + Math.floor(hitTextureCoordinates.y * (hitTexture.getSize().height - 1)) * hitTexture.getSize().width * 4;

        const r = this.lastHitPixels[arrayIndex] as number;
        const g = this.lastHitPixels[arrayIndex + 1] as number;
        const b = this.lastHitPixels[arrayIndex + 2] as number;

        // Crude conversion from RGB to grayscale
        const colorAverage = (r + g + b) / 3;

        // Value is a grayscale percentage of 4095
        sensorValue = Math.floor(4095 * (1 - (colorAverage / 255)));
      }
    }

    if (this.__isNoiseEnabled) sensorValue = this.applyNoise(sensorValue);

    return SensorObject.Value.u12(sensorValue);
  }

  public updateVisual(): boolean {
    if (!this.isVisible) return false;

    const newLinePoints = [this.ray.origin, this.ray.origin.add(this.ray.direction.scale(this.ray.length))];
    this.visualMesh = Babylon.MeshBuilder.CreateLines(this.VISUAL_MESH_NAME, { points: newLinePoints, instance: this.visualMesh }, this.config_.scene);
    
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
  
  public get isNoiseEnabled(): boolean {
    return this.__isNoiseEnabled;
  }
  
  public set isNoiseEnabled(v: boolean) {
    this.__isNoiseEnabled = v;
  }

  public get isRealisticEnabled(): boolean {
    return this.__isRealisticEnabled;
  }

  public set isRealisticEnabled(r: boolean) {
    this.__isRealisticEnabled = r;
  }
  
  private applyNoise(value: number): number {
    const noise = this.config_.sensor.noiseRadius || 0;
    const offset = Math.floor(noise * Math.random() * 2) - noise;
    let noisyValue = value - offset;
    if (noisyValue < 0) noisyValue = 0;
    else if (noisyValue > 4095) noisyValue = 4095;
    return noisyValue;
  }
}

