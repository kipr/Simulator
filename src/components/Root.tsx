import * as React from 'react';
import { signOutOfApp } from '../firebase/modules/auth';
import WorkerInstance from '../WorkerInstance';

import { State as ReduxState } from '../state';

import SimMenu from './SimMenu';

import { styled } from 'styletron-react';
import { DARK, Theme } from './theme';
import { Layout, LayoutProps, OverlayLayout, OverlayLayoutRedux, SideLayoutRedux  } from './Layout';

import SettingsDialog from './SettingsDialog';
import AboutDialog from './AboutDialog';

import FeedbackDialog from './Feedback';
import { sendFeedback, FeedbackResponse } from './Feedback/SendFeedback';
import FeedbackSuccessDialog from './Feedback/SuccessModal';

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

import { ChallengesAction, DocumentationAction, ScenesAction, ChallengeCompletionsAction } from '../state/reducer';
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

import DocumentationLocation from '../state/State/Documentation/DocumentationLocation';

import tr from '@i18n';


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
    DeleteRecord,
    ResetCode
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

  export interface ResetCode {
    type: Type.ResetCode;
  }

  export const RESET_CODE: ResetCode = { type: Type.ResetCode };
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
  Modal.SettingsScene |
  Modal.ResetCode
);

interface RootParams {
  sceneId?: string;
  challengeId?: string;
}

export interface RootPublicProps extends RouteComponentProps<RootParams> {

}

interface RootPrivateProps {
  scene: AsyncScene;
  challenge?: AsyncChallenge;
  challengeCompletion?: AsyncChallengeCompletion;
  locale: LocalizedString.Language;

  onNodeAdd: (id: string, node: Node) => void;
  onNodeRemove: (id: string) => void;
  onNodeChange: (id: string, node: Node) => void;
  onObjectAdd: (id: string, obj: Node.Obj, geometry: Geometry) => void;
  onNodesChange: (nodes: Dict<Node>) => void;
  onGeometryAdd: (id: string, geometry: Geometry) => void;
  onGeometryChange: (id: string, geometry: Geometry) => void;
  onGeometryRemove: (id: string) => void;
  onCameraChange: (camera: Camera) => void;
  onGravityChange: (gravity: Vector3) => void;
  onSelectNodeId: (id: string) => void;
  onSetNodeBatch: (setNodeBatch: Omit<ScenesAction.SetNodeBatch, 'type' | 'sceneId'>) => void;
  onResetScene: () => void;

  onDocumentationClick: () => void;
  onDocumentationPush: (location: DocumentationLocation) => void;
  onDocumentationSetLanguage: (language: 'c' | 'python') => void;
  onDocumentationGoToFuzzy: (query: string, language: 'c' | 'python') => void;

  onCreateScene: (id: string, scene: Scene) => void;
  onSaveScene: (id: string) => void;
  onDeleteRecord: (selector: Selector) => void;
  onSetScenePartial: (partialScene: Partial<Scene>) => void;

  unfailScene: (id: string) => void;

  goToLogin: () => void;

  selectedScriptId?: string;
  selectedScript?: Script;

  onScriptChange: (scriptId: string, script: Script) => void;
  onScriptRemove: (scriptId: string) => void;
}

interface RootState {
  layout: Layout;

  activeLanguage: ProgrammingLanguage;

  // A map of language to code.
  code: Dict<string>;

  simulatorState: SimulatorState;

  modal: Modal;

  console: StyledText;
  messages: Message[];

  theme: Theme;

  settings: Settings;

  feedback: Feedback;

  windowInnerHeight: number;

  
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

class Root extends React.Component<Props, State> {
  private editorRef: React.MutableRefObject<Editor>;
  private overlayLayoutRef:  React.MutableRefObject<OverlayLayout>;
  
  
  constructor(props: Props) {
    super(props);

    this.state = {
      layout: Layout.Side,
      activeLanguage: 'c',
      code: {
        'c': window.localStorage.getItem('code-c') || ProgrammingLanguage.DEFAULT_CODE['c'],
        'cpp': window.localStorage.getItem('code-cpp') || ProgrammingLanguage.DEFAULT_CODE['cpp'],
        'python': window.localStorage.getItem('code-python') || ProgrammingLanguage.DEFAULT_CODE['python'],
      },
      modal: Modal.NONE,
      simulatorState: SimulatorState.STOPPED,
      console: StyledText.text({ text: LocalizedString.lookup(tr('Welcome to the KIPR Simulator!\n'), props.locale), style: STDOUT_STYLE(DARK) }),
      theme: DARK,
      messages: [],
      settings: DEFAULT_SETTINGS,
      feedback: DEFAULT_FEEDBACK,
      windowInnerHeight: window.innerHeight,
      
    };

    this.editorRef = React.createRef();
    this.overlayLayoutRef = React.createRef();

    Space.getInstance().scene = Async.latestValue(props.scene) || Scene.EMPTY;
  }

  componentDidMount() {
    WorkerInstance.onStopped = this.onStopped_;

    const space = Space.getInstance();
    space.onSetNodeBatch = this.props.onSetNodeBatch;
    space.onSelectNodeId = this.props.onSelectNodeId;
    space.onNodeAdd = this.props.onNodeAdd;
    space.onNodeRemove = this.props.onNodeRemove;
    space.onNodeChange = this.props.onNodeChange;
    space.onGeometryAdd = this.props.onGeometryAdd;
    space.onGeometryRemove = this.props.onGeometryRemove;
    space.onGravityChange = this.props.onGravityChange;
    space.onCameraChange = this.props.onCameraChange;

    this.scheduleUpdateConsole_();
    window.addEventListener('resize', this.onWindowResize_);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize_);
    cancelAnimationFrame(this.updateConsoleHandle_);
  
    Space.getInstance().onSelectNodeId = undefined;
    Space.getInstance().onSetNodeBatch = undefined;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<RootState>): void {    
    if (this.props.scene !== prevProps.scene) {
      Space.getInstance().scene = Async.latestValue(this.props.scene) || Scene.EMPTY;
    }

    if (this.props.onNodeAdd !== prevProps.onNodeAdd) Space.getInstance().onNodeAdd = this.props.onNodeAdd;
    if (this.props.onNodeRemove !== prevProps.onNodeRemove) Space.getInstance().onNodeRemove = this.props.onNodeRemove;
    if (this.props.onNodeChange !== prevProps.onNodeChange) Space.getInstance().onNodeChange = this.props.onNodeChange;
    if (this.props.onGeometryAdd !== prevProps.onGeometryAdd) Space.getInstance().onGeometryAdd = this.props.onGeometryAdd;
    if (this.props.onGeometryRemove !== prevProps.onGeometryRemove) Space.getInstance().onGeometryRemove = this.props.onGeometryRemove;
    if (this.props.onGravityChange !== prevProps.onGravityChange) Space.getInstance().onGravityChange = this.props.onGravityChange;
    if (this.props.onCameraChange !== prevProps.onCameraChange) Space.getInstance().onCameraChange = this.props.onCameraChange;
    if (this.state.simulatorState.type !== prevState.simulatorState.type) {
      Space.getInstance().sceneBinding.scriptManager.programStatus = this.state.simulatorState.type === SimulatorState.Type.Running ? 'running' : 'stopped';
    }
  }

  private onWindowResize_ = () => {
    this.setState({ windowInnerHeight: window.innerHeight });
  };

  private onStopped_ = () => {
    this.setState({
      simulatorState: SimulatorState.STOPPED
    });
  };

  private onActiveLanguageChange_ = (language: ProgrammingLanguage) => {
    this.setState({
      activeLanguage: language
    }, () => {
      this.props.onDocumentationSetLanguage(language === 'python' ? 'python' : 'c');
    });
  };

  private onCodeChange_ = (code: string) => {
    const { activeLanguage } = this.state;
    this.setState({
      code: {
        ...this.state.code,
        [activeLanguage]: code,
      }
    }, () => {
      window.localStorage.setItem(`code-${activeLanguage}`, code);
    });
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
    const { props, state } = this;
    const { locale } = props;
    const { activeLanguage, code, console, theme } = state;

    const activeCode = code[activeLanguage];

    switch (activeLanguage) {
      case 'c':
      case 'cpp': {
        let nextConsole: StyledText = StyledText.extend(console, StyledText.text({
          text: LocalizedString.lookup(tr('Compiling...\n'), locale),
          style: STDOUT_STYLE(this.state.theme)
        }));
    
        this.setState({
          simulatorState: SimulatorState.COMPILING,
          console: nextConsole
        }, () => {
          compile(activeCode, activeLanguage)
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
                  text: haveWarnings
                    ? LocalizedString.lookup(tr('Compilation succeeded with warnings.\n'), locale)
                    : LocalizedString.lookup(tr('Compilation succeeded.\n'), locale),
                  style: STDOUT_STYLE(this.state.theme)
                }));
    
                WorkerInstance.start({
                  language: activeLanguage,
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
                  text: LocalizedString.lookup(tr('Compilation failed.\n'), locale),
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
                text: LocalizedString.lookup(tr('Something went wrong during compilation.\n'), locale),
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
    const { activeLanguage } = this.state;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(this.state.code[activeLanguage])}`);
    element.setAttribute('download', `program.${ProgrammingLanguage.FILE_EXTENSION[activeLanguage]}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  private onResetWorldClick_ = () => {
    this.props.onResetScene();
  };

  private onStartChallengeClick_ = () => {
    window.location.href = `/challenge/${this.props.match.params.sceneId}`;
  };
  
  private onClearConsole_ = () => {
    this.setState({
      console: StyledText.compose({ items: [] })
    });
  };

  private onIndentCode_ = () => {
    if (this.editorRef.current) this.editorRef.current.ivygate.formatCode();
  };

  private onResetCode_ = () => {
    this.setState({
      modal: Modal.RESET_CODE
    });
  };

  private onResetCodeAccept_ = () => {
    const { activeLanguage } = this.state;
    this.setState({
      code: {
        ...this.state.code,
        [activeLanguage]: ProgrammingLanguage.DEFAULT_CODE[activeLanguage]
      },
      modal: Modal.NONE,
    });
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

  private onFeedbackSubmit_ = () => {
    sendFeedback(this.state)
      .then((resp: FeedbackResponse) => {
        this.onFeedbackChange_(({ message: resp.message }));
        this.onFeedbackChange_(({ error: resp.networkError }));

        this.onFeedbackChange_(DEFAULT_FEEDBACK);

        this.onModalClick_(Modal.FEEDBACKSUCCESS)();
      })
      .catch((resp: FeedbackResponse) => {
        this.onFeedbackChange_(({ message: resp.message }));
        this.onFeedbackChange_(({ error: resp.networkError }));
      });
  };

  private onOpenSceneClick_ = () => {
    this.setState({
      modal: Modal.SELECT_SCENE
    });
  };

  private onSettingsSceneClick_ = () => {
    this.setState({
      modal: Modal.SETTINGS_SCENE
    });
  };

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({
      modal: Modal.exception(error, info)
    });
  }

  private onNewSceneAccept_ = (scene: Scene) => {
    this.setState({
      modal: Modal.NONE,
    }, () => {
      const nextScene = { ...scene };
      if (!auth.currentUser) return;
      nextScene.author = Author.user(auth.currentUser.uid);
      this.props.onCreateScene(uuid.v4(), nextScene);
    });
  };

  private onDeleteRecordAccept_ = (selector: Selector) => () => {
    this.props.onDeleteRecord(selector);
  };

  private onSettingsSceneAccept_ = (scene: Scene) => {
    this.setState({
      modal: Modal.NONE,
    }, () => {
      this.props.onSetScenePartial({
        name: scene.name,
        description: scene.description,
      });
    });
  };

  private onSceneErrorResolved_ = () => {
    this.props.unfailScene(this.props.match.params.sceneId);
  };

  private onSaveSceneClick_ = () => {
    this.props.onSaveScene(this.props.match.params.sceneId);
  };

  render() {
    const { props, state } = this;
    
    const {
      match: { params: { sceneId, challengeId } },
      scene,
      challenge,
      challengeCompletion
    } = props;

    if (!scene || scene.type === Async.Type.Unloaded) {
      return <Loading />;
    }

    const {
      selectedScript,
      selectedScriptId,
      onDocumentationClick,
      onDocumentationGoToFuzzy
    } = props;

    const {
      layout,
      activeLanguage,
      code,
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
      code: code[activeLanguage],
      language: activeLanguage,
      onCodeChange: this.onCodeChange_,
      onLanguageChange: this.onActiveLanguageChange_,
    };

    const commonLayoutProps: LayoutProps = {
      theme,
      console,
      messages,
      settings,
      editorTarget,
      onClearConsole: this.onClearConsole_,
      onIndentCode: this.onIndentCode_,
      onDownloadCode: this.onDownloadClick_,
      onResetCode: this.onResetCode_,
      editorRef: this.editorRef,
      sceneId,
      scene,
      onNodeAdd: this.props.onNodeAdd,
      onNodeChange: this.props.onNodeChange,
      onNodeRemove: this.props.onNodeRemove,
      onGeometryAdd: this.props.onGeometryAdd,
      onGeometryChange: this.props.onGeometryChange,
      onGeometryRemove: this.props.onGeometryRemove,
      onScriptAdd: this.props.onScriptChange,
      onScriptChange: this.props.onScriptChange,
      onScriptRemove: this.props.onScriptRemove,
      onObjectAdd: this.props.onObjectAdd,
      challengeState: challenge ? {
        challenge,
        challengeCompletion: challengeCompletion || Async.unloaded({ brief: {} }),
      } : undefined,
      onDocumentationGoToFuzzy,
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

    const latestScene = Async.latestValue(scene);
    const isAuthor = latestScene && latestScene.author.id === auth.currentUser.uid;

    return (
      <>
        <Container $windowInnerHeight={windowInnerHeight}>
          <SimMenu
            layout={layout}
            onLayoutChange={this.onLayoutChange_}
            theme={theme}
            onShowAll={this.onShowAll_}
            onHideAll={this.onHideAll_}
            onSettingsClick={this.onModalClick_(Modal.SETTINGS)}
            onAboutClick={this.onModalClick_(Modal.ABOUT)}
            onResetWorldClick={this.onResetWorldClick_}
            onStartChallengeClick={this.onStartChallengeClick_}
            onRunClick={this.onRunClick_}
            onStopClick={this.onStopClick_}
            onDocumentationClick={onDocumentationClick}
            onDashboardClick={this.onDashboardClick}
            onLogoutClick={this.onLogoutClick}
            onFeedbackClick={this.onModalClick_(Modal.FEEDBACK)}
            onOpenSceneClick={this.onOpenSceneClick_}
            simulatorState={simulatorState}
            onNewSceneClick={!challenge && this.onModalClick_(Modal.NEW_SCENE)}
            onSaveAsSceneClick={!challenge && this.onModalClick_(Modal.copyScene({ scene: Async.latestValue(scene) }))}
            onSettingsSceneClick={isAuthor && !challenge && this.onSettingsSceneClick_}
            onDeleteSceneClick={isAuthor && !challenge && this.onModalClick_(Modal.deleteRecord({
              record: {
                type: Record.Type.Scene,
                id: sceneId,
                value: scene,
              }
            }))}
            onSaveSceneClick={scene && !challenge && scene.type === Async.Type.Saveable && isAuthor ? this.onSaveSceneClick_ : undefined}
            
          />
          {impl}
        </Container>
        {modal.type === Modal.Type.None && Async.isFailed(scene) && (
          <SceneErrorDialog
            error={scene.error}
            theme={theme}
            onClose={this.onSceneErrorResolved_}
          />
        )}
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
        {modal.type === Modal.Type.Feedback && (
          <FeedbackDialog
            theme={theme}
            feedback={feedback}
            onFeedbackChange={this.onFeedbackChange_}
            onClose={this.onModalClose_}
            onSubmit={this.onFeedbackSubmit_}
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
        {modal.type === Modal.Type.NewScene && (
          <NewSceneDialog
            theme={theme}
            onClose={this.onModalClose_}
            onAccept={this.onNewSceneAccept_}
          />
        )}
        {modal.type === Modal.Type.CopyScene && (
          <SaveAsSceneDialog
            theme={theme}
            scene={Async.latestValue(scene)}
            onClose={this.onModalClose_}
            onAccept={this.onNewSceneAccept_}
          />
        )}
        {modal.type === Modal.Type.DeleteRecord && modal.record.type === Record.Type.Scene && (
          <DeleteDialog
            name={Record.latestName(modal.record)}
            theme={theme}
            onClose={this.onModalClose_}
            onAccept={this.onDeleteRecordAccept_(Record.selector(modal.record))}
          />
        )}
        {modal.type === Modal.Type.SettingsScene && (
          <SceneSettingsDialog
            scene={Async.latestValue(scene)}
            theme={theme}
            onClose={this.onModalClose_}
            onAccept={this.onSettingsSceneAccept_}
          />
        )}
        {modal.type === Modal.Type.ResetCode && (
          <DeleteDialog
            name={tr('your current work')}
            theme={theme}
            onAccept={this.onResetCodeAccept_}
            onClose={this.onModalClose_}
          />
        )}
      </>

    );
  }
}

export default connect((state: ReduxState, { match: { params: { sceneId, challengeId } } }: RootPublicProps) => {
  const builder = new Builder(state);

  if (challengeId) {
    const challenge = builder.challenge(challengeId);
    challenge.scene();
    challenge.completion();
  } else {
    builder.scene(sceneId);
  }

  builder.dispatchLoads();

  return {
    scene: Dict.unique(builder.scenes),
    challenge: Dict.unique(builder.challenges),
    challengeCompletion: Dict.unique(builder.challengeCompletions),
    locale: state.i18n.locale,
  };
}, (dispatch, { match: { params: { sceneId } } }: RootPublicProps) => ({
  onNodeAdd: (nodeId: string, node: Node) => dispatch(ScenesAction.setNode({ sceneId, nodeId, node })),
  onNodeRemove: (nodeId: string) => dispatch(ScenesAction.removeNode({ sceneId, nodeId })),
  onNodeChange: (nodeId: string, node: Node) => {
    dispatch(ScenesAction.setNode({ sceneId, nodeId, node }));
  },
  onObjectAdd: (nodeId: string, object: Node.Obj, geometry: Geometry) => dispatch(ScenesAction.addObject({ sceneId, nodeId, object, geometry })),
  onGeometryAdd: (geometryId: string, geometry: Geometry) => dispatch(ScenesAction.addGeometry({ sceneId, geometryId, geometry })),
  onGeometryChange: (geometryId: string, geometry: Geometry) => dispatch(ScenesAction.setGeometry({ sceneId, geometryId, geometry })),
  onGeometryRemove: (geometryId: string) => dispatch(ScenesAction.removeGeometry({ sceneId, geometryId })),
  onCameraChange: (camera: Camera) => dispatch(ScenesAction.setCamera({ sceneId, camera })),
  onGravityChange: (gravity: Vector3) => dispatch(ScenesAction.setGravity({ sceneId, gravity })),
  onSelectNodeId: (nodeId: string) => dispatch(ScenesAction.selectNode({ sceneId, nodeId })),
  onSetNodeBatch: (setNodeBatch: Omit<ScenesAction.SetNodeBatch, 'type' | 'sceneId'>) =>
    dispatch(ScenesAction.setNodeBatch({ sceneId, ...setNodeBatch })),
  onResetScene: () => dispatch(ScenesAction.softResetScene({ sceneId })),
  onCreateScene: (sceneId: string, scene: Scene) => {
    dispatch(ScenesAction.createScene({ sceneId, scene }));
    dispatch(push(`/scene/${sceneId}`));
  },
  onChallengeCompletionCreate: (challengeId: string, challengeCompletion: ChallengeCompletion) => {
    dispatch(ChallengeCompletionsAction.createChallengeCompletion({ challengeId, challengeCompletion }));
  },
  onChallengeCompletionSceneDiffChange: (challengeId: string, sceneDiff: OuterObjectPatch<Scene>) => {
    dispatch(ChallengeCompletionsAction.setSceneDiff({ challengeId, sceneDiff }));
  },
  onChallengeCompletionEventStateRemove: (challengeId: string, eventId: string) => {
    dispatch(ChallengeCompletionsAction.removeEventState({ challengeId, eventId }));
  },
  onChallengeCompletionEventStateChange: (challengeId: string, eventId: string, eventState: boolean) => {
    dispatch(ChallengeCompletionsAction.setEventState({ challengeId, eventId, eventState }));
  },
  onChallengeCompletionEventStatesChange: (challengeId: string, eventStates: Dict<boolean>) => {
    dispatch(ChallengeCompletionsAction.setEventStates({ challengeId, eventStates }));
  },
  onChallengeCompletionSuccessPredicateCompletionChange: (challengeId: string, success?: PredicateCompletion) => {
    dispatch(ChallengeCompletionsAction.setSuccessPredicateCompletion({ challengeId, success }));
  },
  onChallengeCompletionFailurePredicateCompletionChange: (challengeId: string, failure?: PredicateCompletion) => {
    dispatch(ChallengeCompletionsAction.setFailurePredicateCompletion({ challengeId, failure }));
  },
  onChallengeCompletionReset: (challengeId: string) => {
    dispatch(ChallengeCompletionsAction.resetChallengeCompletion({ challengeId }));
  },
  onDeleteRecord: (selector: Selector) => {
    dispatch(ScenesAction.removeScene({ sceneId: selector.id })),
    dispatch(push('/'));
  },
  onDocumentationClick: () => dispatch(DocumentationAction.TOGGLE),
  onDocumentationPush: (location: DocumentationLocation) => dispatch(DocumentationAction.pushLocation({ location })),
  onDocumentationSetLanguage: (language: 'c' | 'python') => dispatch(DocumentationAction.setLanguage({ language })),
  onDocumentationGoToFuzzy: (query: string, language: 'c' | 'python') => dispatch(DocumentationAction.goToFuzzy({ query, language })),
  onSaveScene: (sceneId: string) => dispatch(ScenesAction.saveScene({ sceneId })),
  onSetScenePartial: (partialScene: Partial<Scene>) => dispatch(ScenesAction.setScenePartial({ sceneId, partialScene })),
  unfailScene: (sceneId: string) => dispatch(ScenesAction.unfailScene({ sceneId })),
  goToLogin: () => {
    window.location.href = `/login?from=${window.location.pathname}`;
  },
  onScriptChange: (scriptId: string, script: Script) => {
    dispatch(ScenesAction.setScript({ sceneId, scriptId, script }));
  },
  onScriptRemove: (scriptId: string) => {
    dispatch(ScenesAction.removeScript({ sceneId, scriptId }));
  },
}))(Root) as React.ComponentType<RootPublicProps>;

export { RootState };