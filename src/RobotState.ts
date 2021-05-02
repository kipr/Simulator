

export interface RobotState {
  // Units: Pixels
  x: number;
  y: number;
  z: number;

  // Units: Radians
  theta: number;
  
  // Mesh created
  mesh: boolean;

  // Units: Ticks
  motorSpeeds: [number, number, number, number];
  motorPositions: [number, number, number, number];
  servoPositions: [number, number, number, number];
  
  analogValues: RobotState.AnalogValues;
  digitalValues: RobotState.DigitalValues;
}

export namespace RobotState {
  export const empty: RobotState = {
    x: 0,
    y: 0,
    z: 0,
    theta: 0,
    mesh: true,
    motorSpeeds: [0, 0, 0, 0],
    motorPositions: [0, 0, 0, 0],
    servoPositions: [1024, 1024, 1024, 0],
    analogValues: [0, 0, 0, 0, 0, 0],
    digitalValues: [false, false, false, false, false, false]
  };

  export type Values<T> = [T, T, T, T, T, T];
  export type DigitalValues = Values<boolean>;
  export type AnalogValues = Values<number>;
}