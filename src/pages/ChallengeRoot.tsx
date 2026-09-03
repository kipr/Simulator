import * as React from 'react';
import { flushSync } from 'react-dom';
import { connect } from 'react-redux';
import { styled } from 'styletron-react';
import { Message } from 'ivygate/dist/src';
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
import { OpenSceneDialog, DeleteDialog, CustomChallengeSetupDialog } from '../components/Dialog';

import Loading from '../components/Loading';
import { Editor } from '../components/Editor';
import { Capabilities } from '../components/World';


import store, { State as ReduxState } from '../state';
import { ScenesAction, ChallengeCompletionsAction, AiAction } from '../state/reducer';

import { sendMessage, SendMessageParams } from '../util/ai';
import { DocumentationAction } from 'ivygate/dist/src/state/reducer/documentation';
import Scene, { AsyncScene } from '../state/State/Scene';
import Script from '../state/State/Scene/Script';
import Node from '../state/State/Scene/Node';
import Geometry from '../state/State/Scene/Geometry';
import Camera from '../state/State/Scene/Camera';

import Async from '../state/State/Async';
import { AsyncChallenge } from '../state/State/Challenge';
import { AsyncChallengeCompletion } from '../state/State/ChallengeCompletion';
import PredicateCompletion from '../state/State/ChallengeCompletion/PredicateCompletion';

import DocumentationLocation from '../state/State/Documentation/DocumentationLocation';

import Record from '../db/Record';
import Selector from '../db/Selector';
import Builder from '../db/Builder';
import { StyledText } from '../util';
import construct from '../util/redux/construct';
import Dict from '../util/objectOps/Dict';
import parseMessages, { hasErrors, hasWarnings, sort, toStyledText } from '../util/parseMessages';
import { Vector3wUnits, ReferenceFramewUnits } from '../util/math/unitMath';
import LocalizedString from '../util/LocalizedString';

import { Space } from '../simulator/Space';
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import { withParams } from '../util/withParams';
import tr from '@i18n';
import MatPlayZonesSceneOverlay from '../components/CustomChallenges/MatPlayZonesSceneOverlay';
import { applyChallengeEventValueChange } from '../util/challengeEventUpdates';
import { isCustomChallengeId } from '../util/customChallengeFactory';
import { isClassroomSharedReadOnlyScene } from '../util/customChallengeClassroomShare';
import {
  isCustomCanPoseChallengeEventId,
  stayUprightSuccessGoals,
  touchSuccessNeverTouchedPairs,
} from '../util/customChallengeGoals';
import {
  REAM_STOP_NEAR_DISTANCE_CM,
  reamTouchedFailureEventId,
  robotNearReamHorizWorld_,
  stayReamStopNearSuccessGoals,
} from '../util/jbcReamStopNear';
import {
  prepareCustomChallengeSceneForSimulator,
  refreshCustomChallengeRuntimeScriptOnScene,
  reinstantiateCustomChallengeRuntimeScript,
  syncCustomChallengePhysicsPosesIntoScriptScene,
} from '../util/customChallengeSceneScripts';
import {
  buildSuccessPredicate,
  conditionGoalsFromChallenge,
} from '../util/customChallengePredicates';
import {
  allZoneSuccessGoals,
  isPlayAreaSuccessEventId,
} from '../util/playAreaSuccessGoals';
import { matPlayZonesFromScene } from '../util/jbcMatPlayArea';
import { worldItemsFromScene } from '../util/jbcChallengeCatalog';
import { isSelectionOnlySceneUpdate, scenePropsRequireSimulatorReload } from '../util/scenePropsRequireSimulatorReload';


import Motor from '../programming/AbstractRobot/Motor';
import { Modal } from './sharedRoot/Modal';
import AiWindow from '../components/Ai/AiWindow';
import Robot from '../state/State/Robot';
import { Project } from 'state/State/Project';


export interface ChallengeRootRouteParams {
  [key: string]: string | undefined;
  challengeId: string;
}
export interface RootPublicProps {
  params: ChallengeRootRouteParams;
}

interface RootPrivateProps {
  scene: AsyncScene;
  challenge?: AsyncChallenge;
  challengeCompletion?: AsyncChallengeCompletion;
  locale: LocalizedString.Language;

  robots: Dict<Robot>;

  onChallengeCompletionSceneDiffChange: (sceneDiff: OuterObjectPatch<Scene>) => void;
  onChallengeCompletionEventStateRemove: (eventId: string) => void;
  onChallengeCompletionEventStateChange: (eventId: string, eventState: boolean) => void;
  onChallengeCompletionEventStatesAndPredicateCompletionsChange: (eventState: Dict<boolean>, success: PredicateCompletion, failure: PredicateCompletion) => void;
  onChallengeCompletionSuccessPredicateCompletionChange: (success?: PredicateCompletion) => void;
  onChallengeCompletionFailurePredicateCompletionChange: (failure?: PredicateCompletion) => void;
  onChallengeCompletionReset: () => void;
  onSoftResetScene: () => void;
  onChallengeCompletionSetCode: (language: ProgrammingLanguage, code: string) => void;
  onChallengeCompletionSetCurrentLanguage: (language: ProgrammingLanguage) => void;
  onChallengeCompletionSetRobotLinkOrigins: (robotLinkOrigins: Dict<Dict<ReferenceFramewUnits>>) => void;
  onChallengeCompletionSave: () => void;

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

  /** Live flags for GoalList while the sim render loop fires scene events. */
  liveChallengeEventStates: Dict<boolean>;
  /** Live predicate expr states (custom can pose goals) — avoids Redux batch lag. */
  liveSuccessCompletion?: PredicateCompletion;
  liveFailureCompletion?: PredicateCompletion;

  nonce: number;
}

type Props = RootPublicProps & RootPrivateProps & WithNavigateProps;
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
  private overlayLayoutRef: React.MutableRefObject<OverlayLayout>;

  private workingChallengeScene_: Scene | undefined;
  private appliedCompletionSceneDiff_ = false;
  /** Props scene instance we last synced from (avoids sync loops on new Async wrappers). */
  private lastSyncedPropsScene_: Scene | undefined;
  /** Skip one completion save after reset (stop would snapshot knocked-over poses). */
  private skipNextChallengeCompletionSync_ = false;

  /**
   * @param syncSpace When false (custom challenge while running), update script scene only
   *   and avoid async Space.scene reloads that reset tipped physics bodies.
   */
  private setWorkingChallengeScene_ = (scene: Scene, syncSpace = true) => {
    if (scene === this.workingChallengeScene_) {
      if (syncSpace && Space.getInstance().scene !== scene) {
        Space.getInstance().scene = scene;
      }
      return;
    }
    this.workingChallengeScene_ = scene;
    if (syncSpace && Space.getInstance().scene !== scene) {
      Space.getInstance().scene = scene;
    }
  };

  private set workingChallengeScene(scene: Scene) {
    this.setWorkingChallengeScene_(scene, true);
  }

  private playAreaRuntimeRefreshOptions_ = () => {
    const latestChallenge = Async.latestValue(this.props.challenge);
    const latestScene = Async.latestValue(this.props.scene);
    if (!latestScene) {
      return {};
    }
    if (!latestChallenge) {
      return {
        playAreaChallengeGoals: allZoneSuccessGoals(matPlayZonesFromScene(latestScene)),
      };
    }
    const allSuccessGoals = conditionGoalsFromChallenge(
      latestChallenge.success,
      latestChallenge.successGoals
    );
    const allFailureGoals = conditionGoalsFromChallenge(
      latestChallenge.failure,
      latestChallenge.failureGoals
    );
    return {
      playAreaChallengeGoals: allZoneSuccessGoals(matPlayZonesFromScene(latestScene)),
      challengeSuccessGoals: allSuccessGoals,
      challengeFailureGoals: allFailureGoals,
      successPredicate: latestChallenge.success,
      failurePredicate: latestChallenge.failure,
    };
  };

  private syncChallengeSceneIntoSimulator_ = (options?: { forceRuntimeRebuild?: boolean }) => {
    const latestScene = Async.latestValue(this.props.scene);
    if (!latestScene) return;
    if (
      !options?.forceRuntimeRebuild &&
      this.workingChallengeScene_ &&
      this.lastSyncedPropsScene_ &&
      !scenePropsRequireSimulatorReload(this.lastSyncedPropsScene_, latestScene)
    ) {
      return;
    }

    const { challengeId } = this.props.params;
    let sceneToLoad = Scene.resetNodeOriginsToStarting(latestScene);

    if (isCustomChallengeId(challengeId)) {
      sceneToLoad = prepareCustomChallengeSceneForSimulator(
        sceneToLoad,
        worldItemsFromScene(sceneToLoad),
        { ...this.playAreaRuntimeRefreshOptions_(), forceRebuild: true }
      );
    }

    if (this.workingChallengeScene_) {
      sceneToLoad = Scene.copyRobotStartingOrigins(this.workingChallengeScene_, sceneToLoad);
    }

    const latestChallengeCompletion =
      Async.latestValue(store.getState().challengeCompletions[challengeId]) ??
      Async.latestValue(this.props.challengeCompletion);
    if (latestChallengeCompletion?.serializedSceneDiff && !this.appliedCompletionSceneDiff_) {
      try {
        const sceneDiff = JSON.parse(
          latestChallengeCompletion.serializedSceneDiff
        ) as ObjectPatch<Scene> & { t?: string };
        const isEmptyDiff =
          sceneDiff?.t === 'o' && Object.keys(sceneDiff).length === 1;
        if (!isEmptyDiff) {
          Space.getInstance().robotLinkOrigins =
            latestChallengeCompletion.robotLinkOrigins || {};
          sceneToLoad = applyObjectPatch(sceneToLoad, sceneDiff);
        }
      } catch (err) {
        console.warn('Failed to apply challenge completion scene diff', err);
      }
      this.appliedCompletionSceneDiff_ = true;
    }

    sceneToLoad = this.clearSceneSelection_(sceneToLoad);
    this.lastSyncedPropsScene_ = latestScene;
    this.workingChallengeScene = sceneToLoad;
    this.reinstantiatePlayAreaRuntime_(sceneToLoad);
  };

  /** Apply saved completion pose without rebuilding the whole simulator scene. */
  private applyChallengeCompletionDiffToWorkingScene_ = () => {
    if (this.appliedCompletionSceneDiff_) return;

    const latestScene = Async.latestValue(this.props.scene);
    if (!latestScene || !this.workingChallengeScene_) return;

    const { challengeId } = this.props.params;
    const latestChallengeCompletion =
      Async.latestValue(store.getState().challengeCompletions[challengeId]) ??
      Async.latestValue(this.props.challengeCompletion);
    if (!latestChallengeCompletion?.serializedSceneDiff) return;

    try {
      const sceneDiff = JSON.parse(
        latestChallengeCompletion.serializedSceneDiff
      ) as ObjectPatch<Scene> & { t?: string };
      const isEmptyDiff =
        sceneDiff?.t === 'o' && Object.keys(sceneDiff).length === 1;
      if (isEmptyDiff) {
        this.appliedCompletionSceneDiff_ = true;
        return;
      }

      Space.getInstance().robotLinkOrigins =
        latestChallengeCompletion.robotLinkOrigins || {};
      let base = Scene.resetNodeOriginsToStarting(latestScene);
      if (isCustomChallengeId(challengeId)) {
        base = prepareCustomChallengeSceneForSimulator(
          base,
          worldItemsFromScene(base),
          this.playAreaRuntimeRefreshOptions_()
        );
      }
      const patched = this.clearSceneSelection_(applyObjectPatch(base, sceneDiff));
      this.workingChallengeScene = patched;
      this.appliedCompletionSceneDiff_ = true;
    } catch (err) {
      console.warn('Failed to apply challenge completion scene diff', err);
    }
  };

  private reinstantiatePlayAreaRuntime_ = (scene: Scene) => {
    const binding = Space.getInstance().sceneBinding;
    if (!binding) return;
    reinstantiateCustomChallengeRuntimeScript(binding.scriptManager, scene);
  };

  private incrementNonce_ = () => {
    this.setState({
      nonce: (this.state.nonce + 1) % 100000
    });
  };

  private onNodeChange_ = (nodeId: string, node: Node) => {
    if (!this.workingChallengeScene_) return;
    this.workingChallengeScene_ = Scene.setNode(this.workingChallengeScene_, nodeId, node);
    const space = Space.getInstance();
    const binding = space.sceneBinding;
    if (!binding) return;

    if (node.type === 'robot') {
      space.replaceSceneState(this.workingChallengeScene_);
      binding.syncNodeOriginsFromScene(this.workingChallengeScene_);
      this.incrementNonce_();
      return;
    }

    binding.applyNodeFromScript(nodeId, node);
    binding.scriptManager.scene = Scene.setNode(binding.scriptManager.scene, nodeId, node);
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

  private onSelectNodeId_ = (nodeId?: string) => {
    if (this.state.modal.type !== Modal.Type.CustomChallengeSetup) return;
    if (!this.workingChallengeScene_) return;
    Space.getInstance().applySceneSelection(nodeId, undefined);
    this.workingChallengeScene_ = {
      ...this.workingChallengeScene_,
      selectedNodeId: nodeId,
      selectedScriptId: undefined,
    };
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
      liveChallengeEventStates: {},
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

    const binding = Space.getInstance().sceneBinding;
    const customRunning =
      isCustomChallengeId(this.props.params.challengeId) &&
      binding?.scriptManager.programStatus === 'running';

    if (customRunning && binding) {
      this.setWorkingChallengeScene_(nextScene, false);
      binding.scriptManager.scene = nextScene;
      return;
    }

    // Preset JBC: Space.scene keeps scriptManager.scene aligned for nodeUpright().
    this.workingChallengeScene = nextScene;
  };

  private onResetScene_ = () => {
    const {
      scene,
      challenge,
      challengeCompletion,
      params: { challengeId },
    } = this.props;

    if (!challengeCompletion) return;

    this.skipNextChallengeCompletionSync_ = true;
    this.onStopClick_();
    const latestScene = Async.latestValue(scene);
    if (!latestScene) return;

    this.props.onChallengeCompletionReset();
    if (isCustomChallengeId(challengeId)) {
      this.props.onSoftResetScene();
    }

    Space.getInstance().sceneBinding?.scriptManager.clearChallengeEventValues();
    Space.getInstance().robotLinkOrigins = {};

    this.appliedCompletionSceneDiff_ = false;
    this.lastSyncedPropsScene_ = undefined;
    this.syncChallengeSceneIntoSimulator_({ forceRuntimeRebuild: true });

    const binding = Space.getInstance().sceneBinding;
    if (binding && this.workingChallengeScene_) {
      binding.syncNodeOriginsFromScene(this.workingChallengeScene_);
      binding.scriptManager.scene = this.workingChallengeScene_;
      binding.scriptManager.clearChallengeEventValues();
      binding.scriptManager.ensureSceneScripts(this.workingChallengeScene_);
      this.reinstantiatePlayAreaRuntime_(this.workingChallengeScene_);
    }

    const latestChallenge = Async.latestValue(challenge);
    const latestChallengeCompletion =
      Async.latestValue(store.getState().challengeCompletions[challengeId]) ??
      Async.latestValue(challengeCompletion);
    if (latestChallengeCompletion && latestChallenge) {
      const eventStates = Dict.map(latestChallengeCompletion.eventStates, () => false);
      this.props.onChallengeCompletionEventStatesAndPredicateCompletionsChange(
        eventStates,
        latestChallenge.success ? PredicateCompletion.update(PredicateCompletion.EMPTY, latestChallenge.success, eventStates) : undefined,
        latestChallenge.failure ? PredicateCompletion.update(PredicateCompletion.EMPTY, latestChallenge.failure, eventStates) : undefined,
      );
      this.setState({
        liveChallengeEventStates: { ...eventStates },
        liveSuccessCompletion: undefined,
        liveFailureCompletion: undefined,
      });
    }

    this.props.onChallengeCompletionSceneDiffChange({ t: 'o' } as ObjectPatch<Scene>);
    this.scheduleSaveChallengeCompletion_();
  };

  private onSetEventValue_ = (eventId: string, value: boolean) => {
    if (
      isCustomChallengeId(this.props.params.challengeId) &&
      value &&
      /^can[a-z0-9]+KnockedOver$/i.test(eventId) &&
      !/NotKnockedOver/i.test(eventId)
    ) {
      console.log('[custom-jbc knock-over] onSetEventValue_', eventId);
    }
    if (
      isCustomChallengeId(this.props.params.challengeId) &&
      value &&
      /(Touched|Reached)$/i.test(eventId) &&
      !/NeverTouched/i.test(eventId)
    ) {
      console.log('[custom-jbc touch] onSetEventValue_', eventId);
    }
    const { challengeId } = this.props.params;
    const state = store.getState();
    const latestChallenge = Async.latestValue(state.challenges[challengeId]);
    if (!latestChallenge) return;

    const latestChallengeCompletion = Async.latestValue(state.challengeCompletions[challengeId]);
    if (!latestChallengeCompletion) return;

    const { failure } = latestChallenge;
    let { success } = latestChallenge;
    const { success: successCompletion, failure: failureCompletion } = latestChallengeCompletion;

    if (
      isCustomChallengeId(this.props.params.challengeId) &&
      !success &&
      latestChallenge.successGoals?.length
    ) {
      success = buildSuccessPredicate(
        conditionGoalsFromChallenge(undefined, latestChallenge.successGoals)
      );
    }

    const baseEventStates = isCustomChallengeId(this.props.params.challengeId)
      ? {
        ...latestChallengeCompletion.eventStates,
        ...this.state.liveChallengeEventStates,
      }
      : latestChallengeCompletion.eventStates;

    const updated = applyChallengeEventValueChange(eventId, value, {
      success,
      failure,
      successGoals: latestChallenge.successGoals,
      eventStates: baseEventStates,
      successCompletion,
      failureCompletion,
    });

    const reduxMatches =
      latestChallengeCompletion.eventStates[eventId] ===
      updated.eventStates[eventId];
    const liveMatches =
      this.state.liveChallengeEventStates[eventId] ===
      updated.eventStates[eventId];
    const successOnceId = `${eventId}Once`;
    const successOnceChanged =
      !!success?.exprs[successOnceId] &&
      (successCompletion?.exprStates[successOnceId] ?? false) !==
        (updated.successCompletion?.exprStates[successOnceId] ?? false);
    const failureOnceId = `${eventId}Once`;
    const failureOnceChanged =
      !!failure?.exprs[failureOnceId] &&
      (failureCompletion?.exprStates[failureOnceId] ?? false) !==
        (updated.failureCompletion?.exprStates[failureOnceId] ?? false);

    const liveCanPose =
      isCustomChallengeId(this.props.params.challengeId) &&
      isCustomCanPoseChallengeEventId(eventId);

    if (
      !liveCanPose &&
      reduxMatches &&
      liveMatches &&
      !successOnceChanged &&
      !failureOnceChanged
    ) {
      return;
    }

    flushSync(() => {
      if (
        !reduxMatches ||
        successOnceChanged ||
        failureOnceChanged ||
        liveCanPose
      ) {
        this.props.onChallengeCompletionEventStatesAndPredicateCompletionsChange(
          updated.eventStates,
          updated.successCompletion,
          updated.failureCompletion
        );
      }
      this.setState({
        liveChallengeEventStates: { ...updated.eventStates },
        liveSuccessCompletion: updated.successCompletion,
        liveFailureCompletion: updated.failureCompletion,
      });
    });

    this.scheduleSaveChallengeCompletion_();
  };

  componentDidMount() {
    WorkerInstance.onStopped = this.onStopped_;
    WorkerInstance.onStarted = this.onStarted_;

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
    space.onAfterSceneApplied = () => {
      if (!isCustomChallengeId(this.props.params.challengeId)) return;
      const working = this.workingChallengeScene_;
      if (!working || !space.sceneBinding) return;
      const sm = space.sceneBinding.scriptManager;
      if (sm.programStatus === 'running') return;
      space.sceneBinding.syncNodeOriginsFromScene(working);
      sm.scene = working;
      sm.clearChallengeEventValues();
      sm.ensureSceneScripts(working);
      this.reinstantiatePlayAreaRuntime_(working);
    };

    if (space.sceneBinding) {
      space.sceneBinding.scriptManager.programStatus =
        this.state.simulatorState.type === SimulatorState.Type.Running
          ? 'running'
          : 'stopped';
    }
    this.applyCustomChallengeGizmoMode_();

    const { challengeId } = this.props.params;
    this.syncChallengeSceneIntoSimulator_(
      isCustomChallengeId(challengeId) ? { forceRuntimeRebuild: true } : undefined
    );
    this.scheduleUpdateConsole_();
    window.addEventListener('resize', this.onWindowResize_);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize_);
    cancelAnimationFrame(this.updateConsoleHandle_);

    if (this.saveTimeout_ !== undefined) {
      window.clearTimeout(this.saveTimeout_);
      this.saveChallengeCompletion_();
    }

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
    Space.getInstance().onAfterSceneApplied = undefined;
    Space.getInstance().gizmosEnabled = true;

    this.appliedCompletionSceneDiff_ = false;
    this.lastSyncedPropsScene_ = undefined;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<RootState>): void {
    if (prevState.modal !== this.state.modal) {
      this.applyCustomChallengeGizmoMode_();
    }

    if (this.state.simulatorState.type !== prevState.simulatorState.type) {
      const sm = Space.getInstance().sceneBinding?.scriptManager;
      if (!sm) return;
      if (this.state.simulatorState.type === SimulatorState.Type.Running) {
        sm.programStatus = 'running';
      } else if (this.state.simulatorState.type === SimulatorState.Type.Stopped) {
        sm.programStatus = 'stopped';
      }
      // Compiling: keep programStatus from markSimulatorProgramRunning_ / onStarted_.
    }

    if (this.props.params.challengeId !== prevProps.params.challengeId) {
      this.appliedCompletionSceneDiff_ = false;
      this.lastSyncedPropsScene_ = undefined;
      this.workingChallengeScene_ = undefined;
    }

    const latestScene = Async.latestValue(this.props.scene);
    const prevLatestScene = Async.latestValue(prevProps.scene);
    const latestCompletion = Async.latestValue(this.props.challengeCompletion);
    const prevLatestCompletion = Async.latestValue(prevProps.challengeCompletion);

    if (
      latestScene &&
      prevLatestScene &&
      isSelectionOnlySceneUpdate(prevLatestScene, latestScene)
    ) {
      Space.getInstance().applySceneSelection(
        latestScene.selectedNodeId,
        latestScene.selectedScriptId,
      );
      return;
    }

    if (
      latestScene &&
      (!prevLatestScene ||
        scenePropsRequireSimulatorReload(prevLatestScene, latestScene))
    ) {
      this.syncChallengeSceneIntoSimulator_();
      return;
    }

    if (
      latestCompletion !== prevLatestCompletion &&
      latestScene === this.lastSyncedPropsScene_ &&
      this.workingChallengeScene_
    ) {
      this.applyChallengeCompletionDiffToWorkingScene_();
    }
  }

  private applyCustomChallengeGizmoMode_ = () => {
    const inCustomChallengeSetup =
      this.state.modal.type === Modal.Type.CustomChallengeSetup;
    Space.getInstance().gizmosEnabled = inCustomChallengeSetup;
    if (inCustomChallengeSetup && Space.getInstance().sceneBinding) {
      Space.getInstance().sceneBinding.attachSimulatorControls();
    }
  };


  private onWindowResize_ = () => {
    this.setState({ windowInnerHeight: window.innerHeight });
  };

  private lastSaveChallengeCompletionTime_ = 0;
  private saveTimeout_: number | undefined = undefined;

  private saveChallengeCompletion_ = () => {
    this.props.onChallengeCompletionSetRobotLinkOrigins(Space.getInstance().sceneBinding.currentRobotLinkOrigins);
    this.props.onChallengeCompletionSave();

    this.lastSaveChallengeCompletionTime_ = Date.now();
  };

  private scheduleSaveChallengeCompletion_ = () => {
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSaveChallengeCompletionTime_;

    if (timeSinceLastSave < 1000) {
      if (this.saveTimeout_ === undefined) {
        this.saveTimeout_ = window.setTimeout(() => {
          this.saveTimeout_ = undefined;
          this.saveChallengeCompletion_();
        }, 1000 - timeSinceLastSave);
      }
      return;
    }

    if (this.saveTimeout_ !== undefined) {
      window.clearTimeout(this.saveTimeout_);
      this.saveTimeout_ = undefined;
    }

    this.saveChallengeCompletion_();
  };


  private syncChallengeCompletion_ = () => {
    let savedScene = this.clearSceneSelection_(this.workingChallengeScene_);
    // Work around robot moving when reloading
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

  private clearSceneSelection_ = (scene: Scene): Scene => {
    if (!scene.selectedNodeId && !scene.selectedScriptId) return scene;
    return {
      ...scene,
      selectedNodeId: undefined,
      selectedScriptId: undefined,
    };
  };

  private clearTouchGoalStatesOnRunStart_ = () => {
    const { challengeId } = this.props.params;
    if (!isCustomChallengeId(challengeId)) return;

    const state = store.getState();
    const latestChallenge = Async.latestValue(state.challenges[challengeId]);
    const latestChallengeCompletion = Async.latestValue(
      state.challengeCompletions[challengeId]
    );
    if (!latestChallenge || !latestChallengeCompletion) return;

    const successGoals = conditionGoalsFromChallenge(
      latestChallenge.success,
      latestChallenge.successGoals
    );
    const failureGoals = conditionGoalsFromChallenge(
      latestChallenge.failure,
      latestChallenge.failureGoals
    );
    const eventStates = {
      ...latestChallengeCompletion.eventStates,
      ...this.state.liveChallengeEventStates,
    };

    for (const { touched, never } of touchSuccessNeverTouchedPairs(
      successGoals,
      failureGoals
    )) {
      if (eventStates[touched]) {
        this.onSetEventValue_(touched, false);
      }
      if (eventStates[never]) {
        this.onSetEventValue_(never, false);
      }
    }

    for (const { eventId } of stayUprightSuccessGoals(successGoals)) {
      if (eventStates[eventId]) {
        this.onSetEventValue_(eventId, false);
      }
    }
  };

  private applyStayUprightSuccessOnProgramEnd_ = () => {
    const { challengeId } = this.props.params;
    if (!isCustomChallengeId(challengeId)) return;

    const sm = Space.getInstance().sceneBinding?.scriptManager;
    const resolveUpright = sm?.resolveNodeUpright;
    if (!resolveUpright) return;

    const state = store.getState();
    const latestChallenge = Async.latestValue(state.challenges[challengeId]);
    if (!latestChallenge) return;

    const successGoals = conditionGoalsFromChallenge(
      latestChallenge.success,
      latestChallenge.successGoals
    );

    for (const { eventId, nodeId } of stayUprightSuccessGoals(successGoals)) {
      if (!resolveUpright(nodeId)) continue;
      this.onSetEventValue_(eventId, true);
    }
  };

  private applyReamStopNearSuccessOnProgramEnd_ = () => {
    const { challengeId } = this.props.params;
    if (!isCustomChallengeId(challengeId)) return;

    const sm = Space.getInstance().sceneBinding?.scriptManager;
    const resolveDistCm = sm?.resolveReamStopNearDistCm;
    if (!resolveDistCm) return;

    const state = store.getState();
    const latestChallenge = Async.latestValue(state.challenges[challengeId]);
    const latestChallengeCompletion = Async.latestValue(
      state.challengeCompletions[challengeId]
    );
    if (!latestChallenge || !latestChallengeCompletion) return;

    const successGoals = conditionGoalsFromChallenge(
      latestChallenge.success,
      latestChallenge.successGoals
    );
    const eventStates = {
      ...latestChallengeCompletion.eventStates,
      ...this.state.liveChallengeEventStates,
    };

    for (const { eventId, nodeId } of stayReamStopNearSuccessGoals(successGoals)) {
      const touchedId = reamTouchedFailureEventId(nodeId);
      if (eventStates[touchedId] === true) continue;

      const { near } = robotNearReamHorizWorld_(
        resolveDistCm,
        nodeId,
        REAM_STOP_NEAR_DISTANCE_CM
      );
      if (!near) continue;
      this.onSetEventValue_(eventId, true);
    }
  };

  private applyNeverTouchedFailuresOnProgramEnd_ = () => {
    const { challengeId } = this.props.params;
    if (!isCustomChallengeId(challengeId)) return;

    const state = store.getState();
    const latestChallenge = Async.latestValue(state.challenges[challengeId]);
    const latestChallengeCompletion = Async.latestValue(
      state.challengeCompletions[challengeId]
    );
    if (!latestChallenge || !latestChallengeCompletion) return;

    const successGoals = conditionGoalsFromChallenge(
      latestChallenge.success,
      latestChallenge.successGoals
    );
    const failureGoals = conditionGoalsFromChallenge(
      latestChallenge.failure,
      latestChallenge.failureGoals
    );
    const eventStates = {
      ...latestChallengeCompletion.eventStates,
      ...this.state.liveChallengeEventStates,
    };

    const successCompletion =
      this.state.liveSuccessCompletion ?? latestChallengeCompletion.success;
    for (const { touched, never } of touchSuccessNeverTouchedPairs(
      successGoals,
      failureGoals
    )) {
      if (eventStates[touched] === true) continue;
      const touchedOnceId = `${touched}Once`;
      if (successCompletion?.exprStates[touchedOnceId] === true) continue;
      this.onSetEventValue_(never, true);
    }
  };

  private onStopped_ = () => {
    const sm = Space.getInstance().sceneBinding?.scriptManager;
    if (sm) sm.programStatus = 'stopped';

    if (isCustomChallengeId(this.props.params.challengeId)) {
      this.applyStayUprightSuccessOnProgramEnd_();
      this.applyReamStopNearSuccessOnProgramEnd_();
      this.applyNeverTouchedFailuresOnProgramEnd_();
    }

    this.setState({
      simulatorState: SimulatorState.STOPPED
    }, () => {
      if (this.skipNextChallengeCompletionSync_) {
        this.skipNextChallengeCompletionSync_ = false;
        return;
      }
      this.syncChallengeCompletion_();
    });
  };

  private onStarted_ = () => {
    const space = Space.getInstance();
    if (space.sceneBinding) {
      space.sceneBinding.scriptManager.programStatus = 'running';
    }

    this.setState({
      simulatorState: SimulatorState.RUNNING
    }, () => {
      const { challengeId } = this.props.params;
      if (!isCustomChallengeId(challengeId)) return;

      let working = this.workingChallengeScene_;
      if (!working || !space.sceneBinding) return;

      working = refreshCustomChallengeRuntimeScriptOnScene(
        working,
        worldItemsFromScene(working),
        this.playAreaRuntimeRefreshOptions_()
      );

      const sm = space.sceneBinding.scriptManager;
      // Do not reload Babylon on Run — mount/reset already loaded the scene.
      this.setWorkingChallengeScene_(working, false);
      sm.scene = working;
      sm.ensureSceneScripts(working);
      this.reinstantiatePlayAreaRuntime_(working);
      syncCustomChallengePhysicsPosesIntoScriptScene(space.sceneBinding, working);
      this.clearTouchGoalStatesOnRunStart_();
    });
  };

  private onActiveLanguageChange_ = (language: ProgrammingLanguage) => {
    this.props.onChallengeCompletionSetCurrentLanguage(language);

    // Clear compilation messages when switching languages to prevent stale error highlights
    this.setState({ messages: [] });

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

  private onModalClose_ = () => {
    const wasCustomChallengeSetup =
      this.state.modal.type === Modal.Type.CustomChallengeSetup;
    this.setState({ modal: Modal.NONE }, () => {
      if (wasCustomChallengeSetup && this.workingChallengeScene_) {
        this.workingChallengeScene = this.clearSceneSelection_(
          this.workingChallengeScene_
        );
      }
    });
  };

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

  /** Set before WorkerInstance.start so scene scripts can emit events on the first frame. */
  private markSimulatorProgramRunning_ = () => {
    const sm = Space.getInstance().sceneBinding?.scriptManager;
    if (sm) sm.programStatus = 'running';
  };

  private onRunClick_ = () => {
    const { props, state } = this;
    const { locale } = props;
    const { console, theme } = state;

    const language = this.currentLanguage;
    const storedCode = this.code[language];
    const activeCode = storedCode !== undefined ? storedCode : ProgrammingLanguage.DEFAULT_CODE[language];

    switch (this.currentLanguage) {
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
                  text: haveWarnings
                    ? LocalizedString.lookup(tr('Compilation succeeded with warnings\n'), locale)
                    : LocalizedString.lookup(tr('Compilation succeeded\n'), locale),
                  style: STDOUT_STYLE(this.state.theme)
                }));

                this.markSimulatorProgramRunning_();
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

              if (compileSucceeded) {
                flushSync(() => {
                  this.setState({
                    simulatorState: SimulatorState.RUNNING,
                    messages,
                    console: nextConsole,
                  });
                });
                this.markSimulatorProgramRunning_();
                WorkerInstance.start({
                  language: language,
                  code: compileResult.result,
                });
              } else {
                this.setState({
                  simulatorState: SimulatorState.STOPPED,
                  messages,
                  console: nextConsole,
                });
              }
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
        const nextConsole = StyledText.extend(console, StyledText.text({
          text: LocalizedString.lookup(tr('Loading Python...\n'), locale),
          style: STDOUT_STYLE(this.state.theme)
        }));

        flushSync(() => {
          this.setState({
            simulatorState: SimulatorState.RUNNING,
            console: nextConsole,
          });
        });
        this.markSimulatorProgramRunning_();
        WorkerInstance.start({
          language: 'python',
          code: activeCode,
        });
        break;
      }
      case 'graphical': {
        flushSync(() => {
          this.setState({
            simulatorState: SimulatorState.RUNNING,
          });
        });
        this.markSimulatorProgramRunning_();
        WorkerInstance.start({
          language: 'graphical',
          code: activeCode,
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
    const storedCode = this.code[language];
    const code = storedCode !== undefined ? storedCode : ProgrammingLanguage.DEFAULT_CODE[language];

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
    this.syncChallengeSceneIntoSimulator_({ forceRuntimeRebuild: true });
    const space = Space.getInstance();
    if (this.workingChallengeScene_ && space.sceneBinding) {
      space.sceneBinding.scriptManager.ensureSceneScripts(this.workingChallengeScene_);
      this.reinstantiatePlayAreaRuntime_(this.workingChallengeScene_);
    }
    const completion = Async.latestValue(this.props.challengeCompletion);
    this.setState({
      challengeStarted: true,
      liveChallengeEventStates: { ...(completion?.eventStates ?? {}) },
      liveSuccessCompletion: completion?.success,
      liveFailureCompletion: completion?.failure,
    });
  };

  private onEndChallengeClick_ = () => {
    const { challengeId } = this.props.params;
    try {
      const binding = Space.getInstance().sceneBinding;
      binding?.syncMatPlayZoneSurfaceMeshes([]);
      const latestScene = Async.latestValue(this.props.scene);
      if (latestScene) {
        void binding?.ensureJbcMatMeshes(latestScene);
      }
    } catch {
      // simulator may already be torn down during navigation
    }
    window.location.href = `/scene/${challengeId}`;
  };

  private onEditCustomChallengeClick_ = () => {
    const { challengeId } = this.props.params;
    if (!challengeId || !isCustomChallengeId(challengeId)) return;
    const sceneValue = Async.latestValue(this.props.scene);
    if (isClassroomSharedReadOnlyScene(sceneValue)) return;
    this.setState({ modal: Modal.CUSTOM_CHALLENGE_SETUP });
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
    // Dispatch AI action toggle
    this.props.onAiClick();
  };

  private onAskTutorClick_ = () => {
    const workingScene: AsyncScene = this.workingChallengeScene_
      ? Async.loaded({ value: this.workingChallengeScene_ })
      : this.props.scene;

    const tutorCode = this.code[this.currentLanguage];
    this.props.onAskTutorClick({
      content: "Please help me understand what's wrong.",
      code: tutorCode !== undefined ? tutorCode : ProgrammingLanguage.DEFAULT_CODE[this.currentLanguage],
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
      robots
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
    // Get code for current language, falling back to default code if not defined
    // (e.g., graphical may not be defined in challenges that only have C/C++/Python)
    const storedCode = language ? this.code[language] : undefined;
    const code = storedCode !== undefined ? storedCode : ProgrammingLanguage.DEFAULT_CODE[language];

    if (!scene || scene.type === Async.Type.Unloaded || !language || code === undefined) {
      return <Loading />;
    }

    const sceneValue = Async.latestValue(scene);
    const canEditCustomChallenge =
      isCustomChallengeId(challengeId) &&
      !isClassroomSharedReadOnlyScene(sceneValue);

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

    const robot = robots[Dict.unique(Scene.robots(Async.latestValue(workingScene) ?? Scene.EMPTY))?.robotId ?? "demobot"];

    const commonLayoutProps: LayoutProps = {
      theme,
      console,
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
        liveEventStates: state.liveChallengeEventStates,
        liveSuccessCompletion: state.liveSuccessCompletion,
        liveFailureCompletion: state.liveFailureCompletion,
      } : undefined,
      worldCapabilities: WORLD_CAPABILITIES,
      onDocumentationGoToFuzzy,
      onProjectAdd: function (): void {
        throw new Error('Function not implemented.');
      },
      onSimFileSelected: function (project: Project, fileName: string, fileType: string): void {
        throw new Error('Function not implemented.');
      },
      onSimProjectSelected: function (project: Project): void {
        throw new Error('Function not implemented.');
      },
      onAddNewSimFile: function (project: Project, fileType: string): void {
        throw new Error('Function not implemented.');
      },
      onDeleteSimProject: function (project: Project): void {
        throw new Error('Function not implemented.');
      }
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

    const latestScene = Async.latestValue(
      this.workingChallengeScene_
        ? Async.loaded({ value: this.workingChallengeScene_ })
        : scene
    );

    return (
      <>
        {modal.type !== Modal.Type.CustomChallengeSetup && (
          <MatPlayZonesSceneOverlay
            theme={theme}
            locale={props.locale}
            scene={latestScene ?? undefined}
          />
        )}
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
            onEditCustomChallengeClick={
              canEditCustomChallenge ? this.onEditCustomChallengeClick_ : undefined
            }
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
        {modal.type === Modal.Type.CustomChallengeSetup && (
          <CustomChallengeSetupDialog
            theme={theme}
            onClose={this.onModalClose_}
            editingChallengeId={challengeId && isCustomChallengeId(challengeId) ? challengeId : undefined}
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
          console={StyledText.toString(console)}
          robot={robot}
        />
      </>
    );
  }
}

const ConnectedChallengeRoot = connect((state: ReduxState, { params: { challengeId } }: RootPublicProps) => {
  const builder = new Builder(state);

  const challenge = builder.challenge(challengeId);
  challenge.scene();
  challenge.completion();

  builder.dispatchLoads();

  return {
    scene: Dict.unique(builder.scenes),
    challenge: Dict.unique(builder.challenges),
    challengeCompletion: Dict.unique(builder.challengeCompletions),
    locale: state.i18n.locale,
    robots: Dict.map(state.robots.robots, Async.latestValue),
  };
}, (dispatch, { params: { challengeId } }: RootPublicProps) => ({
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
  onSoftResetScene: () => {
    dispatch(ScenesAction.softResetScene({ sceneId: challengeId }));
  },
  onChallengeCompletionSetCode: (language: ProgrammingLanguage, code: string) => {
    dispatch(ChallengeCompletionsAction.setCode({ challengeId, language, code }));
  },
  onChallengeCompletionSetCurrentLanguage: (language: ProgrammingLanguage) => {
    dispatch(ChallengeCompletionsAction.setCurrentLanguage({ challengeId, language }));
  },
  onChallengeCompletionSetRobotLinkOrigins: (robotLinkOrigins: Dict<Dict<ReferenceFramewUnits>>) => {
    dispatch(ChallengeCompletionsAction.setRobotLinkOrigins({ challengeId, robotLinkOrigins }));
  },
  onChallengeCompletionSave: () => {
    dispatch(ChallengeCompletionsAction.saveChallengeCompletion({ challengeId }));
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
}))(withNavigate(Root)) as React.ComponentType<RootPublicProps>;

export default withParams<ChallengeRootRouteParams>()(ConnectedChallengeRoot);

export { RootState };
