import { Message } from "ivygate";
import { RobotPosition } from "../RobotPosition";
import { RobotState } from "../RobotState";
import { Settings } from "../Settings";
import { Feedback } from "../Feedback";
import { StyleProps } from "../style";
import { SurfaceState } from "../SurfaceState";
import { StyledText } from "../util";
import { ThemeProps } from "./theme";

export interface LayoutProps extends StyleProps, ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;
  state: RobotState;
  onStateChange: (state: RobotState) => void;
  robotStartPosition: RobotPosition;
  onSetRobotStartPosition: (position: RobotPosition) => void;
  console: StyledText;
  messages: Message[];
  settings: Settings;
  onClearConsole: () => void;
  onIndentCode: () => void;
  surfaceState: SurfaceState;
  onSurfaceChange: (surfaceName: string) => void;
  feedback: Feedback;
}

export enum Layout {
  Overlay,
  Side,
  Bottom
}