import { Message } from "ivygate";
import ProgrammingLanguage from '../../ProgrammingLanguage';
import { RobotPosition } from "../../RobotPosition";
import { Settings } from "../../Settings";
import { StyleProps } from "../../style";
import { StyledText } from "../../util";
import { Editor } from "../Editor";
import { ThemeProps } from "../theme";
import Challenge, { AsyncChallenge } from '../../state/State/Challenge';
import ChallengeCompletion, { AsyncChallengeCompletion } from '../../state/State/ChallengeCompletion';
import { AsyncScene } from '../../state/State/Scene';
import Node from '../../state/State/Scene/Node';
import Geometry from '../../state/State/Scene/Geometry';
import Script from '../../state/State/Scene/Script';
import { Capabilities } from '../World';

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
  onResetCode: () => void;
  editorRef: React.MutableRefObject<Editor>;

  scene: AsyncScene;

  onNodeAdd: (nodeId: string, node: Node) => void;
  onNodeRemove: (nodeId: string) => void;
  onNodeChange: (nodeId: string, node: Node) => void;

  onObjectAdd: (nodeId: string, object: Node.Obj, geometry: Geometry) => void;

  onGeometryAdd: (geometryId: string, geometry: Geometry) => void;
  onGeometryRemove: (geometryId: string) => void;
  onGeometryChange: (geometryId: string, geometry: Geometry) => void;

  onScriptAdd: (scriptId: string, script: Script) => void;
  onScriptRemove: (scriptId: string) => void;
  onScriptChange: (scriptId: string, script: Script) => void;

  challengeState?: ChallengeState;
  worldCapabilities?: Capabilities;
  onDocumentationGoToFuzzy?: (query: string, language: 'c' | 'python') => void;
}

export enum Layout {
  Overlay,
  Side,
  Bottom
}

export interface ChallengeState {
  challenge: AsyncChallenge;
  challengeCompletion: AsyncChallengeCompletion;
}