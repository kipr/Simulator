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
  analogValues: [number, number, number, number, number, number];
}

export namespace RobotState {
  export const empty: RobotState = {
    x: 0,
    y: 0,
    z: 0,
    theta:0,
    mesh: true,
    motorSpeeds: [0, 0, 0, 0],
    motorPositions: [0, 0, 0, 0],
    servoPositions: [1024, 1024, 1024, 0],
    analogValues: [0, 0, 0, 0, 0, 0],
  };
}