import { Quaternion } from '@babylonjs/core';

import { RawQuaternion, RawVector3 } from '../../src/util/math/math';
import {
  incrementalHingeRotation,
  parentRelativeOrientation,
} from '../../src/simulator/babylonBindings/motorPosition';

const quaternion = (q: Quaternion): RawQuaternion => RawQuaternion.fromBabylon(q);

const worldOrientations = (world: Quaternion, angle: number) => ({
  parent: quaternion(world),
  child: quaternion(
    world
      .multiply(Quaternion.FromEulerAngles(angle, 0, 0))
      .multiply(Quaternion.FromEulerAngles(0, 0, Math.PI / 2)),
  ),
});

describe('motor position quaternion tracking', () => {
  it.each([1, -1])('accumulates complete revolutions in direction %i', direction => {
    const world = Quaternion.FromEulerAngles(0.7, -0.4, 1.1);
    const samples = 32;
    let previous: RawQuaternion | undefined;
    let accumulated = 0;

    for (let i = 0; i <= samples; ++i) {
      const orientations = worldOrientations(world, direction * 2 * Math.PI * i / samples);
      const current = parentRelativeOrientation(orientations.parent, orientations.child);
      if (previous) {
        accumulated += incrementalHingeRotation(previous, current, RawVector3.X);
      }
      previous = current;
    }

    expect(accumulated).toBeCloseTo(direction * 2 * Math.PI, 10);
  });

  it('does not count changes to the robot world orientation', () => {
    const first = worldOrientations(Quaternion.Identity(), 0.3);
    const second = worldOrientations(Quaternion.FromEulerAngles(0.8, -1.2, 0.4), 0.3);

    const previous = parentRelativeOrientation(first.parent, first.child);
    const current = parentRelativeOrientation(second.parent, second.child);

    expect(incrementalHingeRotation(previous, current, RawVector3.X)).toBeCloseTo(0, 10);
  });

  it('ignores equivalent quaternion sign changes', () => {
    const orientation = RawQuaternion.normalize(RawQuaternion.create(0.2, -0.3, 0.4, 0.8));
    const negated = RawQuaternion.create(
      -orientation.x,
      -orientation.y,
      -orientation.z,
      -orientation.w,
    );

    expect(incrementalHingeRotation(orientation, negated, RawVector3.X)).toBeCloseTo(0, 10);
  });
});
