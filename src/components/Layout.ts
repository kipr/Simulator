import { Message } from "ivygate";
import { RobotState } from "../RobotState";
import { StyleProps } from "../style";
import { StyledText } from "../util";
import { Portal } from "./Portal";
import { ThemeProps } from "./theme";

export interface LayoutProps extends StyleProps, ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;
  cans: boolean[];
  onCanChange: (index: number, enabled: boolean) => void;
  state: RobotState;
  onStateChange: (state: RobotState) => void;
  simulator: (simulatorSink: Portal.Sink) => void;
  console: StyledText;
  messages: Message[];
  onClearConsole: () => void;
  surfaceName: string;
  onSurfaceChange: (surfaceName: string) => void;
}

export enum Layout {
  Overlay,
  Side,
  Bottom
}