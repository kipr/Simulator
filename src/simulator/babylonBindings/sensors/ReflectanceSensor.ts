import { LinesMesh, CreateLines, Vector3, Mesh, Ray } from '@babylonjs/core';

import { Distance } from '../../../util/math/Value';
import SensorParameters from './SensorParameters';
import SensorObject from './SensorObject';
import Node from '../../../state/State/Robot/Node';
import { ReferenceFramewUnits } from '../../../util/math/unitMath';
import { clamp } from '../../../util/math/math';
import { RENDER_SCALE } from '../../../components/constants/renderConstants';


class ReflectanceSensor extends SensorObject<Node.ReflectanceSensor, number> {
  private trace_: LinesMesh;

  private lastHitTextureId_: string | null = null;
  private lastHitPixels_: ArrayBufferView | null = null;

  private static readonly DEFAULT_MAX_DISTANCE = Distance.centimeters(1.5);
  private static readonly DEFAULT_NOISE_RADIUS = Distance.centimeters(10);
  private static readonly FORWARD: Vector3 = new Vector3(0, 0, 1);

  constructor(parameters: SensorParameters<Node.ReflectanceSensor>) {
    super(parameters);

    const { id, scene, definition, parent } = parameters;
    const { origin, maxDistance } = definition;

    // The trace will be parented to a link that is already scaled, so we don't need to apply
    // RENDER_SCALE again.

    const rawMaxDistance = Distance.toMetersValue(maxDistance ?? ReflectanceSensor.DEFAULT_MAX_DISTANCE);
    this.trace_ = CreateLines(id, {
      points: [
        Vector3.Zero(),
        ReflectanceSensor.FORWARD.multiplyByFloats(rawMaxDistance, rawMaxDistance, rawMaxDistance)
      ],
    }, scene);
    this.trace_.visibility = 1;

    ReferenceFramewUnits.syncBabylon(origin, this.trace_, 'meters');
    this.trace_.parent = parent;
  }

  override async getValue(): Promise<number> {
    const { scene, definition, links, colliders } = this.parameters;
    const { maxDistance, noiseRadius } = definition;

    const rawMaxDistance = Distance.toValue(maxDistance || ReflectanceSensor.DEFAULT_MAX_DISTANCE, RENDER_SCALE);
    // this.trace_.visibility = this.visible ? 1 : 0;
    this.trace_.visibility = 1;

    const ray = new Ray(
      this.trace_.absolutePosition,
      ReflectanceSensor.FORWARD.applyRotationQuaternion(this.trace_.absoluteRotationQuaternion),
      rawMaxDistance
    );

    const hit = scene.pickWithRay(ray, mesh => {
      return mesh !== this.trace_ && !links.has(mesh as Mesh) && !colliders.has(mesh as Mesh);
    });

    if (!hit.pickedMesh || !hit.pickedMesh.material || hit.pickedMesh.material.getActiveTextures().length === 0) return 0;

    let sensorValue = 0;

    const hitTexture = hit.pickedMesh.material.getActiveTextures()[0];

    // Only reprocess the texture if we hit a different texture than before
    if (this.lastHitTextureId_ === null || this.lastHitTextureId_ !== hitTexture.uid) {
      if (hitTexture.isReady()) {
        this.lastHitTextureId_ = hitTexture.uid;
        this.lastHitPixels_ = await hitTexture.readPixels();
      } else {
        // Texture isn't ready yet, so nothing we can do
        this.lastHitTextureId_ = null;
        this.lastHitPixels_ = null;
      }
    }

    if (this.lastHitPixels_ !== null) {
      const hitTextureCoordinates = hit.getTextureCoordinates();
      const arrayIndex = Math.floor(hitTextureCoordinates.x * (hitTexture.getSize().width - 1)) * 4 + Math.floor(hitTextureCoordinates.y * (hitTexture.getSize().height - 1)) * hitTexture.getSize().width * 4;

      const r = this.lastHitPixels_[arrayIndex] as number;
      const g = this.lastHitPixels_[arrayIndex + 1] as number;
      const b = this.lastHitPixels_[arrayIndex + 2] as number;

      // Crude conversion from RGB to grayscale
      const colorAverage = (r + g + b) / 3;

      // Value is a grayscale percentage of 4095
      sensorValue = Math.floor(4095 * (1 - (colorAverage / 255)));
    }

    if (this.noisy) {
      const noise = Distance.toValue(noiseRadius || ReflectanceSensor.DEFAULT_NOISE_RADIUS, RENDER_SCALE);
      const offset = Math.floor(noise * Math.random() * 2) - noise;
      sensorValue -= offset;
    }

    return clamp(0, sensorValue, 4095);
  }

  override dispose(): void {
    this.trace_.dispose();
  }
}

export default ReflectanceSensor; 