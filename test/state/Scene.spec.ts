import Scene from '../../src/state/State/Scene';
import Node from '../../src/state/State/Scene/Node';
import LocalizedString from '../../src/util/LocalizedString';
import { Vector3wUnits } from '../../src/util/math/unitMath';

const originAt = (x: number, z: number) => ({
  position: Vector3wUnits.centimeters(x, 0, z),
});

const sceneWith = (nodes: Scene['nodes']): Scene => ({
  ...Scene.EMPTY,
  nodes,
});

describe('Scene.copyRobotStartingOrigins', () => {
  it('copies robot startingOrigin onto the target and sets origin to match', () => {
    const source = sceneWith({
      robot: {
        ...Node.Robot.NIL,
        robotId: 'demobot',
        origin: originAt(50, 10),
        startingOrigin: originAt(25, 5),
      },
      can: {
        type: 'object',
        name: { [LocalizedString.EN_US]: 'Can' },
        geometryId: 'can',
        origin: originAt(1, 1),
        startingOrigin: originAt(0, 0),
      },
    });
    const target = sceneWith({
      robot: {
        ...Node.Robot.NIL,
        robotId: 'demobot',
        origin: originAt(0, 0),
        startingOrigin: originAt(0, 0),
      },
      can: {
        type: 'object',
        name: { [LocalizedString.EN_US]: 'Can' },
        geometryId: 'can',
        origin: originAt(9, 9),
        startingOrigin: originAt(0, 0),
      },
    });

    const next = Scene.copyRobotStartingOrigins(source, target);
    const robot = next.nodes.robot;
    expect(robot.type).toBe('robot');
    expect(robot.startingOrigin).toEqual(originAt(25, 5));
    expect(robot.origin).toEqual({
      position: originAt(25, 5).position,
      orientation: undefined,
      scale: undefined,
    });
    expect(next.nodes.can.origin).toEqual(originAt(9, 9));
    expect(next.nodes.can.startingOrigin).toEqual(originAt(0, 0));
  });

  it('leaves the target unchanged when there is no matching robot start pose', () => {
    const source = sceneWith({
      other: {
        ...Node.Robot.NIL,
        robotId: 'demobot',
        startingOrigin: originAt(3, 3),
      },
    });
    const target = sceneWith({
      robot: {
        ...Node.Robot.NIL,
        robotId: 'demobot',
        origin: originAt(0, 0),
        startingOrigin: originAt(0, 0),
      },
    });

    expect(Scene.copyRobotStartingOrigins(source, target)).toBe(target);
  });
});
