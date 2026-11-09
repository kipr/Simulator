import Node from '../../src/state/State/Scene/Node';
import LocalizedString from '../../src/util/LocalizedString';
import Patch from '../../src/util/redux/Patch';
import { RawVector3 } from '../../src/util/math/math';
import { RotationwUnits, Vector3wUnits } from '../../src/util/math/unitMath';

const NAME = { [LocalizedString.EN_US]: 'Pom' };

const frame = (x: number, y = 0) => ({
  position: Vector3wUnits.centimeters(x, y, 0),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
});

describe('Node.Base.isAtStartingOrigin', () => {
  it('is true when the origin matches the starting origin', () => {
    expect(Node.Base.isAtStartingOrigin({ name: NAME, origin: frame(1), startingOrigin: frame(1) })).toBe(true);
  });

  it('compares values, not object identity', () => {
    // A reset copies the starting pose into a new origin object.
    const startingOrigin = frame(1);
    const origin = { ...startingOrigin, position: { ...startingOrigin.position } };
    expect(Node.Base.isAtStartingOrigin({ name: NAME, origin, startingOrigin })).toBe(true);
  });

  it('is false when the node has moved', () => {
    expect(Node.Base.isAtStartingOrigin({ name: NAME, origin: frame(1, 5), startingOrigin: frame(1) })).toBe(false);
  });

  it('is false without both origins', () => {
    expect(Node.Base.isAtStartingOrigin({ name: NAME, origin: frame(1) })).toBe(false);
    expect(Node.Base.isAtStartingOrigin({ name: NAME, startingOrigin: frame(1) })).toBe(false);
  });

  it('treats a missing scale as no scaling', () => {
    // The world panel's reset fills in a scale of one.
    expect(Node.Base.isAtStartingOrigin({
      name: NAME,
      origin: { ...frame(1), scale: RawVector3.ONE },
      startingOrigin: frame(1),
    })).toBe(true);
    expect(Node.Base.isAtStartingOrigin({
      name: NAME,
      origin: { ...frame(1), scale: RawVector3.create(2, 2, 2) },
      startingOrigin: frame(1),
    })).toBe(false);
  });
});

describe('Node.Physics.diff', () => {
  it('reports a startAsleep change', () => {
    const prev: Node.Physics = { type: 'sphere', startAsleep: false };
    const patch = Node.Physics.diff(prev, { ...prev, startAsleep: true });
    expect(patch.type).toBe(Patch.Type.InnerChange);
  });
});
