import deepNeq from './deepNeq';
import Patch from './util/Patch';


export interface RobotState {
  // Units: Ticks
  motorSpeeds: [number, number, number, number];
  motorPositions: [number, number, number, number];
  servoPositions: [number, number, number, number];
  
  analogValues: RobotState.AnalogValues;
  digitalValues: RobotState.DigitalValues;
}

export namespace RobotState {
  export const NIL: RobotState = {
    motorSpeeds: [0, 0, 0, 0],
    motorPositions: [0, 0, 0, 0],
    servoPositions: [1024, 1024, 1024, 2047],
    analogValues: [0, 0, 0, 0, 0, 0],
    digitalValues: [false, false, false, false, false, false]
  };

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
