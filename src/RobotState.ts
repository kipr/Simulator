

export interface RobotState {
  // Units: Ticks
  motorSpeeds: [number, number, number, number];
  motorPositions: [number, number, number, number];
  servoPositions: [number, number, number, number];
  
  analogValues: RobotState.AnalogValues;
  digitalValues: RobotState.DigitalValues;
}

export namespace RobotState {
  export const empty: RobotState = {
    motorSpeeds: [0, 0, 0, 0],
    motorPositions: [0, 0, 0, 0],
    servoPositions: [1024, 1024, 1024, 2047],
    analogValues: [0, 0, 0, 0, 0, 0],
    digitalValues: [false, false, false, false, false, false]
  };

  export type Values<T> = [T, T, T, T, T, T];
  export type DigitalValues = Values<boolean>;
  export type AnalogValues = Values<number>;
}
