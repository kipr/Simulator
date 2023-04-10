import { Distance } from '../util/Value';
import Node from '../state/State/Robot/Node';
import { ReferenceFrame, Vector3 } from '../unit-math';
import SensorObject from './SensorObject';
import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { LinesMesh as BabylonLinesMesh } from '@babylonjs/core/Meshes/linesMesh';
import SensorParameters from './SensorParameters';
import { Ray as BabylonRay } from '@babylonjs/core/Culling/ray';
import { IcoSphereBuilder as BabylonIcoSphereBuilder } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder'; 
import { StandardMaterial as BabylonStandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { HemisphericLight as BabylonHemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { SpotLight as BabylonSpotLight } from '@babylonjs/core/Lights/spotLight';
import { DirectionalLight as BabylonDirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { Vector3 as RawVector3, clamp } from '../math';
import { RENDER_SCALE } from '../renderConstants';
import { Vector3 as BabylonVector3, Quaternion as BabylonQuaternion } from '@babylonjs/core/Maths/math.vector';

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
  private trace_: BabylonAbstractMesh;
  private rayTrace_: BabylonLinesMesh;

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
    

    this.trace_ = BabylonIcoSphereBuilder.CreateIcoSphere(`${id}-light-sensor-trace`, {
      radius: 0.01,
      subdivisions: 1,
    });

    this.trace_.material = new BabylonStandardMaterial(`${id}-light-sensor-trace-material`, scene);
    this.trace_.material.wireframe = true;


    ReferenceFrame.syncBabylon(origin, this.trace_, 'meters');
    this.trace_.parent = parameters.parent;

    this.trace_.visibility = 0;
  }

  intersects(ray: BabylonRay) {
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

    const position = Vector3.fromRaw(RawVector3.fromBabylon(this.trace_.getAbsolutePosition()), RENDER_SCALE);

    let valueSum = 0;
    for (const light of scene.lights) {
      if (!light.isEnabled(false)) continue;
      if (light instanceof BabylonHemisphericLight) {
        valueSum += light.intensity * LightSensor.AMBIENT_LIGHT_VALUE;
        continue;
      }

      const intensity = light.getScaledIntensity();
      const lightPosition = Vector3.fromRaw(RawVector3.fromBabylon(light.getAbsolutePosition()), RENDER_SCALE);
      const offset = Vector3.subtract(position, lightPosition);
      const distance = Vector3.length(offset);
      const ray = new BabylonRay(
        Vector3.toBabylon(position, RENDER_SCALE),
        Vector3.toBabylon(offset, RENDER_SCALE),
        Distance.toValue(distance, RENDER_SCALE)
      );

      if (this.intersects(ray)) continue;

      // If the light is directional, determine if it is pointing towards the
      // sensor. If not, it is not received.
      if (light instanceof BabylonDirectionalLight) {
        const direction = BabylonVector3.Forward(true)
          .applyRotationQuaternion(BabylonQuaternion.FromEulerVector(light.getRotation()));
        
        const dot = BabylonVector3.Dot(direction, Vector3.toBabylon(offset, RENDER_SCALE));
        const angle = Math.acos(dot / Distance.toValue(Vector3.length(offset), RENDER_SCALE));

        if (angle > Math.PI / 2) continue;
      }

      // Similar for spot light
      if (light instanceof BabylonSpotLight) {
        const direction = BabylonVector3.Forward(true)
          .applyRotationQuaternion(BabylonQuaternion.FromEulerVector(light.getRotation()));
        
        const dot = BabylonVector3.Dot(direction, Vector3.toBabylon(offset, RENDER_SCALE));
        const angle = Math.acos(dot / Distance.toValue(Vector3.length(offset), RENDER_SCALE));

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