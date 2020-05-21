export interface RobotState {
  //Units: Pixels
  x: number;
  y: number;

  //Units: Radians
  theta: number;

  //Units: Ticks
  motor0_speed: number;
  motor1_speed: number;
  motor2_speed: number;
  motor3_speed: number;
  motor0_position: number;
  motor1_position: number;
  motor2_position: number;
  motor3_position: number;
  servo0_position: number;
  servo1_position: number;
  servo2_position: number;
  servo3_position: number;
}

export namespace RobotState {
  export const empty: RobotState = {
    x: 220,
    y: 400,
    theta:0,
    motor0_speed: 0,
    motor1_speed: 0,
    motor2_speed: 0,
    motor3_speed: 0,
    motor0_position: 0,
    motor1_position: 0,
    motor2_position: 0,
    motor3_position: 0,
    servo0_position: 1024,
    servo1_position: 1024,
    servo2_position: 1024,
    servo3_position: 0
  };
}