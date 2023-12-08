import { LinesMesh, Vector3, AbstractMesh, Ray, Quaternion, StandardMaterial, IcoSphereBuilder,
  DirectionalLight, HemisphericLight, SpotLight } from '@babylonjs/core';

import { Distance } from '../../util/math/Value';
import SensorParameters from './SensorParameters';
import SensorObject from './SensorObject';
import Node from '../../state/State/Robot/Node';
import { ReferenceFramewUnits, Vector3wUnits } from '../../util/math/UnitMath';
import { clamp, RawVector3 } from '../../util/math/math';
import { RENDER_SCALE } from '../../components/Constants/renderConstants';


/**
 * A light sensor that detects the amount of light at a given point in space.
 * 
 * This assumes the sensor can receive light from all directions. A ray is cast
 * to every light in the scene. If it collides with a mesh, it is considered
 * blocked. Otherwise, the light is considered to be received.
 * 
 * The sensor value is the sum of the light intensities of all lights that are
 * not blocked, normalized to a calibrated value from measurements on a Wombat.
 */
class LightSensor extends SensorObject<Node.LightSensor, number> {
  private trace_: AbstractMesh;
  private rayTrace_: LinesMesh;

  // Calibrated value from real sensor with overhead light on
  private static AMBIENT_LIGHT_VALUE = 4095 - 3645;

  private static DEFAULT_NOISE_RADIUS = 10;

  private static lightValue_ = (distance: Distance) => {
    const cm = Distance.toCentimetersValue(distance);
    if (cm < 0) return 0;
    return 4095 - 19.4 + -0.678 * cm + 0.058 * cm * cm + -5.89e-04 * cm * cm * cm;
  };

  constructor(parameters: SensorParameters<Node.LightSensor>) {
    super(parameters);

    const { id, scene, definition, parent } = parameters;
    const { origin } = definition;


    this.trace_ = IcoSphereBuilder.CreateIcoSphere(`${id}-light-sensor-trace`, {
      radius: 0.01,
      subdivisions: 1,
    });

    this.trace_.material = new StandardMaterial(`${id}-light-sensor-trace-material`, scene);
    this.trace_.material.wireframe = true;


    ReferenceFramewUnits.syncBabylon(origin, this.trace_, 'meters');
    this.trace_.parent = parameters.parent;

    this.trace_.visibility = 0;
  }

  intersects(ray: Ray) {
    const { scene } = this.parameters;
    const meshes = scene.getActiveMeshes();

    let hit = false;
    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes.data[i];
      if (mesh === this.trace_) continue;
      if (!mesh.physicsImpostor) continue;
      hit = ray.intersectsBox(mesh.getBoundingInfo().boundingBox);
      if (hit) break;
    }

    return hit;
  }

  override getValue(): Promise<number> {
    const { scene } = this.parameters;
    this.trace_.visibility = this.visible ? 1 : 0;

    const position = Vector3wUnits.fromRaw(RawVector3.fromBabylon(this.trace_.getAbsolutePosition()), RENDER_SCALE);

    let valueSum = 0;
    for (const light of scene.lights) {
      if (!light.isEnabled(false)) continue;
      if (light instanceof HemisphericLight) {
        valueSum += light.intensity * LightSensor.AMBIENT_LIGHT_VALUE;
        continue;
      }

      const intensity = light.getScaledIntensity();
      const lightPosition = Vector3wUnits.fromRaw(RawVector3.fromBabylon(light.getAbsolutePosition()), RENDER_SCALE);
      const offset = Vector3wUnits.subtract(position, lightPosition);
      const distance = Vector3wUnits.length(offset);
      const ray = new Ray(
        Vector3wUnits.toBabylon(position, RENDER_SCALE),
        Vector3wUnits.toBabylon(offset, RENDER_SCALE),
        Distance.toValue(distance, RENDER_SCALE)
      );

      if (this.intersects(ray)) continue;

      // If the light is directional, determine if it is pointing towards the
      // sensor. If not, it is not received.
      if (light instanceof DirectionalLight) {
        const direction = Vector3.Forward(true)
          .applyRotationQuaternion(Quaternion.FromEulerVector(light.getRotation()));

        const dot = Vector3.Dot(direction, Vector3wUnits.toBabylon(offset, RENDER_SCALE));
        const angle = Math.acos(dot / Distance.toValue(Vector3wUnits.length(offset), RENDER_SCALE));

        if (angle > Math.PI / 2) continue;
      }

      // Similar for spot light
      if (light instanceof SpotLight) {
        const direction = Vector3.Forward(true)
          .applyRotationQuaternion(Quaternion.FromEulerVector(light.getRotation()));

        const dot = Vector3.Dot(direction, Vector3wUnits.toBabylon(offset, RENDER_SCALE));
        const angle = Math.acos(dot / Distance.toValue(Vector3wUnits.length(offset), RENDER_SCALE));

        if (angle > light.angle / 2) continue;
      }

      valueSum += intensity * LightSensor.lightValue_(distance);
    }

    if (this.noisy) {
      const offset = Math.floor(LightSensor.DEFAULT_NOISE_RADIUS * Math.random() * 2) - LightSensor.DEFAULT_NOISE_RADIUS;
      valueSum -= offset;
    }

    return Promise.resolve(4095 - clamp(0, valueSum, 4095));
  }

  override dispose(): void {
    this.trace_.dispose();
  }
}

export default LightSensor;