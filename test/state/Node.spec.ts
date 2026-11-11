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

describe('Node.clearStartAsleepIfStartMoved', () => {
  const pom = (startX: number, startAsleep = true): Node.Obj => ({
    type: 'object',
    name: NAME,
    geometryId: 'pom',
    origin: frame(startX),
    startingOrigin: frame(startX),
    physics: { type: 'sphere', startAsleep },
  });

  it('clears startAsleep when the starting pose moves', () => {
    const next = Node.clearStartAsleepIfStartMoved(pom(1), pom(2)) as Node.Obj;
    expect(next.physics.startAsleep).toBe(false);
  });

  it('keeps startAsleep when only the current pose moves', () => {
    // The robot pushing a piece changes its origin, not its starting pose.
    const prev = pom(1);
    const next = { ...prev, origin: frame(5) };
    expect(Node.clearStartAsleepIfStartMoved(prev, next)).toBe(next);
  });

  it('compares starting poses by value', () => {
    const next = pom(1);
    expect(Node.clearStartAsleepIfStartMoved(pom(1), next)).toBe(next);
  });

  it('keeps startAsleep on a node being added', () => {
    const next = pom(1);
    expect(Node.clearStartAsleepIfStartMoved(undefined, next)).toBe(next);
  });

  it('leaves objects without startAsleep unchanged', () => {
    const next = pom(2, false);
    expect(Node.clearStartAsleepIfStartMoved(pom(1, false), next)).toBe(next);
  });
});


describe('Node hiddenInWorldList metadata', () => {
  it.each([undefined, false, true])('preserves %s through base conversions', hiddenInWorldList => {
    const node: Node.Obj = { type: 'object', name: NAME, geometryId: 'pom', hiddenInWorldList };
    expect(Node.Base.upcast(node).hiddenInWorldList).toBe(hiddenInWorldList);
    expect(Node.Empty.from(node).hiddenInWorldList).toBe(hiddenInWorldList);
  });

  it.each([
    [undefined, true], [false, true], [true, false], [true, undefined],
  ])('patches %s to %s without changing simulation properties', (before, after) => {
    const prev: Node.Obj = {
      type: 'object', name: NAME, geometryId: 'pom', visible: true,
      physics: { type: 'sphere' }, hiddenInWorldList: before,
    };
    const next = { ...prev, hiddenInWorldList: after };
    expect(Patch.apply(Node.diff(prev, next), prev)).toEqual(next);
  });
});
