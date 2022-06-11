import { Message } from "ivygate";
import { RobotPosition } from "../RobotPosition";
import { RobotState } from "../RobotState";
import { Settings } from "../Settings";
import Scene from "../state/State/Scene";
import { Feedback } from "../Feedback";
import { StyleProps } from "../style";
import { StyledText } from "../util";
import { ThemeProps } from "./theme";

export interface LayoutProps extends StyleProps, ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;
  robotStartPosition: RobotPosition;
  onSetRobotStartPosition: (position: RobotPosition) => void;
  console: StyledText;
  messages: Message[];
  settings: Settings;
  onClearConsole: () => void;
  onSelectScene: () => void;
  feedback: Feedback;
}

export enum Layout {
  Overlay,
  Side,
  Bottom
}