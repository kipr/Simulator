import * as Babylon from 'babylonjs';
import { VisibleSensor } from './sensor';

export class ETSensorBabylon implements VisibleSensor {
	private scene: Babylon.Scene;
	private mesh: Babylon.AbstractMesh;
	private originOffsetFromMesh: Babylon.Vector3;
	private forwardFromMesh: Babylon.Vector3;
	private options: Required<ETSensorBabylonOptions>;

	private ray: Babylon.Ray;
	private visualMesh: Babylon.LinesMesh;

	private readonly VISUAL_MESH_NAME = "etlinemesh";

	constructor(scene: Babylon.Scene, mesh: Babylon.AbstractMesh, forwardFromMesh: Babylon.Vector3, originFromMesh: Babylon.Vector3, options?: ETSensorBabylonOptions) {
		this.scene = scene;
		this.mesh = mesh;
		this.originOffsetFromMesh = originFromMesh;
		this.forwardFromMesh = forwardFromMesh;
		this.options = { ...defaultOptions, ...options };

		this.ray = new Babylon.Ray(Babylon.Vector3.Zero(), Babylon.Vector3.Zero(), this.options.maxRange);
		this.visualMesh = Babylon.MeshBuilder.CreateLines(
			this.VISUAL_MESH_NAME,
			{
				points: [Babylon.Vector3.Zero(), Babylon.Vector3.Zero()],
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
		forwardDirection = Babylon.Vector3.Normalize(forwardDirection);
		
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
		this.visualMesh = Babylon.MeshBuilder.CreateLines(this.VISUAL_MESH_NAME, { points: newLinePoints, instance: this.visualMesh }, this.scene);
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

	private vecToLocal(vector: Babylon.Vector3, mesh: Babylon.AbstractMesh): Babylon.Vector3 {
		const matrix = mesh.getWorldMatrix();
		return Babylon.Vector3.TransformCoordinates(vector, matrix);
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