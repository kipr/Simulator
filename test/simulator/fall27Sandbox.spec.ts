import { FALL_27_SANDBOX } from '../../src/simulator/definitions/scenes/27fallTableSandbox';
import Node from '../../src/state/State/Scene/Node';

const physicsNodes = Object.entries(FALL_27_SANDBOX.nodes)
  .filter((entry): entry is [string, Node.Obj] => entry[1].type === 'object' && !!entry[1].physics);

describe('2026-2027 fall game table sandbox', () => {
  it('has physics objects', () => {
    expect(physicsNodes.length).toBeGreaterThan(0);
  });

  // Every body has to start asleep, static ones included: adding an awake
  // static body wakes the sleeping game pieces that touch it.
  it('starts every physics object asleep', () => {
    const awake = physicsNodes.filter(([, node]) => !node.physics.startAsleep).map(([id]) => id);
    expect(awake).toEqual([]);
  });

  it('places every physics object at its starting pose', () => {
    const moved = physicsNodes.filter(([, node]) => !Node.Base.isAtStartingOrigin(node)).map(([id]) => id);
    expect(moved).toEqual([]);
  });
});
