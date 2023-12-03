import deepNeq from '../util/redux/deepNeq';
import Patch from '../util/redux/Patch';
import Motor from './Motor';
import Servo from './Servo';
import WriteCommand from './WriteCommand';

/**
 * The AbstractRobot type is a combination of Readable and Writable interfaces, meaning any object of 
 * type AbstractRobot should have methods defined in both Readable and Writable interfaces.
 */
type AbstractRobot = AbstractRobot.Readable & AbstractRobot.Writable;

namespace AbstractRobot {
  /**
   * Represents a readable interface for accessing robot components.
   * The Readable interface defines the methods that must be implemented by 
   * any class that wants to be considered as "readable". 
   * In this case, the Stateless class implements this interface, meaning it 
   * provides implementations for all the methods defined in the Readable interface.
   */
  export interface Readable {
    /**
     * Retrieves the motor object associated with the specified port.
     * @param port - The port number of the motor.
     * @returns The motor object.
     */
    getMotor(port: number): Motor;

    /**
     * Retrieves the servo object associated with the specified port.
     * @param port - The port number of the servo.
     * @returns The servo object.
     */
    getServo(port: number): Servo;

    /**
     * Retrieves the analog value of the component connected to the specified port.
     * @param port - The port number of the analog component.
     * @returns The analog value.
     */
    getAnalogValue(port: number): number;

    /**
     * Retrieves the digital value of the component connected to the specified port.
     * @param port - The port number of the digital component.
     * @returns The digital value.
     */
    getDigitalValue(port: number): boolean;
  }
  
  /**
   * The Writable interface defines methods for applying write commands and syncing state with a Stateless instance.
   */
  export interface Writable {
    apply(writeCommands: WriteCommand[]);
    sync(stateless: AbstractRobot.Stateless);
  }

  /**
   * Represents a stateless robot with motors, servos, analog values, and digital values.
   */
  export class Stateless implements Readable {
    motors: Stateless.Motors;
    servos: Stateless.Servos;
    analogValues: Stateless.AnalogValues;
    digitalValues: Stateless.DigitalValues;

    /**
     * Creates a new instance of the `Stateless` class.
     * @param motors - The motors of the robot.
     * @param servos - The servos of the robot.
     * @param analogValues - The analog values of the robot.
     * @param digitalValues - The digital values of the robot.
     */
    constructor(motors: Stateless.Motors, servos: Stateless.Servos, analogValues: Stateless.AnalogValues, digitalValues: Stateless.DigitalValues) {
      this.motors = motors;
      this.servos = servos;
      this.analogValues = analogValues;
      this.digitalValues = digitalValues;
    }

    /**
     * Gets the motor at the specified port.
     * @param port - The port number of the motor.
     * @returns The motor at the specified port.
     */
    getMotor(port: number): Motor {
      return this.motors[port];
    }

    /**
     * Gets the servo at the specified port.
     * @param port - The port number of the servo.
     * @returns The servo at the specified port.
     */
    getServo(port: number): Servo {
      return this.servos[port];
    }

    /**
     * Gets the analog value at the specified port.
     * @param port - The port number of the analog value.
     * @returns The analog value at the specified port.
     */
    getAnalogValue(port: number): number {
      return this.analogValues[port];
    }

    /**
     * Gets the digital value at the specified port.
     * @param port - The port number of the digital value.
     * @returns The digital value at the specified port.
     */
    getDigitalValue(port: number): boolean {
      return this.digitalValues[port];
    }
  }

  /**
   * Represents the namespace for the stateless robot.
   */
  export namespace Stateless {
    /**
     * Represents the type for the motors of the stateless robot.
     */
    export type Motors = [Motor, Motor, Motor, Motor];

    /**
     * Represents the type for the servos of the stateless robot.
     */
    export type Servos = [Servo, Servo, Servo, Servo];

    /**
     * Represents the type for the analog values of the stateless robot.
     */
    export type AnalogValues = [number, number, number, number, number, number];

    /**
     * Represents the type for the digital values of the stateless robot.
     */
    export type DigitalValues = [boolean, boolean, boolean, boolean, boolean, boolean];

    /**
     * Represents the NIL state of the stateless robot.
     */
    export const NIL = new Stateless(
      [
        Motor.NIL,
        Motor.NIL,
        Motor.NIL,
        Motor.NIL,
      ],
      [
        { enabled: true, position: 750 },
        { enabled: true, position: 0 },
        { enabled: true, position: 0 },
        { enabled: true, position: 2047 }
      ],
      [0, 0, 0, 0, 0, 0],
      [false, false, false, false, false, false]
    );

    /**
     * Calculates the difference between two stateless robot states.
     * @param a - The first stateless robot state.
     * @param b - The second stateless robot state.
     * @returns The patch representing the difference between the two states.
     */
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

