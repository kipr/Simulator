import * as React from 'react';
import { signOutOfApp } from '../firebase/modules/auth';
import WorkerInstance from '../WorkerInstance';

import { State as ReduxState } from '../state';

import SimMenu from './SimMenu';

import { styled } from 'styletron-react';
import { DARK, Theme } from './theme';
import { Layout, LayoutProps, OverlayLayout, OverlayLayoutRedux, SideLayoutRedux  } from './Layout';

import { SettingsDialog } from './SettingsDialog';
import { AboutDialog } from './AboutDialog';

import { FeedbackDialog } from './Feedback';
import { sendFeedback, FeedbackResponse } from './Feedback/SendFeedback';
import { FeedbackSuccessDialog } from './Feedback/SuccessModal';

import compile from '../compile';
import { SimulatorState } from './SimulatorState';
import { Angle, Distance, StyledText } from '../util';
import { Message } from 'ivygate';
import parseMessages, { hasErrors, hasWarnings, sort, toStyledText } from '../util/parse-messages';

import { Space } from '../Sim';
import { RobotPosition } from '../RobotPosition';
import { DEFAULT_SETTINGS, Settings } from '../Settings';
import { DEFAULT_FEEDBACK, Feedback } from '../Feedback';
import ExceptionDialog from './ExceptionDialog';
import OpenSceneDialog from './OpenSceneDialog';

import { ChallengesAction, ScenesAction, ChallengeCompletionsAction } from '../state/reducer';
import { Editor } from './Editor';
import Dict from '../Dict';
import ProgrammingLanguage from '../ProgrammingLanguage';
import Script from '../state/State/Scene/Script';

import Scene, { AsyncScene } from '../state/State/Scene';
import { RouteComponentProps } from 'react-router';
import Node from '../state/State/Scene/Node';
import { connect } from 'react-redux';
import Async from '../state/State/Async';
import construct from '../util/construct';
import NewSceneDialog from './NewSceneDialog';
import DeleteDialog from './DeleteDialog';
import Record from '../db/Record';
import Selector from '../db/Selector';

import * as uuid from 'uuid';
import Author from '../db/Author';
import db from '../db';
import { auth } from '../firebase/firebase';
import SaveAsSceneDialog from './SaveAsSceneDialog';
import SceneErrorDialog from './SceneErrorDialog';
import { push } from 'connected-react-router';
import Loading from './Loading';
import LocalizedString from '../util/LocalizedString';
import SceneSettingsDialog from './SceneSettingsDialog';
import Geometry from '../state/State/Scene/Geometry';
import Camera from '../state/State/Scene/Camera';
import { Vector3 } from '../unit-math';
import { LayoutEditorTarget } from './Layout/Layout';
import { AsyncChallenge } from '../state/State/Challenge';
import Builder from '../db/Builder';
import ChallengeCompletion, { AsyncChallengeCompletion } from '../state/State/ChallengeCompletion';
import Patch from '../util/Patch';
import PredicateCompletion from '../state/State/ChallengeCompletion/PredicateCompletion';
import LoadingOverlay from './Challenge/LoadingOverlay';
import DbError from '../db/Error';
import { applyObjectPatch, applyPatch, createObjectPatch, createPatch, ObjectPatch, OuterObjectPatch } from 'symmetry';
import ChallengeMenu from './ChallengeMenu';
import { Capabilities } from './World';

namespace Modal {
  export enum Type {
    Settings,
    About,
    Exception,
    OpenScene,
    Feedback,
    FeedbackSuccess,
    None,
    NewScene,
    CopyScene,
    SettingsScene,
    DeleteRecord
  }

  export interface Settings {
    type: Type.Settings;
  }

  export const SETTINGS: Settings = { type: Type.Settings };

  export interface About {
    type: Type.About;
  }

  export const ABOUT: About = { type: Type.About };

  export interface Feedback {
    type: Type.Feedback;
  }

  export const FEEDBACK: Feedback = { type: Type.Feedback };

  export interface FeedbackSuccess {
    type: Type.FeedbackSuccess;
  }

  export const FEEDBACKSUCCESS: FeedbackSuccess = { type: Type.FeedbackSuccess };
  
  export interface Exception {
    type: Type.Exception;
    error: Error;
    info?: React.ErrorInfo;
  }

  export const exception = (error: Error, info?: React.ErrorInfo): Exception => ({ type: Type.Exception, error, info });

  export interface SelectScene {
    type: Type.OpenScene;
  }

  export const SELECT_SCENE: SelectScene = { type: Type.OpenScene };

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };

  export interface NewScene {
    type: Type.NewScene;
  }

  export const NEW_SCENE: NewScene = { type: Type.NewScene };

  export interface CopyScene {
    type: Type.CopyScene;
    scene: Scene;
  }

  export const copyScene = construct<CopyScene>(Type.CopyScene);

  export interface DeleteRecord {
    type: Type.DeleteRecord;
    record: Record;
  }

  export const deleteRecord = construct<DeleteRecord>(Type.DeleteRecord);

  export interface SettingsScene {
    type: Type.SettingsScene;
  }

  export const SETTINGS_SCENE: SettingsScene = { type: Type.SettingsScene };
}

export type Modal = (
  Modal.Settings |
  Modal.About |
  Modal.Exception |
  Modal.SelectScene |
  Modal.Feedback |
  Modal.FeedbackSuccess |
  Modal.None |
  Modal.NewScene |
  Modal.CopyScene |
  Modal.DeleteRecord |
  Modal.SettingsScene
);

interface RootParams {
  challengeId: string;
}

export interface RootPublicProps extends RouteComponentProps<RootParams> {

}

interface RootPrivateProps {
  scene: AsyncScene;
  challenge?: AsyncChallenge;
  challengeCompletion?: AsyncChallengeCompletion;

  onChallengeCompletionCreate: (challengeCompletion: ChallengeCompletion) => void;
  onChallengeCompletionSceneDiffChange: (sceneDiff: OuterObjectPatch<Scene>) => void;
  onChallengeCompletionEventStateRemove: (eventId: string) => void;
  onChallengeCompletionEventStateChange: (eventId: string, eventState: boolean) => void;
  onChallengeCompletionEventStatesAndPredicateCompletionsChange: (eventState: Dict<boolean>, success: PredicateCompletion, failure: PredicateCompletion) => void;
  onChallengeCompletionSuccessPredicateCompletionChange: (success?: PredicateCompletion) => void;
  onChallengeCompletionFailurePredicateCompletionChange: (failure?: PredicateCompletion) => void;
  onChallengeCompletionReset: () => void;
  onChallengeCompletionSetCode: (language: ProgrammingLanguage, code: string) => void;
  onChallengeCompletionSetCurrentLanguage: (language: ProgrammingLanguage) => void;
  onChallengeCompletionSave: () => void;

  goToLogin: () => void;
}

interface RootState {
  layout: Layout;

  simulatorState: SimulatorState;

  modal: Modal;

  console: StyledText;
  messages: Message[];

  theme: Theme;

  settings: Settings;

  feedback: Feedback;

  windowInnerHeight: number;

  challengeStarted?: boolean;

  nonce: number;
}

type Props = RootPublicProps & RootPrivateProps;
type State = RootState;

// We can't set innerheight statically, becasue the window can change
// but we also must use innerheight to fix mobile issues
interface ContainerProps {
  $windowInnerHeight: number
}
const Container = styled('div', (props: ContainerProps) => ({
  width: '100vw',
  height: `${props.$windowInnerHeight}px`, // fix for mobile, see https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'fixed'
}));

const STDOUT_STYLE = (theme: Theme) => ({
  color: theme.color
});

const STDERR_STYLE = (theme: Theme) => ({
  color: 'red'
});

const WORLD_CAPABILITIES: Capabilities = {
  addNode: false,
  addScript: false,
  nodeReset: false,
  nodeSettings: false,
  nodeVisibility: false,
  removeNode: false,
  removeScript: false,
  scriptSettings: false,
};

class Root extends React.Component<Props, State> {
  private editorRef: React.MutableRefObject<Editor>;
  private overlayLayoutRef:  React.MutableRefObject<OverlayLayout>;

  private workingChallengeScene_: Scene;

  private incrementNonce_ = () => {
    this.setState({
      nonce: (this.state.nonce + 1) % 100000
    });
  };

  private latestScene_ = (): Scene => {
    const { scene, challengeCompletion } = this.props;
  
    const latestChallengeCompletion = Async.latestValue(challengeCompletion);
    if (!latestChallengeCompletion) return Async.latestValue(scene);
    
    if (this.workingChallengeScene_) return this.workingChallengeScene_;

    const latestScene = Async.latestValue(scene);
    if (!latestScene) return undefined;

    const { serializedSceneDiff } = latestChallengeCompletion;

    const sceneDiff = serializedSceneDiff ? JSON.parse(serializedSceneDiff) : 'none';

    if (sceneDiff === 'none' || sceneDiff === 'reset') return latestScene;

    this.workingChallengeScene_ = applyObjectPatch(latestScene, sceneDiff as ObjectPatch<Scene>);
    
    this.incrementNonce_();

    return this.workingChallengeScene_;
  };

  private set workingChallengeScene(scene: Scene) {
    if (scene === this.workingChallengeScene_) return;
    this.workingChallengeScene_ = scene;
    Space.getInstance().scene = scene;
    this.incrementNonce_();
  }

  private onNodeChange_ = (nodeId: string, node: Node) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;
    console.log('onNodeChange_', nodeId, node, 'prev', latestScene.nodes[nodeId]);
    this.workingChallengeScene = Scene.setNode(latestScene, nodeId, node);
  };

  private onNodeAdd_ = this.onNodeChange_;

  private onNodeRemove_ = (nodeId: string) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;
    this.workingChallengeScene = Scene.removeNode(latestScene, nodeId);
  };

  private onGeometryChange_ = (geometryId: string, geometry: Geometry) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;
    this.workingChallengeScene = Scene.setGeometry(latestScene, geometryId, geometry);
  };

  private onGeometryAdd_ = this.onGeometryChange_;

  private onGeometryRemove_ = (geometryId: string) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;
    this.workingChallengeScene = Scene.removeGeometry(latestScene, geometryId);
  };


  private onScriptChange_ = (scriptId: string, script: Script) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;
    this.workingChallengeScene = Scene.setScript(latestScene, scriptId, script);
  };

  private onScriptAdd_ = this.onScriptChange_;

  private onScriptRemove_ = (scriptId: string) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;
    this.workingChallengeScene = Scene.removeScript(latestScene, scriptId);
  };

  private onObjectAdd_ = (nodeId: string, obj: Node.Obj, geometry: Geometry) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;
    this.workingChallengeScene = Scene.addObject(latestScene, nodeId, obj, geometry);
  };

  private onCameraChange_ = (camera: Camera) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;

    this.workingChallengeScene = Scene.setCamera(latestScene, camera);
  };

  private onGravityChange_ = (gravity: Vector3) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;

    this.workingChallengeScene = Scene.setGravity(latestScene, gravity);
  };

  private onSelectNodeId_ = (nodeId: string) => {
    // disabled
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      layout: Layout.Side,
      modal: Modal.NONE,
      simulatorState: SimulatorState.STOPPED,
      console: StyledText.text({ text: 'Welcome to the KIPR Simulator!\n', style: STDOUT_STYLE(DARK) }),
      theme: DARK,
      messages: [],
      settings: DEFAULT_SETTINGS,
      feedback: DEFAULT_FEEDBACK,
      windowInnerHeight: window.innerHeight,
      nonce: 0
    };

    this.editorRef = React.createRef();
    this.overlayLayoutRef = React.createRef();

    Space.getInstance().scene = Async.latestValue(props.scene) || Scene.EMPTY;
  }

  private onSetNodeBatch_ = (setNodeBatch: Omit<ScenesAction.SetNodeBatch, 'type' | 'sceneId'>) => {
    const latestScene = this.latestScene_();
    if (!latestScene) return;

    let nextScene = latestScene;
    for (const { id, node } of setNodeBatch.nodeIds) nextScene = Scene.setNode(nextScene, id, node);
    this.workingChallengeScene = nextScene;
  };

  private debounceChallengeCompletionSceneUpdate_ = false;

  private onResetScene_ = () => {
    const {
      scene,
      challenge,
      challengeCompletion,
    } = this.props;

    if (!challengeCompletion) return;
    this.onStopClick_();
    this.workingChallengeScene = Async.latestValue(scene);
    this.debounceChallengeCompletionSceneUpdate_ = true;
    this.syncChallengeCompletion_();
    this.debounceChallengeCompletionSceneUpdate_ = false;

  };

  private onSetEventValue_ = (eventId: string, value: boolean) => {
    const { challenge, challengeCompletion } = this.props;
    
    const latestChallenge = Async.latestValue(challenge);
    if (!latestChallenge) return;

    const latestChallengeCompletion = Async.latestValue(challengeCompletion);
    if (!latestChallengeCompletion) return;

    const { success, failure } = latestChallenge;

    const nextEventStates = {
      ...latestChallengeCompletion.eventStates,
      [eventId]: value,
    };

    console.log(PredicateCompletion.update(success, nextEventStates));
    this.debounceChallengeCompletionSceneUpdate_ = true;
    this.props.onChallengeCompletionEventStatesAndPredicateCompletionsChange(
      nextEventStates,
      success ? PredicateCompletion.update(success, nextEventStates) : undefined,
      failure ? PredicateCompletion.update(failure, nextEventStates) : undefined
    );
    this.debounceChallengeCompletionSceneUpdate_ = false;

    this.scheduleSaveChallengeCompletion_();
  };

  componentDidMount() {
    WorkerInstance.onStopped = this.onStopped_;

    const space = Space.getInstance();
    space.onSetNodeBatch = this.onSetNodeBatch_;
    space.onSelectNodeId = this.onSelectNodeId_;
    space.onNodeAdd = this.onNodeAdd_;
    space.onNodeRemove = this.onNodeRemove_;
    space.onNodeChange = this.onNodeChange_;
    space.onGeometryAdd = this.onGeometryAdd_;
    space.onGeometryRemove = this.onGeometryRemove_;
    space.onGravityChange = this.onGravityChange_;
    space.onCameraChange = this.onCameraChange_;
    space.onChallengeSetEventValue = this.onSetEventValue_;

    this.scheduleUpdateConsole_();
    window.addEventListener('resize', this.onWindowResize_);
  }

  private initedChallengeCompletionScene_ = false;

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize_);
    cancelAnimationFrame(this.updateConsoleHandle_);
  
    Space.getInstance().onSelectNodeId = undefined;
    Space.getInstance().onSetNodeBatch = undefined;

    this.initedChallengeCompletionScene_ = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<RootState>): void {
    const { match: { params: { challengeId } }, challenge, challengeCompletion } = this.props;
    
    if (challengeId && challenge && challengeCompletion && challengeCompletion.type === Async.Type.LoadFailed) {
      const latestChallenge = Async.latestValue(challenge);
      if (challengeCompletion.error.code === DbError.CODE_NOT_FOUND && latestChallenge) {
        console.log('Challenge completion not found');
        this.props.onChallengeCompletionCreate({
          ...ChallengeCompletion.EMPTY,
          code: latestChallenge.code,
          currentLanguage: latestChallenge.defaultLanguage,
        });
      }
    }

    if (this.state.simulatorState.type !== prevState.simulatorState.type) {
      Space.getInstance().sceneBinding.scriptManager.programStatus = this.state.simulatorState.type === SimulatorState.Type.Running ? 'running' : 'stopped';
    }

    if (this.props.match.params.challengeId !== prevProps.match.params.challengeId) {
      this.initedChallengeCompletionScene_ = false;
    }
    
    if (this.props.scene !== prevProps.scene || this.props.challengeCompletion !== prevProps.challengeCompletion) {
      const latestScene = Async.latestValue(this.props.scene);
      const latestChallengeCompletion = Async.latestValue(this.props.challengeCompletion);

      if (latestScene && latestChallengeCompletion && !this.initedChallengeCompletionScene_ && !this.debounceChallengeCompletionSceneUpdate_) {
        if (latestChallengeCompletion.serializedSceneDiff) this.workingChallengeScene = applyObjectPatch(
          latestScene,
          JSON.parse(latestChallengeCompletion.serializedSceneDiff) as ObjectPatch<Scene>
        );
        this.initedChallengeCompletionScene_ = true;
      }
    }
  }


  private onWindowResize_ = () => {
    this.setState({ windowInnerHeight: window.innerHeight });
  };

  private saveChallengeCompletionTimeout_?: number;
  private saveChallengeCompletion_ = () => {
    this.props.onChallengeCompletionSave();
  };

  private scheduleSaveChallengeCompletion_ = () => {
    if (this.saveChallengeCompletionTimeout_) clearTimeout(this.saveChallengeCompletionTimeout_);
    this.saveChallengeCompletionTimeout_ = window.setTimeout(this.saveChallengeCompletion_, 5000);
  };


  private syncChallengeCompletion_ = () => {
    const sceneDiff = createObjectPatch(this.workingChallengeScene_, Async.latestValue(this.props.scene));
    this.props.onChallengeCompletionSceneDiffChange(sceneDiff);

    this.scheduleSaveChallengeCompletion_();
  };

  private onStopped_ = () => {
    this.setState({
      simulatorState: SimulatorState.STOPPED
    }, () => {
      this.syncChallengeCompletion_();
    });
  };

  private onActiveLanguageChange_ = (language: ProgrammingLanguage) => {
    this.props.onChallengeCompletionSetCurrentLanguage(language);

    this.scheduleSaveChallengeCompletion_();
  };

  private get currentLanguage(): ProgrammingLanguage {
    const { challenge, challengeCompletion } = this.props;

    const latestChallengeCompletion = Async.latestValue(challengeCompletion);
    const latestChallenge = Async.latestValue(challenge);

    return latestChallengeCompletion
      ? latestChallengeCompletion.currentLanguage
      : latestChallenge.defaultLanguage;
  }

  private get code(): { [language in ProgrammingLanguage]: string } {
    const { challenge, challengeCompletion } = this.props;
    const latestChallengeCompletion = Async.latestValue(challengeCompletion);
    const latestChallenge = Async.latestValue(challenge);

    return latestChallengeCompletion
      ? latestChallengeCompletion.code
      : latestChallenge.code;
  }

  private onCodeChange_ = (code: string) => {
    this.props.onChallengeCompletionSetCode(this.currentLanguage, code);
    this.scheduleSaveChallengeCompletion_();
  };

  private onShowAll_ = () => {
    if (this.overlayLayoutRef.current) this.overlayLayoutRef.current.showAll();
  };

  private onHideAll_ = () => {
    if (this.overlayLayoutRef.current) this.overlayLayoutRef.current.hideAll();
  };

  private onLayoutChange_ = (layout: Layout) => {
    this.setState({
      layout
    });
  };

  private onModalClick_ = (modal: Modal) => () => this.setState({ modal });

  private onModalClose_ = () => this.setState({ modal: Modal.NONE });
  
  private updateConsole_ = () => {
    const text = WorkerInstance.sharedConsole.popString();
    if (text.length > 0) {
      this.setState({
        console: StyledText.extend(this.state.console, StyledText.text({
          text,
          style: STDOUT_STYLE(this.state.theme)
        }), 300)
      });
    }
    

    this.scheduleUpdateConsole_();
  };

  private updateConsoleHandle_: number | undefined = undefined;
  private scheduleUpdateConsole_ = () => this.updateConsoleHandle_ = requestAnimationFrame(this.updateConsole_);

  private onErrorMessageClick_ = (line: number) => () => {
    if (this.editorRef.current) this.editorRef.current.ivygate.revealLineInCenter(line);
  };

  private onRunClick_ = () => {
    const { state } = this;
    const { console, theme } = state;

    const language = this.currentLanguage;
    const activeCode = this.code[language];

    switch (this.currentLanguage) {
      case 'c':
      case 'cpp': {
        let nextConsole: StyledText = StyledText.extend(console, StyledText.text({
          text: `Compiling...\n`,
          style: STDOUT_STYLE(this.state.theme)
        }));
    
        this.setState({
          simulatorState: SimulatorState.COMPILING,
          console: nextConsole
        }, () => {
          compile(activeCode, language)
            .then(compileResult => {
              nextConsole = this.state.console;
              const messages = sort(parseMessages(compileResult.stderr));
              const compileSucceeded = compileResult.result && compileResult.result.length > 0;
    
              // Show all errors/warnings in console
              for (const message of messages) {
                nextConsole = StyledText.extend(nextConsole, toStyledText(message, {
                  onClick: message.ranges.length > 0
                    ? this.onErrorMessageClick_(message.ranges[0].start.line)
                    : undefined
                }));
              }
    
              if (compileSucceeded) {
                // Show success in console and start running the program
                const haveWarnings = hasWarnings(messages);
                nextConsole = StyledText.extend(nextConsole, StyledText.text({
                  text: `Compilation succeeded${haveWarnings ? ' with warnings' : ''}!\n`,
                  style: STDOUT_STYLE(this.state.theme)
                }));
    
                WorkerInstance.start({
                  language: language,
                  code: compileResult.result
                });
              } else {
                if (!hasErrors(messages)) {
                  // Compile failed and there are no error messages; some weird underlying error occurred
                  // We print the entire stderr to the console
                  nextConsole = StyledText.extend(nextConsole, StyledText.text({
                    text: `${compileResult.stderr}\n`,
                    style: STDERR_STYLE(this.state.theme)
                  }));
                }
    
                nextConsole = StyledText.extend(nextConsole, StyledText.text({
                  text: `Compilation failed.\n`,
                  style: STDERR_STYLE(this.state.theme)
                }));
              }
    
              this.setState({
                simulatorState: compileSucceeded ? SimulatorState.RUNNING : SimulatorState.STOPPED,
                messages,
                console: nextConsole
              });
            })
            .catch((e: unknown) => {
              window.console.error(e);
              nextConsole = StyledText.extend(nextConsole, StyledText.text({
                text: 'Something went wrong during compilation.\n',
                style: STDERR_STYLE(this.state.theme)
              }));
    
              this.setState({
                simulatorState: SimulatorState.STOPPED,
                messages: [],
                console: nextConsole
              });
            });
        });
        break;
      }
      case 'python': {
        this.setState({
          simulatorState: SimulatorState.RUNNING,
        }, () => {
          WorkerInstance.start({
            language: 'python',
            code: activeCode
          });
        });
        break;
      }
    }

    
  };

  private onStopClick_ = () => {
    WorkerInstance.stop();
  };

  private onDownloadClick_ = () => {
    const language = this.currentLanguage;
    const code = this.code[language];

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(code)}`);
    element.setAttribute('download', `program.${ProgrammingLanguage.fileExtension(language)}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  private onResetChallengeClick_ = () => {
    this.onResetScene_();
  };

  private onClearConsole_ = () => {
    this.setState({
      console: StyledText.compose({ items: [] })
    });
  };

  private onIndentCode_ = () => {
    if (this.editorRef.current) this.editorRef.current.ivygate.formatCode();
  };
  
  onDocumentationClick = () => {
    window.open("https://www.kipr.org/doc/index.html");
  };

  onLogoutClick = () => {
    void signOutOfApp().then(() => {
      this.props.goToLogin();
    });
  };

  onDashboardClick = () => {
    window.location.href = '/';
  };


  private onSettingsChange_ = (changedSettings: Partial<Settings>) => {
    const nextSettings: Settings = {
      ...this.state.settings,
      ...changedSettings
    };

    if ('simulationRealisticSensors' in changedSettings) {
      Space.getInstance().realisticSensors = changedSettings.simulationRealisticSensors;
    }
    
    if ('simulationSensorNoise' in changedSettings) {
      Space.getInstance().noisySensors = changedSettings.simulationSensorNoise;
    }

    this.setState({ settings: nextSettings });
  };

  private onFeedbackChange_ = (changedFeedback: Partial<Feedback>) => {
    this.setState({ feedback: { ...this.state.feedback, ...changedFeedback } });
  };

  private onOpenSceneClick_ = () => {
    this.setState({
      modal: Modal.SELECT_SCENE
    });
  };

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({
      modal: Modal.exception(error, info)
    });
  }

  private onChallengeStartClick_ = () => {
    this.setState({
      challengeStarted: true
    });
  };

  render() {
    const { props, state } = this;
    
    const {
      match: { params: { challengeId } },
      scene,
      challenge,
      challengeCompletion
    } = props;

    const {
      challengeStarted
    } = state;

    const latestChallengeCompletion = Async.latestValue(challengeCompletion);
    if (challengeId && !challengeStarted) {
      return (
        <LoadingOverlay
          onStartClick={this.onChallengeStartClick_}
          challenge={challenge}
          loading={!latestChallengeCompletion}
        />
      );
    }

    const language = this.currentLanguage;
    const code = language ? this.code[language] : undefined;

    if (!scene || scene.type === Async.Type.Unloaded || !language || !code) {
      return <Loading />;
    }

    const {
      layout,
      modal,
      simulatorState,
      console,
      messages,
      settings,
      feedback,
      windowInnerHeight,
    } = state;

    const theme = DARK;

    

    const editorTarget: LayoutEditorTarget = {
      type: LayoutEditorTarget.Type.Robot,
      code,
      language,
      onCodeChange: this.onCodeChange_,
      onLanguageChange: this.onActiveLanguageChange_,
    };

    const workingScene: AsyncScene = this.workingChallengeScene_
      ? Async.loaded({ value: this.workingChallengeScene_ })
      : scene;

    const commonLayoutProps: LayoutProps = {
      theme,
      console,
      messages,
      settings,
      editorTarget,
      onClearConsole: this.onClearConsole_,
      onIndentCode: this.onIndentCode_,
      onDownloadCode: this.onDownloadClick_,
      editorRef: this.editorRef,
      sceneId: undefined,
      scene: workingScene,
      onNodeAdd: this.onNodeAdd_,
      onNodeChange: this.onNodeChange_,
      onNodeRemove: this.onNodeRemove_,
      onGeometryAdd: this.onGeometryAdd_,
      onGeometryChange: this.onGeometryChange_,
      onGeometryRemove: this.onGeometryRemove_,
      onScriptAdd: this.onScriptAdd_,
      onScriptChange: this.onScriptChange_,
      onScriptRemove: this.onScriptRemove_,
      onObjectAdd: this.onObjectAdd_,
      challengeState: challenge ? {
        challenge,
        challengeCompletion: challengeCompletion || Async.unloaded({ brief: {} }),
      } : undefined,
      worldCapabilities: WORLD_CAPABILITIES
    };

    let impl: JSX.Element;
    switch (layout) {
      case Layout.Overlay: {
        impl = (
          <OverlayLayoutRedux ref={this.overlayLayoutRef} {...commonLayoutProps} />
        );
        break;
      }
      case Layout.Side: {
        impl = (
          <SideLayoutRedux {...commonLayoutProps} />
        );
        break;
      }
      default: {
        return null;
      }
    }

    return (
      <>
        <Container $windowInnerHeight={windowInnerHeight}>
          <ChallengeMenu
            layout={layout}
            onLayoutChange={this.onLayoutChange_}
            theme={theme}
            onShowAll={this.onShowAll_}
            onHideAll={this.onHideAll_}
            onSettingsClick={this.onModalClick_(Modal.SETTINGS)}
            onAboutClick={this.onModalClick_(Modal.ABOUT)}
            onResetChallengeClick={this.onResetChallengeClick_}
            onRunClick={this.onRunClick_}
            onStopClick={this.onStopClick_}
            onDocumentationClick={this.onDocumentationClick}
            onDashboardClick={this.onDashboardClick}
            onLogoutClick={this.onLogoutClick}
            simulatorState={simulatorState}
          />
          {impl}
        </Container>
        {modal.type === Modal.Type.Settings && (
          <SettingsDialog
            theme={theme}
            settings={settings}
            onSettingsChange={this.onSettingsChange_}
            onClose={this.onModalClose_}
          />
        )}
        {modal.type === Modal.Type.About && (
          <AboutDialog
            theme={theme}
            onClose={this.onModalClose_}
          />
        )}
        {modal.type === Modal.Type.FeedbackSuccess && (
          <FeedbackSuccessDialog
            theme={theme}
            onClose={this.onModalClose_}
          />
        )}
        {modal.type === Modal.Type.Exception && (
          <ExceptionDialog
            error={modal.error}
            theme={theme}
            onClose={this.onModalClose_}
          />
        )}
        {modal.type === Modal.Type.OpenScene && (
          <OpenSceneDialog
            theme={theme}
            onClose={this.onModalClose_}
          />
        )}
      </>
    );
  }
}

export default connect((state: ReduxState, { match: { params: { challengeId } } }: RootPublicProps) => {
  const builder = new Builder(state);

  const challenge = builder.challenge(challengeId);
  challenge.scene();
  challenge.completion();

  builder.dispatchLoads();

  return {
    scene: Dict.unique(builder.scenes),
    challenge: Dict.unique(builder.challenges),
    challengeCompletion: Dict.unique(builder.challengeCompletions),
  };
}, (dispatch, { match: { params: { challengeId } } }: RootPublicProps) => ({
  onChallengeCompletionCreate: (challengeCompletion: ChallengeCompletion) => {
    dispatch(ChallengeCompletionsAction.createChallengeCompletion({ challengeId, challengeCompletion }));
  },
  onChallengeCompletionSceneDiffChange: (sceneDiff: OuterObjectPatch<Scene>) => {
    dispatch(ChallengeCompletionsAction.setSceneDiff({ challengeId, sceneDiff }));
  },
  onChallengeCompletionEventStateRemove: (eventId: string) => {
    dispatch(ChallengeCompletionsAction.removeEventState({ challengeId, eventId }));
  },
  onChallengeCompletionEventStateChange: (eventId: string, eventState: boolean) => {
    dispatch(ChallengeCompletionsAction.setEventState({ challengeId, eventId, eventState }));
  },
  onChallengeCompletionEventStatesAndPredicateCompletionsChange: (eventStates: Dict<boolean>, success: PredicateCompletion, failure: PredicateCompletion) => {
    dispatch(ChallengeCompletionsAction.setEventStatesAndPredicateCompletions({ challengeId, eventStates, success, failure }));
  },
  onChallengeCompletionSuccessPredicateCompletionChange: (success?: PredicateCompletion) => {
    dispatch(ChallengeCompletionsAction.setSuccessPredicateCompletion({ challengeId, success }));
  },
  onChallengeCompletionFailurePredicateCompletionChange: (failure?: PredicateCompletion) => {
    dispatch(ChallengeCompletionsAction.setFailurePredicateCompletion({ challengeId, failure }));
  },
  onChallengeCompletionReset: () => {
    dispatch(ChallengeCompletionsAction.resetChallengeCompletion({ challengeId }));
  },
  onChallengeCompletionSetCode: (language: ProgrammingLanguage, code: string) => {
    dispatch(ChallengeCompletionsAction.setCode({ challengeId, language, code }));
  },
  onChallengeCompletionSetCurrentLanguage: (language: ProgrammingLanguage) => {
    dispatch(ChallengeCompletionsAction.setCurrentLanguage({ challengeId, language }));
  },
  onChallengeCompletionSave: () => {
    dispatch(ChallengeCompletionsAction.saveChallengeCompletion({ challengeId }));
  },
  onDeleteRecord: (selector: Selector) => {
    dispatch(ScenesAction.removeScene({ sceneId: selector.id })),
    dispatch(push('/'));
  },
  goToLogin: () => {
    window.location.href = `/login?from=${window.location.pathname}`;
  },
}))(Root) as React.ComponentType<RootPublicProps>;

export { RootState };