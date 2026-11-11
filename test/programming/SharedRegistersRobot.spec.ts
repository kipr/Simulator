import AbstractRobot from '../../src/programming/AbstractRobot';
import Motor from '../../src/programming/AbstractRobot/Motor';
import SharedRegistersRobot from '../../src/programming/SharedRegistersRobot';
import SharedRegisters from '../../src/programming/registers/SharedRegisters';

describe('SharedRegistersRobot', () => {
  it('round-trips motor positions through sync without changing units', () => {
    const positions = [1234, -567, 1, 0] as const;
    const motors = positions.map(position => ({
      ...Motor.NIL,
      position,
    })) as AbstractRobot.Stateless.Motors;
    const state = new AbstractRobot.Stateless(
      motors,
      AbstractRobot.Stateless.NIL.servos,
      AbstractRobot.Stateless.NIL.analogValues,
      AbstractRobot.Stateless.NIL.digitalValues,
    );
    const robot = new SharedRegistersRobot(new SharedRegisters());

    robot.sync(state);

    expect(positions.map((_, port) => robot.getMotor(port).position)).toEqual(positions);
  });
});
