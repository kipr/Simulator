import { Message } from "ivygate";
import { RobotPosition } from "../../RobotPosition";
import { Settings } from "../../Settings";
import { StyleProps } from "../../style";
import { StyledText } from "../../util";
import { ThemeProps } from "../theme";

export interface LayoutProps extends StyleProps, ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;
  robotStartPosition: RobotPosition;
  onSetRobotStartPosition: (position: RobotPosition) => void;
  console: StyledText;
  messages: Message[];
  settings: Settings;
  onClearConsole: () => void;
  onIndentCode: () => void;
  onSelectScene: () => void;
}

export enum Layout {
  Overlay,
  Side,
  Bottom
}