import deepNeq from '../deepNeq';
import Patch from '../util/Patch';
import Motor from './Motor';
import Servo from './Servo';
import WriteCommand from './WriteCommand';

type AbstractRobot = AbstractRobot.Readable & AbstractRobot.Writable;

namespace AbstractRobot {
  export interface Readable {
    getMotor(port: number): Motor;
    getServo(port: number): Servo;
    getAnalogValue(port: number): number;
    getDigitalValue(port: number): boolean;
  }
  
  export interface Writable {
    apply(writeCommands: WriteCommand[]);
    sync(stateless: AbstractRobot.Stateless);
  }

  export class Stateless implements Readable {
    motors: Stateless.Motors;
    servos: Stateless.Servos;
    analogValues: Stateless.AnalogValues;
    digitalValues: Stateless.DigitalValues;

    constructor(motors: Stateless.Motors, servos: Stateless.Servos, analogValues: Stateless.AnalogValues, digitalValues: Stateless.DigitalValues) {
      this.motors = motors;
      this.servos = servos;
      this.analogValues = analogValues;
      this.digitalValues = digitalValues;
    }

    getMotor(port: number): Motor {
      return this.motors[port];
    }

    getServo(port: number): Servo {
      return this.servos[port];
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
    export type Servos = [Servo, Servo, Servo, Servo];
    export type AnalogValues = [number, number, number, number, number, number];
    export type DigitalValues = [boolean, boolean, boolean, boolean, boolean, boolean];

    export const NIL = new Stateless([
      Motor.NIL,
      Motor.NIL,
      Motor.NIL,
      Motor.NIL,
    ],
    [{ enabled: true, position: 750 }, { enabled: true, position: 0 }, { enabled: true, position: 0 }, { enabled: true, position: 2047 }],
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
    robot.getServo(0),
    robot.getServo(1),
    robot.getServo(2),
    robot.getServo(3),
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

