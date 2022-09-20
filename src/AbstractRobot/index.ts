import deepNeq from '../deepNeq';
import construct from '../util/construct';
import Patch from '../util/Patch';
import MotorDirection from './MotorDirection';
import MotorMode from './MotorMode'
import WriteCommand from './WriteCommand';

type AbstractRobot = AbstractRobot.Readable & AbstractRobot.Writable;

namespace AbstractRobot {
  export interface Readable {
    getMotor(port: number): AbstractRobot.Motor;
    getServoPosition(port: number): number;
  }
  
  export interface Writable {
    apply(writeCommands: WriteCommand[]);
    sync(stateless: AbstractRobot.Stateless);
  }

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
      pwm: number;
    }

    export interface Pwm extends Base {
      type: Type.Pwm;
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

  export class Stateless implements Readable {
    motors: Stateless.Motors;
    servoPositions: Stateless.ServoPositions;

    constructor(motors: Stateless.Motors, servoPositions: Stateless.ServoPositions) {
      this.motors = motors;
      this.servoPositions = servoPositions;
    }

    getMotor(port: number): Motor {
      return this.motors[port];
    }

    getServoPosition(port: number): number {
      return this.servoPositions[port];
    }
  }

  export namespace Stateless {
    export type Motors = [Motor, Motor, Motor, Motor];
    export type ServoPositions = [number, number, number, number];

    export const NIL = new Stateless([
        Motor.pwm({ position: 0, direction: MotorDirection.Idle, pwm: 0 }),
        Motor.pwm({ position: 0, direction: MotorDirection.Idle, pwm: 0 }),
        Motor.pwm({ position: 0, direction: MotorDirection.Idle, pwm: 0 }),
        Motor.pwm({ position: 0, direction: MotorDirection.Idle, pwm: 0 }),
      ],
      [0, 0, 0, 0],
    );

    export const diff = (a: Stateless, b: Stateless): Patch<Stateless> => {
      if (!deepNeq(a, b)) return Patch.none(a);
      
      return Patch.outerChange(a, b);
    };
  }

  export const toStateless = (robot: AbstractRobot) => new Stateless([
    robot.getMotor(0),
    robot.getMotor(1),
    robot.getMotor(2),
    robot.getMotor(3),
  ], [
    robot.getServoPosition(0),
    robot.getServoPosition(1),
    robot.getServoPosition(2),
    robot.getServoPosition(3),
  ]);
}

export default AbstractRobot;

