import * as React from 'react';
import { connect } from 'react-redux';
import { styled } from 'styletron-react';
import { Message } from 'ivygate';
import { applyObjectPatch, createObjectPatch, ObjectPatch, OuterObjectPatch } from 'symmetry';

import { signOutOfApp } from '../firebase/modules/auth';

import WorkerInstance from '../programming/WorkerInstance';
import compile from '../programming/compiler/compile';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';

import LoadingOverlay from '../components/Challenge/LoadingOverlay';
import { SimulatorState } from '../components/Challenge/SimulatorState';
import ExceptionDialog from '../components/Challenge/ExceptionDialog';
import ChallengeMenu from '../components/Challenge/ChallengeMenu';

import { DEFAULT_SETTINGS, Settings } from '../components/constants/Settings';
import { DARK, Theme } from '../components/constants/theme';

import SettingsDialog from '../components/Dialog/SettingsDialog';
import AboutDialog from '../components/Dialog/AboutDialog';

import { DEFAULT_FEEDBACK, Feedback, FeedbackSuccessDialog, } from '../components/Feedback';
import { Layout, LayoutProps, LayoutEditorTarget, OverlayLayout, OverlayLayoutRedux, SideLayoutRedux } from '../components/Layout';
import { DeleteDialog } from '../components/Dialog';

import Loading from '../components/Loading';
import { Editor } from '../components/Editor';
import { Capabilities } from '../components/World';

import { State as ReduxState } from '../state';
import { DocumentationAction, ScenesAction, AiAction } from '../state/reducer';
import { LimitedChallengeCompletionsAction } from '../state/reducer/limitedChallengeCompletions';
import { sendMessage, SendMessageParams } from '../util/ai';

import Scene, { AsyncScene } from '../state/State/Scene';
import Script from '../state/State/Scene/Script';
import Node from '../state/State/Scene/Node';
import Geometry from '../state/State/Scene/Geometry';
import Camera from '../state/State/Scene/Camera';

import Async from '../state/State/Async';
import LimitedChallenge, { AsyncLimitedChallenge, LimitedChallengeStatus } from '../state/State/LimitedChallenge';
import LimitedChallengeCompletion, { AsyncLimitedChallengeCompletion } from '../state/State/LimitedChallengeCompletion';
import PredicateCompletion from '../state/State/ChallengeCompletion/PredicateCompletion';
import Predicate from '../state/State/Challenge/Predicate';

import DocumentationLocation from '../state/State/Documentation/DocumentationLocation';

import DbError from '../db/Error';
import Builder from '../db/Builder';

import { StyledText } from '../util';
import Dict from '../util/objectOps/Dict';
import parseMessages, { hasErrors, hasWarnings, sort, toStyledText } from '../util/parseMessages';
import { Vector3wUnits, ReferenceFramewUnits } from '../util/math/unitMath';
import LocalizedString from '../util/LocalizedString';

import { Space } from '../simulator/Space';
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import { withParams } from '../util/withParams';
import tr from '@i18n';

import Motor from '../programming/AbstractRobot/Motor';
import { Modal } from './sharedRoot/Modal';
import AiWindow from '../components/Ai/AiWindow';
import Robot from '../state/State/Robot';
import { CountdownTimer } from '../components/LimitedChallenge';

export interface LimitedChallengeRootRouteParams {
  [key: string]: string | undefined;
  challengeId: string;
}

export interface RootPublicProps {
  params: LimitedChallengeRootRouteParams;
}

interface RootPrivateProps {
  scene: AsyncScene;
  challenge?: AsyncLimitedChallenge;
  challengeCompletion?: AsyncLimitedChallengeCompletion;
  locale: LocalizedString.Language;

  robots: Dict<Robot>;

  onChallengeCompletionCreate: (challengeCompletion: LimitedChallengeCompletion) => void;
  onChallengeCompletionSceneDiffChange: (sceneDiff: OuterObjectPatch<Scene>) => void;
  onChallengeCompletionEventStateRemove: (eventId: string) => void;
  onChallengeCompletionEventStateChange: (eventId: string, eventState: boolean) => void;
  onChallengeCompletionEventStatesAndPredicateCompletionsChange: (eventState: Dict<boolean>, success: PredicateCompletion, failure: PredicateCompletion) => void;
  onChallengeCompletionSuccessPredicateCompletionChange: (success?: PredicateCompletion) => void;
  onChallengeCompletionFailurePredicateCompletionChange: (failure?: PredicateCompletion) => void;
  onChallengeCompletionReset: () => void;
  onChallengeCompletionSetCode: (language: ProgrammingLanguage, code: string) => void;
  onChallengeCompletionSetCurrentLanguage: (language: ProgrammingLanguage) => void;
  onChallengeCompletionSetRobotLinkOrigins: (robotLinkOrigins: Dict<Dict<ReferenceFramewUnits>>) => void;
  onChallengeCompletionSave: () => void;
  onRecordBestCompletion: (runtimeMs: number, program: string, language: ProgrammingLanguage) => void;

  onDocumentationClick: () => void;
  onDocumentationPush: (location: DocumentationLocation) => void;
  onDocumentationSetLanguage: (language: 'c' | 'python') => void;
  onDocumentationGoToFuzzy: (query: string, language: 'c' | 'python') => void;

  goToLogin: () => void;

  onAiClick: () => void;
  onAskTutorClick: (query: SendMessageParams) => void;
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
  // Timing for limited challenges
  runStartTime?: number;
  // Tentative success: captured when success conditions met, finalized after program stops
  tentativeSuccessRuntimeMs?: number;
  // The code that was actually executed, captured at run time
  runningCode?: string;
  runningLanguage?: ProgrammingLanguage;
}

type Props = RootPublicProps & RootPrivateProps & WithNavigateProps;
type State = RootState;

interface ContainerProps {
  $windowInnerHeight: number
}
const Container = styled('div', (props: ContainerProps) => ({
  width: '100vw',
  height: `${props.$windowInnerHeight}px`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'fixed'
}));

const ClosedOverlay = styled('div', () => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.8)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  color: '#fff',
}));

const ClosedTitle = styled('h1', () => ({
  fontSize: '2em',
  marginBottom: '16px',
}));

const ClosedMessage = styled('p', () => ({
  fontSize: '1.2em',
  opacity: 0.8,
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

class LimitedChallengeRoot extends React.Component<Props, State> {
  private editorRef: React.MutableRefObject<Editor>;
  private overlayLayoutRef: React.MutableRefObject<OverlayLayout>;
  private workingChallengeScene_: Scene;

  private incrementNonce_ = () => {
    this.setState({
      nonce: (this.state.nonce + 1) % 100000
    });
  };

  private set workingChallengeScene(scene: Scene) {
    if (scene === this.workingChallengeScene_) return;
    this.workingChallengeScene_ = scene;
    Space.getInstance().scene = scene;
    this.incrementNonce_();
  }

  private onNodeChange_ = (nodeId: string, node: Node) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene = Scene.setNode(this.workingChallengeScene_, nodeId, node);
  };

  private onNodeAdd_ = this.onNodeChange_;

  private onNodeRemove_ = (nodeId: string) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene = Scene.removeNode(this.workingChallengeScene_, nodeId);
  };

  private onGeometryChange_ = (geometryId: string, geometry: Geometry) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene = Scene.setGeometry(this.workingChallengeScene_, geometryId, geometry);
  };

  private onGeometryAdd_ = this.onGeometryChange_;

  private onGeometryRemove_ = (geometryId: string) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene = Scene.removeGeometry(this.workingChallengeScene_, geometryId);
  };

  private onScriptChange_ = (scriptId: string, script: Script) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene = Scene.setScript(this.workingChallengeScene_, scriptId, script);
  };

  private onScriptAdd_ = this.onScriptChange_;

  private onScriptRemove_ = (scriptId: string) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene = Scene.removeScript(this.workingChallengeScene_, scriptId);
  };

  private onObjectAdd_ = (nodeId: string, obj: Node.Obj, geometry: Geometry) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene = Scene.addObject(this.workingChallengeScene_, nodeId, obj, geometry);
  };

  private onCameraChange_ = (camera: Camera) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene = Scene.setCamera(this.workingChallengeScene_, camera);
  };

  private onGravityChange_ = (gravity: Vector3wUnits) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene = Scene.setGravity(this.workingChallengeScene_, gravity);
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
      console: StyledText.text({ text: LocalizedString.lookup(tr('Welcome to the KIPR Simulator!\n'), props.locale), style: STDOUT_STYLE(DARK) }),
      theme: DARK,
      messages: [],
      settings: DEFAULT_SETTINGS,
      feedback: DEFAULT_FEEDBACK,
      windowInnerHeight: window.innerHeight,
      nonce: 0
    };

    this.editorRef = React.createRef();
    this.overlayLayoutRef = React.createRef();

    Space.getInstance().scene = Scene.EMPTY;
  }

  private onSetNodeBatch_ = (setNodeBatch: Omit<ScenesAction.SetNodeBatch, 'type' | 'sceneId'>) => {
    if (!this.workingChallengeScene_) return;

    let nextScene = this.workingChallengeScene_;
    for (const { id, node } of setNodeBatch.nodeIds) nextScene = Scene.setNode(nextScene, id, node);
    this.workingChallengeScene = nextScene;
  };

  private onResetScene_ = () => {
    const { scene, challenge, challengeCompletion } = this.props;

    if (!challengeCompletion) return;

    this.onStopClick_();
    this.workingChallengeScene = Async.latestValue(scene);

    const latestChallenge = Async.latestValue(challenge);
    const latestChallengeCompletion = Async.latestValue(challengeCompletion);
    if (latestChallengeCompletion && latestChallenge) {
      const eventStates = Dict.map(latestChallengeCompletion.eventStates, () => false);
      this.props.onChallengeCompletionEventStatesAndPredicateCompletionsChange(
        eventStates,
        latestChallenge.success ? PredicateCompletion.update(PredicateCompletion.EMPTY, latestChallenge.success, eventStates) : undefined,
        latestChallenge.failure ? PredicateCompletion.update(PredicateCompletion.EMPTY, latestChallenge.failure, eventStates) : undefined,
      );
    }

    // Reset timing and tentative success
    this.setState({
      runStartTime: undefined,
      tentativeSuccessRuntimeMs: undefined,
      runningCode: undefined,
      runningLanguage: undefined,
    });

    this.syncChallengeCompletion_();
  };

  private onSetEventValue_ = (eventId: string, value: boolean) => {
    const { challenge, challengeCompletion } = this.props;

    const latestChallenge = Async.latestValue(challenge);
    if (!latestChallenge) return;

    const latestChallengeCompletion = Async.latestValue(challengeCompletion);
    if (!latestChallengeCompletion) return;

    const { success, failure } = latestChallenge;
    const { success: successCompletion, failure: failureCompletion } = latestChallengeCompletion;

    if (latestChallengeCompletion.eventStates[eventId] === value) return;

    const nextEventStates = {
      ...latestChallengeCompletion.eventStates,
      [eventId]: value,
    };

    const newSuccessCompletion = success ? PredicateCompletion.update(successCompletion || PredicateCompletion.EMPTY, success, nextEventStates) : undefined;
    const newFailureCompletion = failure ? PredicateCompletion.update(failureCompletion || PredicateCompletion.EMPTY, failure, nextEventStates) : undefined;

    this.props.onChallengeCompletionEventStatesAndPredicateCompletionsChange(
      nextEventStates,
      newSuccessCompletion,
      newFailureCompletion
    );

    // Track tentative success and handle failure invalidation
    const isSuccess = success && newSuccessCompletion?.exprStates[success.rootId];
    const wasSuccess = success && successCompletion?.exprStates[success.rootId];
    const isFailure = failure && newFailureCompletion?.exprStates[failure.rootId];
    const wasFailure = failure && failureCompletion?.exprStates[failure.rootId];

    // When success becomes true (and failure is not true), capture tentative success
    if (isSuccess && !wasSuccess && !isFailure && this.state.runStartTime && !this.state.tentativeSuccessRuntimeMs) {
      const runtimeMs = Date.now() - this.state.runStartTime;
      this.setState(prev => ({
        tentativeSuccessRuntimeMs: runtimeMs,
        console: StyledText.extend(prev.console, StyledText.text({
          text: LocalizedString.lookup(tr('Success conditions met - verifying...\n'), this.props.locale),
          style: { color: '#ffc107', fontWeight: 'bold' }
        })),
      }));
    }

    // When failure becomes true, invalidate any tentative success
    if (isFailure && !wasFailure && this.state.tentativeSuccessRuntimeMs) {
      this.setState(prev => ({
        tentativeSuccessRuntimeMs: undefined,
        console: StyledText.extend(prev.console, StyledText.text({
          text: LocalizedString.lookup(tr('Completion invalidated - failure condition triggered\n'), this.props.locale),
          style: { color: '#f44336', fontWeight: 'bold' }
        })),
      }));
    }

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
    Space.getInstance().onNodeAdd = undefined;
    Space.getInstance().onNodeRemove = undefined;
    Space.getInstance().onNodeChange = undefined;
    Space.getInstance().onGeometryAdd = undefined;
    Space.getInstance().onGeometryRemove = undefined;
    Space.getInstance().onGravityChange = undefined;
    Space.getInstance().onCameraChange = undefined;
    Space.getInstance().onChallengeSetEventValue = undefined;

    this.initedChallengeCompletionScene_ = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<RootState>): void {
    const { params: { challengeId }, challenge, challengeCompletion } = this.props;

    if (challengeId && challenge && challengeCompletion && challengeCompletion.type === Async.Type.LoadFailed) {
      const latestChallenge = Async.latestValue(challenge);
      if (challengeCompletion.error.code === DbError.CODE_NOT_FOUND && latestChallenge) {
        console.log('Limited challenge completion not found');
        this.props.onChallengeCompletionCreate({
          ...LimitedChallengeCompletion.EMPTY,
          code: latestChallenge.code,
          currentLanguage: latestChallenge.defaultLanguage,
        });
      }
    }

    if (this.state.simulatorState.type !== prevState.simulatorState.type) {
      Space.getInstance().sceneBinding.scriptManager.programStatus = this.state.simulatorState.type === SimulatorState.Type.Running ? 'running' : 'stopped';
    }

    if (this.props.params.challengeId !== prevProps.params.challengeId) {
      this.initedChallengeCompletionScene_ = false;
    }

    if (this.props.scene !== prevProps.scene || this.props.challengeCompletion !== prevProps.challengeCompletion) {
      const latestScene = Async.latestValue(this.props.scene);
      const latestChallengeCompletion = Async.latestValue(this.props.challengeCompletion);

      if (latestScene && latestChallengeCompletion && !this.initedChallengeCompletionScene_) {
        if (latestChallengeCompletion.serializedSceneDiff) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const sceneDiff = JSON.parse(latestChallengeCompletion.serializedSceneDiff);
          Space.getInstance().robotLinkOrigins = latestChallengeCompletion.robotLinkOrigins || {};
          this.workingChallengeScene = applyObjectPatch(latestScene, sceneDiff as ObjectPatch<Scene>);
          this.initedChallengeCompletionScene_ = true;
        }
      }
    }
  }

  private onWindowResize_ = () => {
    this.setState({ windowInnerHeight: window.innerHeight });
  };

  private lastSaveChallengeCompletionTime_ = 0;

  private saveChallengeCompletion_ = () => {
    this.props.onChallengeCompletionSetRobotLinkOrigins(Space.getInstance().sceneBinding.currentRobotLinkOrigins);
    this.props.onChallengeCompletionSave();
    this.lastSaveChallengeCompletionTime_ = Date.now();
  };

  private scheduleSaveChallengeCompletion_ = () => {
    if (Date.now() - this.lastSaveChallengeCompletionTime_ < 1000) return;
    this.saveChallengeCompletion_();
  };

  private syncChallengeCompletion_ = () => {
    let savedScene = this.workingChallengeScene_;
    for (const nodeId in savedScene.nodes) {
      const node = savedScene.nodes[nodeId];
      if (node.type !== 'robot') continue;

      savedScene = {
        ...savedScene,
        nodes: {
          ...savedScene.nodes,
          [nodeId]: {
            ...node,
            state: {
              ...node.state,
              motors: [
                { ...node.state.motors[0], pwm: 0, direction: Motor.Direction.Brake, done: true, mode: Motor.Mode.Pwm },
                { ...node.state.motors[1], pwm: 0, direction: Motor.Direction.Brake, done: true, mode: Motor.Mode.Pwm },
                { ...node.state.motors[2], pwm: 0, direction: Motor.Direction.Brake, done: true, mode: Motor.Mode.Pwm },
                { ...node.state.motors[3], pwm: 0, direction: Motor.Direction.Brake, done: true, mode: Motor.Mode.Pwm },
              ]
            }
          } as Node.Robot
        }
      };
    }

    const sceneDiff = createObjectPatch(Async.latestValue(this.props.scene), savedScene);
    this.props.onChallengeCompletionSceneDiffChange(sceneDiff);
    this.scheduleSaveChallengeCompletion_();
  };

  private onStopped_ = () => {
    this.setState({
      simulatorState: SimulatorState.STOPPED
    }, () => {
      this.syncChallengeCompletion_();

      // Finalize completion after 1 second delay to allow physics to settle
      setTimeout(() => {
        this.finalizeCompletion_();
      }, 1000);
    });
  };

  private finalizeCompletion_ = () => {
    const { challenge, challengeCompletion } = this.props;
    const { tentativeSuccessRuntimeMs } = this.state;

    // No tentative success to finalize
    if (!tentativeSuccessRuntimeMs) return;

    const latestChallenge = Async.latestValue(challenge);
    const latestChallengeCompletion = Async.latestValue(challengeCompletion);

    if (!latestChallenge || !latestChallengeCompletion) return;

    const { failure } = latestChallenge;
    const { failure: failureCompletion } = latestChallengeCompletion;

    // Check if failure occurred at any point
    const isFailure = failure && failureCompletion?.exprStates[failure.rootId];

    if (!isFailure) {
      // Success is valid - record the completion and save to backend
      const language = this.state.runningLanguage || this.currentLanguage;
      const program = this.state.runningCode || this.code[language] || '';
      this.props.onRecordBestCompletion(tentativeSuccessRuntimeMs, program, language);
      this.saveChallengeCompletion_();

      this.setState(prev => ({
        tentativeSuccessRuntimeMs: undefined,
        runStartTime: undefined,
        runningCode: undefined,
        runningLanguage: undefined,
        console: StyledText.extend(prev.console, StyledText.text({
          text: LocalizedString.lookup(tr(`Challenge completed in ${(tentativeSuccessRuntimeMs / 1000).toFixed(2)} seconds!\n`), this.props.locale),
          style: { color: '#4caf50', fontWeight: 'bold' }
        })),
      }));
    } else {
      // Failure occurred - clear tentative success without recording
      this.setState({
        tentativeSuccessRuntimeMs: undefined,
        runStartTime: undefined,
        runningCode: undefined,
        runningLanguage: undefined,
      });
    }
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

  private get code(): { [language in ProgrammingLanguage]?: string } {
    const { challenge, challengeCompletion } = this.props;
    const latestChallengeCompletion = Async.latestValue(challengeCompletion);
    const latestChallenge = Async.latestValue(challenge);

    return latestChallengeCompletion
      ? latestChallengeCompletion.code
      : latestChallenge.code;
  }

  private get challengeStatus(): LimitedChallengeStatus {
    const { challenge } = this.props;
    const latestChallenge = Async.latestValue(challenge);
    if (!latestChallenge) return 'closed';
    return LimitedChallengeStatus.fromChallenge(latestChallenge);
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
    this.setState({ layout });
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
    // Block if challenge is closed
    if (this.challengeStatus === 'closed') {
      this.setState(prev => ({
        console: StyledText.extend(prev.console, StyledText.text({
          text: LocalizedString.lookup(tr('This challenge is closed and no longer accepting submissions.\n'), this.props.locale),
          style: STDERR_STYLE(this.state.theme)
        }))
      }));
      return;
    }

    if (this.challengeStatus === 'upcoming') {
      this.setState(prev => ({
        console: StyledText.extend(prev.console, StyledText.text({
          text: LocalizedString.lookup(tr('This challenge has not opened yet.\n'), this.props.locale),
          style: STDERR_STYLE(this.state.theme)
        }))
      }));
      return;
    }

    const { props, state } = this;
    const { locale } = props;
    const { console: consoleState } = state;

    const language = this.currentLanguage;
    const activeCode = this.code[language];

    switch (this.currentLanguage) {
      case 'c':
      case 'cpp': {
        let nextConsole: StyledText = StyledText.extend(consoleState, StyledText.text({
          text: LocalizedString.lookup(tr('Compiling...\n'), locale),
          style: STDOUT_STYLE(this.state.theme)
        }));

        this.setState({
          simulatorState: SimulatorState.COMPILING,
          console: nextConsole,
          runningCode: activeCode,
          runningLanguage: language,
        }, () => {
          compile(activeCode, language)
            .then(compileResult => {
              nextConsole = this.state.console;
              const messages = sort(parseMessages(compileResult.stderr));
              const compileSucceeded = compileResult.result && compileResult.result.length > 0;

              for (const message of messages) {
                nextConsole = StyledText.extend(nextConsole, toStyledText(message, {
                  onClick: message.ranges.length > 0
                    ? this.onErrorMessageClick_(message.ranges[0].start.line)
                    : undefined
                }));
              }

              if (compileSucceeded) {
                const haveWarnings = hasWarnings(messages);
                nextConsole = StyledText.extend(nextConsole, StyledText.text({
                  text: haveWarnings
                    ? LocalizedString.lookup(tr('Compilation succeeded with warnings\n'), locale)
                    : LocalizedString.lookup(tr('Compilation succeeded\n'), locale),
                  style: STDOUT_STYLE(this.state.theme)
                }));

                // Record start time for timing
                this.setState({ runStartTime: Date.now() });

                WorkerInstance.start({
                  language: language,
                  code: compileResult.result
                });
              } else {
                if (!hasErrors(messages)) {
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
        // Record start time for timing
        this.setState({
          simulatorState: SimulatorState.RUNNING,
          runStartTime: Date.now(),
          runningCode: activeCode,
          runningLanguage: language,
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
    element.setAttribute('download', `program.${ProgrammingLanguage.FILE_EXTENSION[language]}`);
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

  private onEndChallengeClick_ = () => {
    const { params: { challengeId } } = this.props;
    // Use full page refresh to ensure clean state
    window.location.href = `/limited-challenge/${challengeId}/leaderboard`;
  };

  private onResetCode_ = () => {
    this.setState({
      modal: Modal.RESET_CODE
    });
  };

  private onResetCodeAccept_ = () => {
    const { challenge } = this.props;
    if (!challenge) return;

    const latestChallenge = Async.latestValue(challenge);
    const language = this.currentLanguage;

    this.props.onChallengeCompletionSetCode(language, latestChallenge.code[language]);
    this.scheduleSaveChallengeCompletion_();
  };

  private onAiClick_ = () => {
    this.props.onAiClick();
  };

  private onAskTutorClick_ = () => {
    const workingScene: AsyncScene = this.workingChallengeScene_
      ? Async.loaded({ value: this.workingChallengeScene_ })
      : this.props.scene;

    this.props.onAskTutorClick({
      content: "Please help me understand what's wrong.",
      code: this.code[this.currentLanguage],
      language: this.currentLanguage,
      console: StyledText.toString(this.state.console),
      robot: this.props.robots[Dict.unique(Scene.robots(Async.latestValue(workingScene)))?.robotId ?? "demobot"],
    });
  };

  render() {
    const { props, state } = this;

    const {
      params: { challengeId },
      scene,
      challenge,
      challengeCompletion,
      onAskTutorClick,
      onDocumentationClick,
      onDocumentationGoToFuzzy,
      robots,
      locale
    } = props;

    const {
      challengeStarted
    } = state;

    const latestChallenge = Async.latestValue(challenge);
    const latestChallengeCompletion = Async.latestValue(challengeCompletion);

    // Check if challenge is closed
    const status = this.challengeStatus;

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
      console: consoleState,
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

    const robot = robots[Dict.unique(Scene.robots(Async.latestValue(workingScene) ?? Scene.EMPTY))?.robotId ?? "demobot"];

    const commonLayoutProps: LayoutProps = {
      theme,
      console: consoleState,
      messages,
      settings,
      editorTarget,
      onClearConsole: this.onClearConsole_,
      onAskTutorClick: this.onAskTutorClick_,
      onIndentCode: this.onIndentCode_,
      onDownloadCode: this.onDownloadClick_,
      editorRef: this.editorRef,
      sceneId: undefined,
      layout,
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
      onResetCode: this.onResetCode_,

      challengeState: challenge ? {
        challenge,
        challengeCompletion: challengeCompletion || Async.unloaded({ brief: {} }),
      } : undefined,
      worldCapabilities: WORLD_CAPABILITIES,
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
            onDocumentationClick={onDocumentationClick}
            onDashboardClick={this.onDashboardClick}
            onLogoutClick={this.onLogoutClick}
            onEndChallengeClick={this.onEndChallengeClick_}
            onAiClick={this.onAiClick_}
            simulatorState={simulatorState}
          />
          {impl}
        </Container>
        {status === 'closed' && (
          <ClosedOverlay>
            <ClosedTitle>{LocalizedString.lookup(tr('Challenge Closed'), locale)}</ClosedTitle>
            <ClosedMessage>
              {LocalizedString.lookup(tr('This challenge is no longer accepting submissions.'), locale)}
            </ClosedMessage>
            {latestChallengeCompletion?.bestRuntimeMs !== undefined && (
              <div style={{ marginTop: '16px', color: '#4caf50', fontSize: '1.2em' }}>
                {LocalizedString.lookup(tr('Your best time: '), locale)}
                {(latestChallengeCompletion.bestRuntimeMs / 1000).toFixed(2)}s
              </div>
            )}
          </ClosedOverlay>
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
        {modal.type === Modal.Type.ResetCode && (
          <DeleteDialog
            name={tr('your current work')}
            theme={theme}
            onAccept={this.onResetCodeAccept_}
            onClose={this.onModalClose_}
          />
        )}
        <AiWindow
          theme={DARK}
          code={code}
          language={language}
          console={StyledText.toString(consoleState)}
          robot={robot}
        />
      </>
    );
  }
}

const ConnectedLimitedChallengeRoot = connect((state: ReduxState, { params: { challengeId } }: RootPublicProps) => {
  const builder = new Builder(state);

  // Use the builder pattern to load the limited challenge, scene, and completion
  const limitedChallenge = builder.limitedChallenge(challengeId);
  limitedChallenge.scene();
  limitedChallenge.completion();

  builder.dispatchLoads();

  return {
    scene: Dict.unique(builder.scenes),
    challenge: Dict.unique(builder.limitedChallenges),
    challengeCompletion: Dict.unique(builder.limitedChallengeCompletions),
    locale: state.i18n.locale,
    robots: Dict.map(state.robots.robots, Async.latestValue),
  };
}, (dispatch, { params: { challengeId } }: RootPublicProps) => ({
  onChallengeCompletionCreate: (challengeCompletion: LimitedChallengeCompletion) => {
    dispatch(LimitedChallengeCompletionsAction.createLimitedChallengeCompletion({ challengeId, challengeCompletion }));
  },
  onChallengeCompletionSceneDiffChange: (sceneDiff: OuterObjectPatch<Scene>) => {
    dispatch(LimitedChallengeCompletionsAction.setSceneDiff({ challengeId, sceneDiff }));
  },
  onChallengeCompletionEventStateRemove: (eventId: string) => {
    dispatch(LimitedChallengeCompletionsAction.removeEventState({ challengeId, eventId }));
  },
  onChallengeCompletionEventStateChange: (eventId: string, eventState: boolean) => {
    dispatch(LimitedChallengeCompletionsAction.setEventState({ challengeId, eventId, eventState }));
  },
  onChallengeCompletionEventStatesAndPredicateCompletionsChange: (eventStates: Dict<boolean>, success: PredicateCompletion, failure: PredicateCompletion) => {
    dispatch(LimitedChallengeCompletionsAction.setEventStatesAndPredicateCompletions({ challengeId, eventStates, success, failure }));
  },
  onChallengeCompletionSuccessPredicateCompletionChange: (success?: PredicateCompletion) => {
    dispatch(LimitedChallengeCompletionsAction.setSuccessPredicateCompletion({ challengeId, success }));
  },
  onChallengeCompletionFailurePredicateCompletionChange: (failure?: PredicateCompletion) => {
    dispatch(LimitedChallengeCompletionsAction.setFailurePredicateCompletion({ challengeId, failure }));
  },
  onChallengeCompletionReset: () => {
    dispatch(LimitedChallengeCompletionsAction.resetLimitedChallengeCompletion({ challengeId }));
  },
  onChallengeCompletionSetCode: (language: ProgrammingLanguage, code: string) => {
    dispatch(LimitedChallengeCompletionsAction.setCode({ challengeId, language, code }));
  },
  onChallengeCompletionSetCurrentLanguage: (language: ProgrammingLanguage) => {
    dispatch(LimitedChallengeCompletionsAction.setCurrentLanguage({ challengeId, language }));
  },
  onChallengeCompletionSetRobotLinkOrigins: (robotLinkOrigins: Dict<Dict<ReferenceFramewUnits>>) => {
    dispatch(LimitedChallengeCompletionsAction.setRobotLinkOrigins({ challengeId, robotLinkOrigins }));
  },
  onChallengeCompletionSave: () => {
    dispatch(LimitedChallengeCompletionsAction.saveLimitedChallengeCompletion({ challengeId }));
  },
  onRecordBestCompletion: (runtimeMs: number, program: string, language: ProgrammingLanguage) => {
    dispatch(LimitedChallengeCompletionsAction.recordBestCompletion({ challengeId, runtimeMs, program, language }));
  },
  onDocumentationClick: () => dispatch(DocumentationAction.TOGGLE),
  onDocumentationPush: (location: DocumentationLocation) => dispatch(DocumentationAction.pushLocation({ location })),
  onDocumentationSetLanguage: (language: 'c' | 'python') => dispatch(DocumentationAction.setLanguage({ language })),
  onDocumentationGoToFuzzy: (query: string, language: 'c' | 'python') => dispatch(DocumentationAction.goToFuzzy({ query, language })),
  goToLogin: () => {
    window.location.href = `/login?from=${window.location.pathname}`;
  },
  onAiClick: () => dispatch(AiAction.TOGGLE),
  onAskTutorClick: (params: SendMessageParams) => sendMessage(dispatch, params),
}))(withNavigate(LimitedChallengeRoot)) as React.ComponentType<RootPublicProps>;

export default withParams<LimitedChallengeRootRouteParams>()(ConnectedLimitedChallengeRoot);
