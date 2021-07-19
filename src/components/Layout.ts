import { Message } from "ivygate";
import { RobotPosition } from "../RobotPosition";
import { RobotState } from "../RobotState";
import { StyleProps } from "../style";
import { SurfaceState } from "../SurfaceState";
import { StyledText } from "../util";
import { ThemeProps } from "./theme";

export interface LayoutProps extends StyleProps, ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;
  items: boolean[];
  onItemChange: (index: string, enabled: boolean) => void;
  state: RobotState;
  onStateChange: (state: RobotState) => void;
  robotPosition: RobotPosition;
  onSetRobotPosition: (robotPosition: RobotPosition) => void;
  console: StyledText;
  messages: Message[];
  onClearConsole: () => void;
  surfaceState: SurfaceState;
  onSurfaceChange: (surfaceName: string) => void;
  sensorNoise: boolean;
  onSensorNoiseChange: (enabled: boolean) => void;
}

export enum Layout {
  Overlay,
  Side,
  Bottom
}