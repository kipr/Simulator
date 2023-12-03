/**
 * @description The provided TypeScript code defines an interface and a namespace, both named Motor.

  The Motor interface describes the shape of an object that represents a motor in your system. This interface has several properties:

  * mode: This property is of type Motor.Mode, which is an enumeration defined within the Motor namespace. 
      The Mode enumeration defines four possible modes for the motor: Pwm, Speed, Position, and SpeedPosition.
  * direction: This property is of type Motor.Direction, another enumeration within the Motor namespace. 
      The Direction enumeration defines four possible directions for the motor: Idle, Forward, Backward, and Brake. 
  * position: This is a numeric property that represents the current position of the motor.
  * pwm: This is another numeric property, which represents the pulse-width modulation value for the motor, 
      a common method for controlling the power delivered to an electronic device like a motor.
  * done: This boolean property indicates whether the motor has reached its goal position or speed.
  * positionGoal and speedGoal: These numeric properties represent the target position and speed for the motor.
  * kP, kI, and kD: These properties are the coefficients for a PID controller, a control loop mechanism commonly used in systems like this to control the motor's position and speed.
  
  The Motor namespace contains two enumerations, Direction and Mode, and a constant object NIL.

  The Direction enumeration defines four possible directions for the motor: Idle, Forward, Backward, and Brake. 

  The Direction and Mode namespaces also contain two functions each: fromBits and toBits. 
    These functions are used to convert between the enumeration values and their corresponding numeric representations.

  The NIL constant is an object that adheres to the Motor interface and represents a motor in its default state. 
    This could be used as a starting point when creating new Motor objects or as a reset state.
 */


interface Motor {
  mode: Motor.Mode;
  direction: Motor.Direction;

  position: number;
  pwm: number;

  done: boolean;

  positionGoal: number;
  speedGoal: number;

  kP: number;
  kI: number;
  kD: number;
}

namespace Motor {
  export enum Direction {
    Idle,
    Forward,
    Backward,
    Brake,
  }
  
  export namespace Direction {
    export const fromBits = (bits: number): Direction => {
      switch (bits) {
        case 0: return Direction.Idle;
        case 1: return Direction.Forward;
        case 2: return Direction.Backward;
        case 3: return Direction.Brake;
      }
    };

    export const toBits = (direction: Direction): number => {
      switch (direction) {
        case Direction.Idle: return 0;
        case Direction.Forward: return 1;
        case Direction.Backward: return 2;
        case Direction.Brake: return 3;
      }
    };
  }

  export enum Mode {
    Pwm,
    Speed,
    Position,
    SpeedPosition,
  }
  
  export namespace Mode {
    export const fromBits = (bits: number): Mode => {
      switch (bits) {
        case 0: return Mode.Pwm;
        case 1: return Mode.Speed;
        case 2: return Mode.Position;
        case 3: return Mode.SpeedPosition;
      }
    };

    export const toBits = (mode: Mode): number => {
      switch (mode) {
        case Mode.Pwm: return 0;
        case Mode.Speed: return 1;
        case Mode.Position: return 2;
        case Mode.SpeedPosition: return 3;
      }
    };
  }
  
  
  export const NIL: Motor = {
    mode: Mode.Pwm,
    direction: Direction.Brake,
    position: 0,
    pwm: 0,
    done: true,
    positionGoal: 0,
    speedGoal: 0,
    kP: 0.001,
    kI: 0.001,
    kD: 0.001
  };
}

export default Motor;