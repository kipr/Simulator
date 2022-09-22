import deepNeq from '../deepNeq';
import construct from '../util/construct';
import Patch from '../util/Patch';
import { Motor } from './Motor';
import WriteCommand from './WriteCommand';

type AbstractRobot = AbstractRobot.Readable & AbstractRobot.Writable;

namespace AbstractRobot {
  export interface Readable {
    getMotor(port: number): Motor;
    getServoPosition(port: number): number;
    getAnalogValue(port: number): number;
    getDigitalValue(port: number): boolean;
  }
  
  export interface Writable {
    apply(writeCommands: WriteCommand[]);
    sync(stateless: AbstractRobot.Stateless);
  }

  export class Stateless implements Readable {
    motors: Stateless.Motors;
    servoPositions: Stateless.ServoPositions;
    analogValues: Stateless.AnalogValues;
    digitalValues: Stateless.DigitalValues;

    constructor(motors: Stateless.Motors, servoPositions: Stateless.ServoPositions, analogValues: Stateless.AnalogValues, digitalValues: Stateless.DigitalValues) {
      this.motors = motors;
      this.servoPositions = servoPositions;
      this.analogValues = analogValues;
      this.digitalValues = digitalValues;
    }

    getMotor(port: number): Motor {
      return this.motors[port];
    }

    getServoPosition(port: number): number {
      return this.servoPositions[port];
    }

    getAnalogValue(port: number): number {
      return this.analogValues[port];
    }

    getDigitalValue(port: number): boolean {
      return this.digitalValues[port];
    }
  }

  export namespace Stateless {
    export type Motors = [Motor, Motor, Motor, Motor];
    export type ServoPositions = [number, number, number, number];
    export type AnalogValues = [number, number, number, number, number, number];
    export type DigitalValues = [boolean, boolean, boolean, boolean, boolean, boolean];

    export const NIL = new Stateless([
        Motor.NIL,
        Motor.NIL,
        Motor.NIL,
        Motor.NIL,
      ],
      [400, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [false, false, false, false, false, false]
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
  ], [
    robot.getAnalogValue(0),
    robot.getAnalogValue(1),
    robot.getAnalogValue(2),
    robot.getAnalogValue(3),
    robot.getAnalogValue(4),
    robot.getAnalogValue(5),
  ], [
    robot.getDigitalValue(0),
    robot.getDigitalValue(1),
    robot.getDigitalValue(2),
    robot.getDigitalValue(3),
    robot.getDigitalValue(4),
    robot.getDigitalValue(5),
  ]);
}

export default AbstractRobot;

