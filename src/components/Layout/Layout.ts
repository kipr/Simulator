import { Message } from "ivygate";
import { RobotPosition } from "../../RobotPosition";
import { Settings } from "../../Settings";
import { StyleProps } from "../../style";
import { StyledText } from "../../util";
import { Editor } from "../Editor";
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
  onDownloadCode: () => void;
  onSelectScene: () => void;
  editorRef: React.MutableRefObject<Editor>;
}

export enum Layout {
  Overlay,
  Side,
  Bottom
}