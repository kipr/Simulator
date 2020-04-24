export interface RobotState {
  //Units: Pixels
  x: number;
  y: number;
  wheel_radius: number;
  wheel_sep: number;

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

  //Units: Seconds
  time: number;
  
}