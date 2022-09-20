import construct from '../util/construct';
import MotorDirection from './MotorDirection';
import MotorMode from './MotorMode'
import WriteCommand from './WriteCommand';

interface AbstractRobot {
  getMotor(port: number): AbstractRobot.Motor;
  getServoPosition(port: number): number;

  apply(writeCommands: WriteCommand[]);
}

namespace AbstractRobot {
  export namespace Motor {
    export enum Type {
      Pwm = 'pwm',
      Position = 'position',
      Speed = 'speed',
      SpeedPosition = 'speed-position',
    }

    interface Base {
      position: number;
      direction: MotorDirection;
    }

    export interface Pwm extends Base {
      type: Type.Pwm;

      pwm: number;
    }

    export const pwm = construct<Pwm>(Type.Pwm);

    export interface Pid {
      kP: number;
      kI: number;
      kD: number;
    }

    export interface Position extends Base, Pid {
      type: Type.Position;
      done: boolean;
      positionGoal: number;
    }

    export const position = construct<Position>(Type.Position);

    export interface Speed extends Base, Pid {
      type: Type.Speed;
      done: boolean;
      speedGoal: number;
    }

    export const speed = construct<Speed>(Type.Speed);

    export interface SpeedPosition extends Base, Pid {
      type: Type.SpeedPosition;
      done: boolean;
      speedGoal: number;
      positionGoal: number;
    }

    export const speedPosition = construct<SpeedPosition>(Type.SpeedPosition);
  }

  export type Motor = (
    Motor.Pwm |
    Motor.Position |
    Motor.Speed |
    Motor.SpeedPosition
  );

  export interface Stateless {
    motors: [Motor, Motor, Motor, Motor];
    servoPositions: [number, number, number, number];
  }

  export const toStateless = (robot: AbstractRobot): Stateless => ({
    motors: [
      robot.getMotor(0),
      robot.getMotor(1),
      robot.getMotor(2),
      robot.getMotor(3),
    ],
    servoPositions: [
      robot.getServoPosition(0),
      robot.getServoPosition(1),
      robot.getServoPosition(2),
      robot.getServoPosition(3),
    ],
  });
}

export default AbstractRobot;

