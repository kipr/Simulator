// import * as Babylon from 'babylonjs';
import {
  Scene,
  LinesMesh, 
  AbstractMesh,
  Vector3,
  MeshBuilder,
  Ray
} from 'babylonjs';
import { VisibleSensor } from './sensor';

export class ETSensorBabylon implements VisibleSensor {
  private scene: Scene;
  private mesh: AbstractMesh;
  private originOffsetFromMesh: Vector3;
  private forwardFromMesh: Vector3;
  private options: Required<ETSensorBabylonOptions>;

  private ray: Ray;
  private visualMesh: LinesMesh;

  private readonly VISUAL_MESH_NAME = "etlinemesh";

  constructor(scene: Scene, mesh: AbstractMesh, forwardFromMesh: Vector3, originFromMesh: Vector3, options?: ETSensorBabylonOptions) {
    this.scene = scene;
    this.mesh = mesh;
    this.originOffsetFromMesh = originFromMesh;
    this.forwardFromMesh = forwardFromMesh;
    this.options = { ...defaultOptions, ...options };

    this.ray = new Ray(Vector3.Zero(), Vector3.Zero(), this.options.maxRange);
    this.visualMesh = MeshBuilder.CreateLines(
      this.VISUAL_MESH_NAME,
      {
        points: [Vector3.Zero(), Vector3.Zero()],
        updatable: true,
      },
      this.scene);
    
    this.isVisible = this.options.isVisible;
  }

  // Updates the state of the sensor
  // Should call before getValue() or updateVisual()
  public update(): void {
    const forwardPoint = this.vecToLocal(this.forwardFromMesh, this.mesh);
    const originPoint = this.vecToLocal(this.originOffsetFromMesh, this.mesh);

    let forwardDirection = forwardPoint.subtract(this.mesh.absolutePosition);
    forwardDirection = Vector3.Normalize(forwardDirection);
    
    this.ray.origin = originPoint;
    this.ray.direction = forwardDirection;
    // this.ray.length = this.maxRange;
  }

  public getValue(): number {
    // Check for ray collision
    const hit = this.scene.pickWithRay(this.ray);

    if (hit.pickedMesh) {
      return this.distanceToSensorValue(hit.distance);
    }

    return 255;
  }

  public updateVisual(): void {
    // Short-circuit the method if not visible
    if (!this.isVisible) {
      return;
    }

    const newLinePoints = [this.ray.origin, this.ray.origin.add(this.ray.direction.scale(this.ray.length))];
    this.visualMesh = MeshBuilder.CreateLines(this.VISUAL_MESH_NAME, { points: newLinePoints, instance: this.visualMesh }, this.scene);
  }

  public get isVisible(): boolean {
    return this.visualMesh.isEnabled();
  }
  
  public set isVisible(v: boolean) {
    this.visualMesh.setEnabled(v);
  }

  // Converts from 3D world distance to sensor output value
  private distanceToSensorValue(distance: number): number {
    return 255 - Math.floor((distance / this.options.maxRange) * 255);
  }

  private vecToLocal(vector: Vector3, mesh: AbstractMesh): Vector3 {
    const matrix = mesh.getWorldMatrix();
    return Vector3.TransformCoordinates(vector, matrix);
  }
}

export interface ETSensorBabylonOptions {
  maxRange?: number;
  isVisible?: boolean;
}

const defaultOptions: Required<ETSensorBabylonOptions> = {
  maxRange: 30,
  isVisible: false,
};