import deepNeq from './deepNeq';
import construct from './util/construct';
import Patch from './util/Patch';


export interface RobotState {
  motorControls: RobotState.Motors<RobotState.MotorControl>;
  motorDone: RobotState.Motors<boolean>;
  motorPids: RobotState.Motors<RobotState.Pid>;

  motorVelocities: [number, number, number, number];
  motorPositions: [number, number, number, number];
  servoPositions: [number, number, number, number];
  
  analogValues: RobotState.AnalogValues;
  digitalValues: RobotState.DigitalValues;
}

export namespace RobotState {
  export const NIL: RobotState = {
    motorControls: [
      MotorControl.SPEED_ZERO,
      MotorControl.SPEED_ZERO,
      MotorControl.SPEED_ZERO,
      MotorControl.SPEED_ZERO
    ],
    motorPids: [],
    motorVelocities: [0, 0, 0, 0],
    motorPositions: [0, 0, 0, 0],
    servoPositions: [1024, 1024, 1024, 2047],
    analogValues: [0, 0, 0, 0, 0, 0],
    digitalValues: [false, false, false, false, false, false]
  };

  export type Motors<T> = [T, T, T, T];

  export interface Pid {
    kP: number;
    kI: number;
    kD: number;
  }

  export namespace MotorControl {
    export enum Type {
      Pwm = 'pwm',
      Position = 'position',
      Speed = 'speed',
      SpeedPosition = 'speed-position',
    }

    export interface Pwm {
      type: Type.Pwm;
      
      /**
       * The PWM value in the range [-1, 1].
       */
      pwm: number;
    }

    export const pwm = construct<Pwm>(Type.Pwm);

    export interface Position {
      type: Type.Position;
      
      /**
       * Position in ticks
       */
      position: number;
    }

    export const position = construct<Position>(Type.Position);

    export interface Speed {
      type: Type.Speed;

      /**
       * Velocity in ticks per second
       */
      velocity: number;
    }


    export const speed = construct<Speed>(Type.Speed);

    export const SPEED_ZERO: Speed = speed({ velocity: 0 });

    export interface SpeedPosition {
      type: Type.SpeedPosition;

      /**
       * Velocity in ticks per second
       */
      velocity: number;

      /**
       * Position in ticks
       */
      position: number;
    }
    
    export const speedPosition = construct<SpeedPosition>(Type.SpeedPosition);
  }

  export type MotorControl = (
    MotorControl.Pwm |
    MotorControl.Position |
    MotorControl.Speed |
    MotorControl.SpeedPosition
  );

  export type Values<T> = [T, T, T, T, T, T];
  export type DigitalValues = Values<boolean>;
  export type AnalogValues = Values<number>;

  export const diff = (prev: RobotState, next: RobotState): Patch<RobotState> => {
    if (!deepNeq(prev, next)) return Patch.none(prev);

    return Patch.innerChange(prev, next, {
      motorSpeeds: Patch.diff(prev.motorSpeeds, next.motorSpeeds),
      motorPositions: Patch.diff(prev.motorPositions, next.motorPositions),
      servoPositions: Patch.diff(prev.servoPositions, next.servoPositions),
      analogValues: Patch.diff(prev.analogValues, next.analogValues),
      digitalValues: Patch.diff(prev.digitalValues, next.digitalValues),
    });
  };
}
