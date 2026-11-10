import { BOTBALL_EXPLORER_TABLE_26_NODES } from '../../src/simulator/definitions/scenes/2026BotballExplorerTable';
import { FALL_27_TABLE_NODES, FALL_27_GAME_PIECE_NODES } from '../../src/simulator/definitions/scenes/2027FallGameTable';
import { BOTBALL_EXPLORER_26_SANDBOX } from '../../src/simulator/definitions/scenes/26botballExplorerSandbox';
import { FALL_27_SANDBOX } from '../../src/simulator/definitions/scenes/27fallTableSandbox';
import { BEX_1 } from '../../src/simulator/definitions/scenes/bex26/bex1-Waypoint-Alpha';

describe('predefined World list visibility', () => {
  it.each([BOTBALL_EXPLORER_TABLE_26_NODES, FALL_27_TABLE_NODES])('hides all fixed table structure without hiding meshes', nodes => {
    expect(Object.keys(nodes).length).toBeGreaterThan(0);
    for (const node of Object.values(nodes)) {
      expect(node.hiddenInWorldList).toBe(true);
      expect(node.visible).toBe(true);
    }
  });

  it('keeps all Fall game pieces listed', () => {
    for (const node of Object.values(FALL_27_GAME_PIECE_NODES)) {
      expect(node.hiddenInWorldList).not.toBe(true);
    }
  });

  it.each([BOTBALL_EXPLORER_26_SANDBOX, FALL_27_SANDBOX, BEX_1])('inherits hidden structure while keeping robots and other nodes listed', scene => {
    const structure = scene === FALL_27_SANDBOX ? FALL_27_TABLE_NODES : BOTBALL_EXPLORER_TABLE_26_NODES;
    for (const id of Object.keys(structure)) {
      expect(scene.nodes[id].hiddenInWorldList).toBe(true);
    }
    for (const [id, node] of Object.entries(scene.nodes)) {
      if (!(id in structure)) expect(node.hiddenInWorldList).not.toBe(true);
    }
    expect(scene.nodes.robot.hiddenInWorldList).not.toBe(true);
  });
});
