import { Angle, Distance } from "./util";

export interface RobotPosition {
  x: Distance;
  y: Distance;
  z: Distance;
  theta: Angle;
}