import { RobotState } from "../RobotState";
import { StyleProps } from "../style";
import { ThemeProps } from "./theme";

export interface LayoutProps extends StyleProps, ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;
  cans: boolean[];
  state: RobotState;
  onStateChange: (state: RobotState) => void;
}

export enum Layout {
  Overlay,
  Side,
  Bottom
}