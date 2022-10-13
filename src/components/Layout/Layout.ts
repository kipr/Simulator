import { Message } from "ivygate";
import ProgrammingLanguage from '../../ProgrammingLanguage';
import { RobotPosition } from "../../RobotPosition";
import { Settings } from "../../Settings";
import { StyleProps } from "../../style";
import { StyledText } from "../../util";
import { Editor } from "../Editor";
import { ThemeProps } from "../theme";
import SceneScript from '../../state/State/Scene/Script';

export namespace LayoutEditorTarget {
  export enum Type {
    Robot = 'robot',
  }

  export interface Robot {
    type: Type.Robot;
    language: ProgrammingLanguage;
    onLanguageChange: (language: ProgrammingLanguage) => void;
    code: string;
    onCodeChange: (code: string) => void;
  }
}

export type LayoutEditorTarget = LayoutEditorTarget.Robot;

export interface LayoutProps extends StyleProps, ThemeProps {
  sceneId: string;
  editorTarget: LayoutEditorTarget;
  console: StyledText;
  messages: Message[];
  settings: Settings;
  onClearConsole: () => void;
  onIndentCode: () => void;
  onDownloadCode: () => void;
  editorRef: React.MutableRefObject<Editor>;
}

export enum Layout {
  Overlay,
  Side,
  Bottom
}