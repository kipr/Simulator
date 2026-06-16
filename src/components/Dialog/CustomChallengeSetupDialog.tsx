import * as React from 'react';
import { connect } from 'react-redux';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { ThemeProps } from '../constants/theme';
import { State as ReduxState } from '../../state';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { FontAwesome } from '../FontAwesome';
import { faCheck, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Input from '../interface/Input';
import TextArea from '../interface/TextArea';
import Field from '../interface/Field';
import Scene, { AsyncScene } from '../../state/State/Scene';
import Challenge, { AsyncChallenge, ChallengeBrief } from '../../state/State/Challenge';
import Async from '../../state/State/Async';
import Dict from '../../util/objectOps/Dict';
import Event from '../../state/State/Challenge/Event';
import Author from '../../db/Author';
import { auth } from '../../firebase/firebase';
import { ChallengeCompletionsAction, ChallengesAction, ScenesAction } from '../../state/reducer';
import MatPlayZonesSidePanel from '../CustomChallenges/MatPlayZonesSidePanel';
import MatZoneEditOverlay from '../CustomChallenges/MatZoneEditOverlay';
import CustomChallengeRulesSidePanel from '../CustomChallenges/CustomChallengeRulesSidePanel';
import { Distance } from '../../util';
import {
  applyCustomChallengeMatPlacementToScene,
  applySandboxMatPlacementToScene,
  JbcCatalogGeometry,
  JBC_CATALOG_EVENTS,
  JBC_CATALOG_SUCCESS_GOALS,
  JbcCatalogSuccessGoal,
  worldItemsFromScene,
} from '../../util/jbcChallengeCatalog';
import { ItemPickerEntry } from '../CustomChallenges/JbcCatalogItemPicker';
import {
  buildFailureGoals,
  buildFailurePredicate,
  buildSuccessGoals,
  buildSuccessPredicate,
  conditionGoalsFromChallenge,
  ConditionGoalInput,
  mergeConditionGoals,
} from '../../util/customChallengePredicates';
import {
  createCustomChallengeTemplate,
  defaultCustomChallengeDescription,
  defaultCustomChallengeName,
  newCustomChallengeId,
} from '../../util/customChallengeFactory';
import { sceneWithCustomChallenge } from '../../util/customChallengeStorage';
import { withNavigate, WithNavigateProps } from '../../util/withNavigate';
import { JBC_SANDBOX_SCENE_ID } from '../constants/defaultScene';
import {
  allZoneSuccessGoals,
  applyMatPlayZonesToScene,
  defaultPlayZones,
  MatPlayAreaShape,
  MatPlacementSelection,
  MatPlayZone,
  matPlacementFromScene,
  matPlayZonesFromScene,
  newPlayZone,
  rebindSimulatorControls,
  syncMatPlayZoneSurfaceMeshes,
} from '../../util/jbcMatPlayArea';
import { isPlayAreaSuccessEventId, playZonesForRuntimeScript } from '../../util/playAreaSuccessGoals';
import { setMatZoneEditSession } from '../../util/matZoneEditSession';
import {
  buildOppositeFailureGoals,
  friendlyFailureGoals,
  mergeEventsForConditionGoals,
  pruneEventsToConditionGoals,
} from '../../util/customChallengeGoals';
import {
  buildItemSuccessWizardSteps,
  conditionGoalsFromItemWizardChoices,
  goalBelongsToWizardStep,
  inferItemSuccessChoicesFromGoals,
  ItemSuccessOutcomeId,
  ItemSuccessWizardStep,
  possibleOppositeFailureEventIdsForWizardStep,
  pruneConditionGoalsForRemovedPlacement,
  stripItemWizardSuccessGoals,
} from '../../util/jbcChallengeSuggestions';
import {
  applyCustomChallengeRuntimeScriptToScene,
  forceCustomChallengeRuntimeScriptOnScene,
  reinstantiateCustomChallengeRuntimeScript,
} from '../../util/customChallengeSceneScripts';
import { saveCustomChallengeTourSandboxHandoff } from '../../util/customChallengeStorage';
import ChallengeCompletion, {
  AsyncChallengeCompletion,
} from '../../state/State/ChallengeCompletion';
import { Space } from '../../simulator/Space';
import { sprintf } from 'sprintf-js';
import { ReferenceFramewUnits, RotationwUnits } from '../../util/math/unitMath';
import { TourRegistry } from '../../tours/TourRegistry';
import TourTarget from '../Tours/TourTarget';

export interface CustomChallengeSetupDialogPublicProps extends ThemeProps {
  onClose: () => void;
  editingChallengeId?: string;
  tourRegistry?: TourRegistry;
  continueTour?: () => void;
}

interface CustomChallengeSetupDialogPrivateProps {
  locale: LocalizedString.Language;
  sandboxScene: Scene | null;
  editingSceneAsync: AsyncScene | null;
  editingScene: Scene | null;
  editingChallengeAsync: AsyncChallenge | null;
  editingChallenge: Challenge | null;
  editingChallengeCompletionAsync: AsyncChallengeCompletion | null;
}

type Props = CustomChallengeSetupDialogPublicProps &
CustomChallengeSetupDialogPrivateProps &
WithNavigateProps & {
  dispatch: (action: unknown) => void;
};

enum Step {
  Details = 0,
  DefineArea = 1,
  Success = 2,
  Failure = 3,
  Review = 4,
}

const STEP_COUNT = 5;

const SANDBOX_WIZARD_STEPS: Step[] = [
  Step.DefineArea,
  Step.Success,
  Step.Failure,
  Step.Review,
];

interface WizardState {
  step: Step;
  name: string;
  description: string;
  events: Dict<Event>;
  playZones: MatPlayZone[];
  activeZoneId: string;
  selectedWorldItemKeys: string[];
  selectedGeometryKeys: string[];
  successGoals: ConditionGoalInput[];
  failureGoals: ConditionGoalInput[];
  /** Auto-generated opposites the author removed on the failure step. */
  removedFailureEventIds: string[];
  itemSuccessChoices: Record<string, ItemSuccessOutcomeId>;
}

interface EditSessionSnapshot {
  challengeId: string;
  sceneAsync: AsyncScene;
  challengeAsync: AsyncChallenge;
  challengeCompletionAsync?: AsyncChallengeCompletion;
}

function cloneJson_<T>(value: T): T {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function uniqueBy_<T, K>(values: T[], keyOf: (value: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const value of values) {
    const key = keyOf(value);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

const StepIndicator = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  opacity: 0.85,
  fontSize: '0.9em',
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const Body = styled('div', (props: ThemeProps) => ({
  minHeight: '360px',
  maxHeight: '70vh',
  color: props.theme.color,
}));

const NavBar = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: `${props.theme.itemPadding}px`,
  borderTop: `1px solid ${props.theme.borderColor}`,
}));

const NavButton = styled('button', (props: ThemeProps & { $primary?: boolean }) => ({
  padding: '10px 16px',
  margin: `${props.theme.itemPadding}px`,
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  backgroundColor: props.$primary ? '#4caf50' : 'rgba(255,255,255,0.12)',
  color: props.theme.color,
  ':disabled': {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
}));

class CustomChallengeSetupDialog extends React.PureComponent<Props, WizardState> {
  private initializedForEditId_: string | null = null;
  private editSessionSnapshot_: EditSessionSnapshot | null = null;
  private restoredOnCancel_ = false;

  constructor(props: Props) {
    super(props);
    this.state = this.initialStateFromProps_(props);
  }

  componentWillUnmount() {
    this.clearWizardVisualState_({
      syncRuntimePlacement: !this.restoredOnCancel_,
    });
  }

  private clearWizardVisualState_ = (
    options: { syncRuntimePlacement?: boolean } = {}
  ) => {
    if (options.syncRuntimePlacement !== false) {
      this.syncEditingMatPlacementRuntime_();
    }
    setMatZoneEditSession(null);
    syncMatPlayZoneSurfaceMeshes([]);
    Space.getInstance().clearHighlights();
  };

  private closeWithoutRevert_ = () => {
    this.clearWizardVisualState_();
    this.props.onClose();
  };

  private captureEditingSnapshot_(props: Props): void {
    const {
      editingChallengeId,
      editingSceneAsync,
      editingChallengeAsync,
      editingChallengeCompletionAsync,
    } = props;

    if (!editingChallengeId || !editingSceneAsync || !editingChallengeAsync) {
      this.editSessionSnapshot_ = null;
      this.restoredOnCancel_ = false;
      return;
    }

    if (this.editSessionSnapshot_?.challengeId === editingChallengeId) return;

    this.editSessionSnapshot_ = {
      challengeId: editingChallengeId,
      sceneAsync: cloneJson_(editingSceneAsync),
      challengeAsync: cloneJson_(editingChallengeAsync),
      challengeCompletionAsync: editingChallengeCompletionAsync
        ? cloneJson_(editingChallengeCompletionAsync)
        : undefined,
    };
    this.restoredOnCancel_ = false;
  }

  private restoreEditingSnapshot_ = () => {
    const snapshot = this.editSessionSnapshot_;
    if (!snapshot) return;

    const sceneAsync = cloneJson_(snapshot.sceneAsync);
    const challengeAsync = cloneJson_(snapshot.challengeAsync);
    this.props.dispatch(
      ScenesAction.setSceneInternal({
        sceneId: snapshot.challengeId,
        scene: sceneAsync,
      })
    );
    this.props.dispatch(
      ChallengesAction.setChallengeInternal({
        challengeId: snapshot.challengeId,
        challenge: challengeAsync,
      })
    );
    if (snapshot.challengeCompletionAsync !== undefined) {
      this.props.dispatch(
        ChallengeCompletionsAction.setChallengeCompletionInternal({
          challengeId: snapshot.challengeId,
          challengeCompletion: cloneJson_(snapshot.challengeCompletionAsync),
        })
      );
    }

    const restoredScene = Async.latestValue(sceneAsync);
    if (!restoredScene) return;

    Space.getInstance().scene = restoredScene;
    const binding = Space.getInstance().sceneBinding;
    if (binding) {
      reinstantiateCustomChallengeRuntimeScript(binding.scriptManager, restoredScene);
    }
  };

  private onCancel_ = () => {
    if (this.props.editingChallengeId) {
      this.restoredOnCancel_ = true;
      this.restoreEditingSnapshot_();
      this.clearWizardVisualState_({ syncRuntimePlacement: false });
      this.props.onClose();
      return;
    }

    this.closeWithoutRevert_();
  };

  private initialStateFromProps_(props: Props): WizardState {
    if (!props.editingChallengeId || !props.editingScene || !props.editingChallenge) {
      this.editSessionSnapshot_ = null;
      this.restoredOnCancel_ = false;
      const playZones = defaultPlayZones();
      return {
        step: Step.Details,
        name: LocalizedString.lookup(defaultCustomChallengeName(), LocalizedString.EN_US),
        description: LocalizedString.lookup(
          defaultCustomChallengeDescription(),
          LocalizedString.EN_US
        ),
        events: {},
        playZones,
        activeZoneId: '',
        selectedWorldItemKeys: [],
        selectedGeometryKeys: [],
        successGoals: [],
        failureGoals: [],
        removedFailureEventIds: [],
        itemSuccessChoices: {},
      };
    }

    const { editingScene, editingChallenge } = props;
    this.captureEditingSnapshot_(props);
    const placement = matPlacementFromScene(editingScene);
    const placementKeys = new Set([
      ...placement.worldItemKeys,
      ...placement.geometryKeys,
    ]);
    const worldItems = worldItemsFromScene(editingScene);
    const playZones = uniqueBy_(matPlayZonesFromScene(editingScene), z => z.id);
    const allSuccessGoals = conditionGoalsFromChallenge(
      editingChallenge.success,
      editingChallenge.successGoals
    );
    const successGoals = allSuccessGoals.filter(goal => {
      if (isPlayAreaSuccessEventId(goal.eventId)) return true;
      const itemSteps = buildItemSuccessWizardSteps(
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems
      );
      const step = itemSteps.find(s => goalBelongsToWizardStep(goal, s));
      if (!step) return true;
      return placementKeys.has(step.id);
    });
    const failureGoals = friendlyFailureGoals(
      conditionGoalsFromChallenge(
        editingChallenge.failure,
        editingChallenge.failureGoals
      )
    );
    let itemSuccessChoices: Record<string, ItemSuccessOutcomeId> = {};
    for (const [key, outcome] of Object.entries(
      editingScene.customChallengeItemSuccessChoices ?? {}
    )) {
      if (placementKeys.has(key)) {
        itemSuccessChoices[key] = outcome as ItemSuccessOutcomeId;
      }
    }
    if (Object.keys(itemSuccessChoices).length === 0 && successGoals.length > 0) {
      itemSuccessChoices = inferItemSuccessChoicesFromGoals(
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems,
        successGoals
      );
    }
    const successGoalsWithoutWizard = stripItemWizardSuccessGoals(
      successGoals,
      placement.worldItemKeys,
      placement.geometryKeys,
      worldItems
    );
    this.initializedForEditId_ = props.editingChallengeId;
    return {
      step: Step.Details,
      name: LocalizedString.lookup(editingChallenge.name, LocalizedString.EN_US),
      description: LocalizedString.lookup(
        editingChallenge.description,
        LocalizedString.EN_US
      ),
      events: { ...(editingChallenge.events ?? {}) },
      playZones,
      activeZoneId: playZones[0]?.id ?? '',
      selectedWorldItemKeys: Array.from(new Set(placement.worldItemKeys)),
      selectedGeometryKeys: Array.from(new Set(placement.geometryKeys)),
      successGoals: successGoalsWithoutWizard,
      failureGoals,
      removedFailureEventIds: [],
      itemSuccessChoices,
    };
  }


  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<WizardState>): void {
    if (
      this.props.editingChallengeId &&
      this.props.editingChallengeId !== this.initializedForEditId_ &&
      this.props.editingScene &&
      this.props.editingChallenge
    ) {
      this.setState(this.initialStateFromProps_(this.props));
      return;
    }

    const enteredSandbox =
      SANDBOX_WIZARD_STEPS.includes(this.state.step) &&
      !SANDBOX_WIZARD_STEPS.includes(prevState.step);
    const leftSandbox =
      SANDBOX_WIZARD_STEPS.includes(prevState.step) &&
      !SANDBOX_WIZARD_STEPS.includes(this.state.step);

    if (enteredSandbox) {
      this.ensureSandboxScene_();
      rebindSimulatorControls();
    }
    if (leftSandbox) {
      this.hideAllSandboxWorldItems_();
    }
    if (this.state.step === Step.DefineArea && prevState.step !== Step.DefineArea) {
      rebindSimulatorControls();
      this.syncEditingMatPlacementPreview_();
      this.syncSandboxMatPlacement_();
    } else if (prevState.step === Step.DefineArea && this.state.step !== Step.DefineArea) {
      rebindSimulatorControls();
    } else if (
      (this.state.step === Step.Success ||
        this.state.step === Step.Failure ||
        this.state.step === Step.Review) &&
      prevState.step !== this.state.step
    ) {
      this.showAllSandboxSelection_();
    }
    if (
      this.state.step === Step.DefineArea &&
      (prevState.selectedWorldItemKeys !== this.state.selectedWorldItemKeys ||
        prevState.selectedGeometryKeys !== this.state.selectedGeometryKeys)
    ) {
      this.syncSandboxMatPlacement_();
    }
  }

  private matPlacement_ = (): MatPlacementSelection => ({
    worldItemKeys: Array.from(new Set(this.state.selectedWorldItemKeys)),
    geometryKeys: Array.from(new Set(this.state.selectedGeometryKeys)),
  });

  private sourceSceneForWizard_ = (): Scene | null => (
    this.props.editingChallengeId
      ? this.props.editingScene
      : this.props.sandboxScene
  );

  private showAllSandboxSelection_ = () => {
    if (this.props.editingChallengeId) return;
    this.syncSandboxMatPlacement_();
  };

  private syncSandboxMatPlacement_ = () => {
    if (this.props.editingChallengeId) return;
    const { sandboxScene, dispatch } = this.props;
    if (!sandboxScene) return;

    const scene = applySandboxMatPlacementToScene(sandboxScene, this.matPlacement_());
    dispatch(ScenesAction.setScene({ sceneId: JBC_SANDBOX_SCENE_ID, scene }));
  };

  private syncEditingMatPlacementPreview_ = () => {
    this.syncEditingMatPlacement_(true);
  };

  private syncEditingMatPlacementRuntime_ = () => {
    this.syncEditingMatPlacement_(false);
  };

  private syncEditingMatPlacement_ = (authoringPreview: boolean) => {
    const sceneId = this.props.editingChallengeId;
    if (!sceneId) return;

    const spaceScene = Space.getInstance().scene;
    const sourceScene =
      spaceScene && spaceScene !== Scene.EMPTY ? spaceScene : this.props.editingScene;
    if (!sourceScene) return;

    const scene = applyCustomChallengeMatPlacementToScene(
      sourceScene,
      this.matPlacement_(),
      { authoringPreview }
    );
    this.props.dispatch(ScenesAction.setScene({ sceneId, scene }));
    Space.getInstance().scene = scene;
  };

  private hideAllSandboxWorldItems_ = () => {
    if (this.props.editingChallengeId) return;
    const { sandboxScene, dispatch } = this.props;
    if (!sandboxScene) return;

    const scene = applySandboxMatPlacementToScene(sandboxScene, {
      worldItemKeys: [],
      geometryKeys: [],
    });
    dispatch(ScenesAction.setScene({ sceneId: JBC_SANDBOX_SCENE_ID, scene }));
  };

  private sourceSceneForPaperReamAdd_ = (): Scene | null => {
    if (!this.props.editingChallengeId) return this.props.sandboxScene;
    const spaceScene = Space.getInstance().scene;
    return spaceScene && spaceScene !== Scene.EMPTY
      ? spaceScene
      : this.props.editingScene;
  };

  private nextPaperReamIndex_ = (scene: Scene): number => {
    let max = 0;
    for (const nodeId of Object.keys(scene.nodes)) {
      const match = /^ream(\d+)$/i.exec(nodeId);
      if (!match) continue;
      max = Math.max(max, Number(match[1]));
    }
    return max + 1;
  };

  private createPaperReamNode_ = (
    index: number
  ): Node => {
    const row = Math.floor((index - 1) / 2);
    const col = (index - 1) % 2;
    const origin: ReferenceFramewUnits = {
      position: {
        x: Distance.centimeters(col === 0 ? -18 : 18),
        y: Distance.centimeters(5),
        z: Distance.centimeters(67.5 - row * 20),
      },
      orientation: RotationwUnits.eulerDegrees(90, 0, 0),
    };

    return {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: Dict.map(tr('Paper Ream %s'), (str: string) => sprintf(str, index)),
      startingOrigin: origin,
      origin,
      editable: true,
      visible: true,
    };
  };

  private onAddPaperReam_ = () => {
    const sourceScene = this.sourceSceneForPaperReamAdd_();
    if (!sourceScene) return;

    const index = this.nextPaperReamIndex_(sourceScene);
    const nodeId = `ream${index}`;
    const node: Node = this.createPaperReamNode_(index);
    const nodes: Dict<Node> = {
      ...sourceScene.nodes,
      [nodeId]: node,
    };

    const selectedWorldItemKeys = Array.from(
      new Set([...this.state.selectedWorldItemKeys, nodeId])
    );
    const scene = applySandboxMatPlacementToScene(
      {
        ...sourceScene,
        nodes,
      },
      {
        worldItemKeys: selectedWorldItemKeys,
        geometryKeys: this.state.selectedGeometryKeys,
      }
    );
    const sceneId = this.props.editingChallengeId ?? JBC_SANDBOX_SCENE_ID;

    this.props.dispatch(ScenesAction.setScene({ sceneId, scene }));
    Space.getInstance().scene = scene;
    rebindSimulatorControls();
    this.setState({ selectedWorldItemKeys });
  };

  private onWorldItemToggle_ = (entry: ItemPickerEntry, selected: boolean) => {
    const keys = new Set(this.state.selectedWorldItemKeys);
    const itemKeys = 'itemKeys' in entry ? entry.itemKeys : [entry.key];
    for (const key of itemKeys) {
      if (selected) keys.add(key);
      else keys.delete(key);
    }
    this.syncWizardGoalsAndEvents_({
      selectedWorldItemKeys: Array.from(keys),
    });
  };

  private onGeometryToggle_ = (entry: JbcCatalogGeometry, selected: boolean) => {
    const keys = new Set(this.state.selectedGeometryKeys);
    if (selected) keys.add(entry.key);
    else keys.delete(entry.key);
    this.syncWizardGoalsAndEvents_({
      selectedGeometryKeys: Array.from(keys),
    });
  };

  private onZoneShapeChange_ = (zoneId: string, shape: MatPlayAreaShape) => {
    this.setState(prev => ({
      playZones: prev.playZones.map(z =>
        (z.id === zoneId
          ? {
            ...z,
            shape: {
              edgeMode: shape.edgeMode,
              points: shape.points.map(p => ({ ...p })),
            },
          }
          : z)
      ),
    }));
  };

  private ensureSandboxScene_ = () => {
    if (this.props.editingChallengeId) return;
    const target = `/scene/${JBC_SANDBOX_SCENE_ID}`;
    if (!window.location.pathname.endsWith(target)) {
      this.props.navigate(target);
    }
  };

  private stepTitle_ = (): string => {
    const { locale } = this.props;
    switch (this.state.step) {
      case Step.Details:
        return LocalizedString.lookup(tr('Details'), locale);
      case Step.DefineArea:
        return LocalizedString.lookup(tr('Mat setup'), locale);
      case Step.Success:
        return LocalizedString.lookup(tr('Success'), locale);
      case Step.Failure:
        return LocalizedString.lookup(tr('Failure'), locale);
      case Step.Review:
        return LocalizedString.lookup(tr('Review'), locale);
      default:
        return '';
    }
  };

  private mergedSuccessGoalsForState_ = (state: WizardState): ConditionGoalInput[] => {
    const sourceScene = this.sourceSceneForWizard_();
    const worldItems = sourceScene ? worldItemsFromScene(sourceScene) : [];
    const placement: MatPlacementSelection = {
      worldItemKeys: state.selectedWorldItemKeys,
      geometryKeys: state.selectedGeometryKeys,
    };
    return mergeConditionGoals([
      ...allZoneSuccessGoals(state.playZones),
      ...conditionGoalsFromItemWizardChoices(
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems,
        state.itemSuccessChoices
      ),
      ...stripItemWizardSuccessGoals(
        state.successGoals,
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems
      ),
    ]);
  };

  private mergedSuccessGoals_ = (): ConditionGoalInput[] =>
    this.mergedSuccessGoalsForState_(this.state);

  private nextRemovedFailureEventIds_ = (
    prev: WizardState,
    next: WizardState
  ): string[] => {
    const autoIds = new Set(
      buildOppositeFailureGoals(this.mergedSuccessGoalsForState_(next)).map(g => g.eventId)
    );
    const removed = new Set(prev.removedFailureEventIds);
    for (const goal of prev.failureGoals) {
      if (
        !next.failureGoals.some(g => g.eventId === goal.eventId) &&
        autoIds.has(goal.eventId)
      ) {
        removed.add(goal.eventId);
      }
    }
    for (const goal of next.failureGoals) {
      if (autoIds.has(goal.eventId)) {
        removed.delete(goal.eventId);
      }
    }
    return Array.from(removed);
  };

  private failureGoalsEnteringFailureStep_ = (
    prev: WizardState,
    mergedSuccessGoals: ConditionGoalInput[]
  ): ConditionGoalInput[] => {
    const autoOpposites = buildOppositeFailureGoals(mergedSuccessGoals);
    const removed = new Set(prev.removedFailureEventIds);
    const autoIds = new Set(autoOpposites.map(g => g.eventId));
    const failureGoals = prev.failureGoals.filter(goal => {
      if (!autoIds.has(goal.eventId)) return true;
      return !removed.has(goal.eventId);
    });
    for (const opposite of autoOpposites) {
      if (removed.has(opposite.eventId)) continue;
      if (!failureGoals.some(g => g.eventId === opposite.eventId)) {
        failureGoals.push(opposite);
      }
    }
    return friendlyFailureGoals(mergeConditionGoals(failureGoals));
  };

  private referencedGoalsForWizardState_ = (state: WizardState): ConditionGoalInput[] => {
    const sourceScene = this.sourceSceneForWizard_();
    const worldItems = sourceScene ? worldItemsFromScene(sourceScene) : [];
    const placement: MatPlacementSelection = {
      worldItemKeys: state.selectedWorldItemKeys,
      geometryKeys: state.selectedGeometryKeys,
    };
    const goals = mergeConditionGoals([
      ...allZoneSuccessGoals(state.playZones),
      ...conditionGoalsFromItemWizardChoices(
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems,
        state.itemSuccessChoices
      ),
      ...stripItemWizardSuccessGoals(
        state.successGoals,
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems
      ),
    ]);
    if (state.step >= Step.Failure) {
      goals.push(...state.failureGoals);
    }
    return mergeConditionGoals(goals);
  };

  private patchAfterItemSuccessChoicesChange_ = (
    prev: WizardState,
    next: WizardState
  ): Pick<WizardState, 'successGoals' | 'failureGoals' | 'removedFailureEventIds'> => {
    const sourceScene = this.sourceSceneForWizard_();
    const worldItems = sourceScene ? worldItemsFromScene(sourceScene) : [];
    const placement: MatPlacementSelection = {
      worldItemKeys: next.selectedWorldItemKeys,
      geometryKeys: next.selectedGeometryKeys,
    };
    const steps = buildItemSuccessWizardSteps(
      placement.worldItemKeys,
      placement.geometryKeys,
      worldItems
    );
    const successGoals = stripItemWizardSuccessGoals(
      next.successGoals,
      placement.worldItemKeys,
      placement.geometryKeys,
      worldItems
    );
    let failureGoals = next.failureGoals;
    let removedFailureEventIds = [...next.removedFailureEventIds];
    for (const step of steps) {
      if (prev.itemSuccessChoices[step.id] === next.itemSuccessChoices[step.id]) {
        continue;
      }
      const staleFailureIds = possibleOppositeFailureEventIdsForWizardStep(step);
      failureGoals = failureGoals.filter(goal => !staleFailureIds.has(goal.eventId));
      removedFailureEventIds = removedFailureEventIds.filter(
        id => !staleFailureIds.has(id)
      );
    }
    return { successGoals, failureGoals, removedFailureEventIds };
  };

  private patchAfterPlacementChange_ = (
    prev: WizardState,
    next: WizardState
  ): Pick<
  WizardState,
  'successGoals' | 'failureGoals' | 'itemSuccessChoices' | 'removedFailureEventIds'
  > => {
    const sourceScene = this.sourceSceneForWizard_();
    const worldItems = sourceScene ? worldItemsFromScene(sourceScene) : [];
    const prevPlacement: MatPlacementSelection = {
      worldItemKeys: prev.selectedWorldItemKeys,
      geometryKeys: prev.selectedGeometryKeys,
    };
    const nextPlacement: MatPlacementSelection = {
      worldItemKeys: next.selectedWorldItemKeys,
      geometryKeys: next.selectedGeometryKeys,
    };
    const pruned = pruneConditionGoalsForRemovedPlacement(
      prevPlacement,
      nextPlacement,
      next.successGoals,
      next.failureGoals,
      next.itemSuccessChoices,
      worldItems
    );
    return {
      successGoals: pruned.successGoals,
      failureGoals: friendlyFailureGoals(pruned.failureGoals),
      itemSuccessChoices: pruned.itemSuccessChoices,
      removedFailureEventIds: next.removedFailureEventIds,
    };
  };

  private syncWizardGoalsAndEvents_ = (patch: Partial<WizardState>) => {
    const prev = this.state;
    let next: WizardState = { ...prev, ...patch };
    if (
      patch.selectedWorldItemKeys !== undefined ||
      patch.selectedGeometryKeys !== undefined
    ) {
      Object.assign(next, this.patchAfterPlacementChange_(prev, next));
    }
    if (patch.itemSuccessChoices !== undefined) {
      Object.assign(next, this.patchAfterItemSuccessChoicesChange_(prev, next));
    }
    if (patch.failureGoals !== undefined) {
      next.failureGoals = friendlyFailureGoals(next.failureGoals);
      next.removedFailureEventIds = this.nextRemovedFailureEventIds_(prev, next);
    }
    next = {
      ...next,
      events: pruneEventsToConditionGoals(
        prev.events,
        this.referencedGoalsForWizardState_(next)
      ),
    };
    this.setState(next);
    if (this.props.editingChallengeId) {
      this.syncEditingChallengeLive_(next);
    }
  };

  private syncEditingChallengeLive_ = (state: WizardState) => {
    const challengeId = this.props.editingChallengeId;
    const editingChallenge = this.props.editingChallenge;
    if (!challengeId || !editingChallenge) return;

    const mergedSuccessGoals = this.mergedSuccessGoalsForState_(state);
    const success = buildSuccessPredicate(mergedSuccessGoals);
    const failure = buildFailurePredicate(state.failureGoals);
    const events = pruneEventsToConditionGoals(state.events, [
      ...mergedSuccessGoals,
      ...state.failureGoals,
    ]);
    const { dispatch } = this.props;

    for (const eventId of Object.keys(editingChallenge.events)) {
      if (!(eventId in events)) {
        dispatch(ChallengesAction.removeEvent({ challengeId, eventId }));
        dispatch(ChallengeCompletionsAction.removeEventState({ challengeId, eventId }));
      }
    }
    for (const [eventId, event] of Object.entries(events)) {
      dispatch(ChallengesAction.setEvent({ challengeId, eventId, event }));
    }
    dispatch(
      ChallengesAction.applyChallengeConditions({
        challengeId,
        success,
        failure,
        successGoals: success ? buildSuccessGoals(mergedSuccessGoals) : undefined,
        failureGoals: failure ? buildFailureGoals(state.failureGoals) : undefined,
      })
    );
    dispatch(
      ChallengeCompletionsAction.setFailurePredicateCompletion({
        challengeId,
        failure: undefined,
      })
    );

    const sourceScene = this.props.editingScene ?? Space.getInstance().scene;
    if (!sourceScene) return;

    const playAreaGoals = mergedSuccessGoals.filter(g => isPlayAreaSuccessEventId(g.eventId));
    const playZonesForRuntime = playZonesForRuntimeScript(
      state.playZones,
      playAreaGoals
    );
    const placement: MatPlacementSelection = {
      worldItemKeys: state.selectedWorldItemKeys,
      geometryKeys: state.selectedGeometryKeys,
    };
    let scene = JSON.parse(JSON.stringify(sourceScene)) as Scene;
    scene = applyCustomChallengeMatPlacementToScene(scene, placement, {
      authoringPreview: true,
    });
    scene = applyMatPlayZonesToScene(scene, playZonesForRuntime, placement);
    scene.customChallengeItemSuccessChoices = { ...state.itemSuccessChoices };
    scene = forceCustomChallengeRuntimeScriptOnScene(
      scene,
      worldItemsFromScene(sourceScene),
      {
        playAreaChallengeGoals: playAreaGoals,
        challengeSuccessGoals: mergedSuccessGoals,
        challengeFailureGoals: state.failureGoals,
        successPredicate: success,
        failurePredicate: failure,
        authoringPreview: true,
      }
    );
    dispatch(ScenesAction.setScene({ sceneId: challengeId, scene }));
    const spaceScene = Space.getInstance().scene;
    if (spaceScene && spaceScene !== Scene.EMPTY) {
      Space.getInstance().scene = scene;
      const binding = Space.getInstance().sceneBinding;
      if (binding) {
        reinstantiateCustomChallengeRuntimeScript(binding.scriptManager, scene);
      }
    }
  };

  private onBack_ = () => {
    this.setState({ step: Math.max(Step.Details, this.state.step - 1) as Step });
  };

  private continueTourAfterStepChange_ = () => {
    this.props.continueTour?.();
  };

  private onNext_ = () => {
    if (this.state.step === Step.Review) {
      void this.onFinish_();
      return;
    }
    if (this.state.step === Step.Success) {
      const mergedSuccessGoals = this.mergedSuccessGoals_();
      this.setState(prev => {
        const failureGoals = this.failureGoalsEnteringFailureStep_(
          prev,
          mergedSuccessGoals
        );
        return {
          step: Step.Failure,
          successGoals: mergedSuccessGoals,
          failureGoals,
          events: pruneEventsToConditionGoals(prev.events, [
            ...mergedSuccessGoals,
            ...failureGoals,
          ]),
        };
      }, this.continueTourAfterStepChange_);
      return;
    }
    if (this.state.step === Step.Failure) {
      const mergedSuccessGoals = this.mergedSuccessGoals_();
      this.setState(prev => ({
        step: Step.Review,
        successGoals: mergedSuccessGoals,
        events: pruneEventsToConditionGoals(prev.events, [
          ...mergedSuccessGoals,
          ...prev.failureGoals,
        ]),
      }), this.continueTourAfterStepChange_);
      return;
    }
    this.setState({ step: (this.state.step + 1) as Step }, this.continueTourAfterStepChange_);
  };


  private onAddPlayZone_ = () => {
    this.setState(prev => {
      const zone = newPlayZone(prev.playZones.length);
      return {
        playZones: [...prev.playZones, zone],
        activeZoneId: zone.id,
      };
    });
  };

  private onDeletePlayZone_ = (zoneId: string) => {
    const playZones = this.state.playZones.filter(z => z.id !== zoneId);
    const activeZoneId =
      this.state.activeZoneId === zoneId ? (playZones[0]?.id ?? '') : this.state.activeZoneId;
    this.syncWizardGoalsAndEvents_({ playZones, activeZoneId });
  };

  private onCatalogSuccessGoalToggle_ = (entry: JbcCatalogSuccessGoal, selected: boolean) => {
    if (!selected) {
      this.syncWizardGoalsAndEvents_({
        successGoals: this.state.successGoals.filter(
          g =>
            !(
              g.eventId === entry.eventId &&
              g.label === entry.label &&
              (g.latchOnce !== false) === entry.latchOnce
            )
        ),
      });
      return;
    }
    this.setState(prev => {
      if (prev.successGoals.some(g => g.eventId === entry.eventId)) {
        return prev;
      }
      const catalogEvent = JBC_CATALOG_EVENTS.find(e => e.eventId === entry.eventId);
      const nextEvents = { ...prev.events };
      if (catalogEvent && !nextEvents[entry.eventId]) {
        nextEvents[entry.eventId] = JSON.parse(JSON.stringify(catalogEvent.event)) as Event;
      }
      return {
        ...prev,
        events: nextEvents,
        successGoals: [
          ...prev.successGoals,
          {
            eventId: entry.eventId,
            label: entry.label,
            latchOnce: entry.latchOnce,
          },
        ],
      };
    });
  };

  private onAddConditionSuccessGoals_ = (
    goals: ConditionGoalInput[],
    step?: ItemSuccessWizardStep
  ) => {
    if (step) {
      const sourceScene = this.sourceSceneForWizard_();
      const worldItems = sourceScene ? worldItemsFromScene(sourceScene) : [];
      const placement = this.matPlacement_();
      const successGoals = stripItemWizardSuccessGoals(
        this.state.successGoals.filter(g => !goalBelongsToWizardStep(g, step)),
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems
      );
      this.syncWizardGoalsAndEvents_({ successGoals });
      return;
    }
    if (goals.length === 0) return;
    const successGoals = [...this.state.successGoals];
    let changed = false;
    for (const goal of goals) {
      if (successGoals.some(g => g.eventId === goal.eventId)) continue;
      successGoals.push(goal);
      changed = true;
    }
    if (!changed) return;
    this.syncWizardGoalsAndEvents_({ successGoals });
  };

  private onAddCatalogSuccessGoals_ = (entries: JbcCatalogSuccessGoal[]) => {
    if (entries.length === 0) return;
    const successGoals = [...this.state.successGoals];
    let changed = false;
    for (const entry of entries) {
      if (successGoals.some(g => g.eventId === entry.eventId)) continue;
      successGoals.push({
        eventId: entry.eventId,
        label: entry.label,
        latchOnce: entry.latchOnce,
      });
      changed = true;
    }
    if (!changed) return;
    this.syncWizardGoalsAndEvents_({ successGoals });
  };

  private selectedCatalogSuccessKeys_ = (): Set<string> => {
    const keys = new Set<string>();
    for (const goal of this.state.successGoals) {
      for (const entry of JBC_CATALOG_SUCCESS_GOALS) {
        if (
          entry.eventId === goal.eventId &&
          entry.label === goal.label &&
          entry.latchOnce === (goal.latchOnce !== false)
        ) {
          keys.add(entry.key);
        }
      }
    }
    return keys;
  };

  private disabledCatalogSuccessKeys_ = (): Set<string> => {
    const disabled = new Set<string>();
    const selectedKeys = this.selectedCatalogSuccessKeys_();
    const usedEventIds = new Set(this.state.successGoals.map(g => g.eventId));
    for (const entry of JBC_CATALOG_SUCCESS_GOALS) {
      if (usedEventIds.has(entry.eventId) && !selectedKeys.has(entry.key)) {
        disabled.add(entry.key);
      }
    }
    return disabled;
  };

  private onFinish_ = () => {
    const uid = auth.currentUser?.uid;
    const {
      sandboxScene,
      editingScene,
      editingChallenge,
      editingChallengeId,
      dispatch,
      navigate,
    } = this.props;
    if (!uid) return;

    // When editing from a challenge route, item poses live in the simulator working scene.
    const sourceScene = editingChallengeId
      ? Space.getInstance().scene ?? editingScene
      : sandboxScene;
    if (!sourceScene) return;

    const challengeId = editingChallengeId ?? newCustomChallengeId();
    const author = editingChallenge?.author ?? Author.user(uid);
    const name = {
      [LocalizedString.EN_US]: this.state.name.trim() || 'My Custom JBC Challenge',
    };
    const description = {
      [LocalizedString.EN_US]: this.state.description.trim(),
    };

    const mergedSuccessGoals = this.mergedSuccessGoals_();
    const dedupedPlayZones = uniqueBy_(this.state.playZones, z => z.id);
    const playZonesForRuntime = playZonesForRuntimeScript(
      dedupedPlayZones,
      mergedSuccessGoals
    );

    let scene = JSON.parse(JSON.stringify(sourceScene)) as Scene;
    scene = applyCustomChallengeMatPlacementToScene(scene, this.matPlacement_());
    scene = applyMatPlayZonesToScene(scene, playZonesForRuntime, this.matPlacement_());
    const playAreaChallengeGoals = mergedSuccessGoals.filter(g =>
      isPlayAreaSuccessEventId(g.eventId)
    );
    scene = applyCustomChallengeRuntimeScriptToScene(scene, {
      playZones: playZonesForRuntime,
      placement: this.matPlacement_(),
      itemSuccessChoices: this.state.itemSuccessChoices,
      worldItems: worldItemsFromScene(sourceScene),
      playAreaChallengeGoals,
      challengeSuccessGoals: mergedSuccessGoals,
      challengeFailureGoals: this.state.failureGoals,
    });
    scene.customChallengeItemSuccessChoices = { ...this.state.itemSuccessChoices };
    scene.author = author;
    scene.name = name;
    scene.description = description;

    const success = buildSuccessPredicate(mergedSuccessGoals);
    const failure = buildFailurePredicate(this.state.failureGoals);

    let challenge = editingChallenge
      ? {
        ...editingChallenge,
        name,
        description,
        author,
      }
      : createCustomChallengeTemplate(challengeId, author, name, description);
    challenge = {
      ...challenge,
      events: pruneEventsToConditionGoals(this.state.events, [
        ...mergedSuccessGoals,
        ...this.state.failureGoals,
      ]),
      success,
      failure,
      successGoals: success ? buildSuccessGoals(mergedSuccessGoals) : undefined,
      failureGoals: failure ? buildFailureGoals(this.state.failureGoals) : undefined,
    };

    if (editingChallengeId) {
      dispatch(ScenesAction.setScene({ sceneId: challengeId, scene }));
      dispatch(ChallengesAction.setName({ challengeId, name }));
      dispatch(ChallengesAction.setDescription({ challengeId, description }));
      for (const existingEventId of Object.keys(editingChallenge?.events ?? {})) {
        if (!(existingEventId in challenge.events)) {
          dispatch(ChallengesAction.removeEvent({ challengeId, eventId: existingEventId }));
        }
      }
      for (const [eventId, event] of Object.entries(challenge.events)) {
        dispatch(ChallengesAction.setEvent({ challengeId, eventId, event }));
      }
      dispatch(
        ChallengesAction.applyChallengeConditions({
          challengeId,
          success,
          failure,
          successGoals: success ? buildSuccessGoals(mergedSuccessGoals) : undefined,
          failureGoals: failure ? buildFailureGoals(this.state.failureGoals) : undefined,
        })
      );
      dispatch(ScenesAction.saveScene({ sceneId: challengeId }));
      dispatch(ChallengesAction.saveChallenge({ challengeId }));
    } else {
      const sceneWithRules = sceneWithCustomChallenge(scene, challenge);
      dispatch(ScenesAction.createScene({ sceneId: challengeId, scene: sceneWithRules }));
      dispatch(
        ChallengesAction.setChallengeInternal({
          challengeId,
          challenge: Async.loaded({
            brief: ChallengeBrief.fromChallenge(challenge),
            value: challenge,
          }),
        })
      );
      dispatch(
        ChallengeCompletionsAction.createChallengeCompletion({
          challengeId,
          challengeCompletion: {
            ...ChallengeCompletion.EMPTY,
            code: challenge.code,
            currentLanguage: challenge.defaultLanguage,
          },
        })
      );
    }

    this.closeWithoutRevert_();
    if (!editingChallengeId) {
      if (this.props.tourRegistry) {
        saveCustomChallengeTourSandboxHandoff();
        window.location.href = `/scene/${JBC_SANDBOX_SCENE_ID}`;
        return;
      }
      navigate(`/scene/${challengeId}`);
    }
  };

  private renderDetailsStep_ = () => {
    const { theme, locale } = this.props;
    const { name, description } = this.state;
    const wrapTarget_ = (
      targetKey: string,
      children: React.ReactNode
    ): React.ReactNode =>
      this.props.tourRegistry ? (
        <TourTarget registry={this.props.tourRegistry} targetKey={targetKey}>
          {children}
        </TourTarget>
      ) : children;
    return (
      <div style={{ padding: theme.itemPadding * 2 }}>
        {wrapTarget_(
          'custom-challenge-name-field',
          <Field name={LocalizedString.lookup(tr('Name'), locale)} theme={theme} long>
            <Input
              theme={theme}
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                this.setState({ name: e.currentTarget.value })
              }
            />
          </Field>
        )}
        {wrapTarget_(
          'custom-challenge-description-field',
          <Field name={LocalizedString.lookup(tr('Description'), locale)} theme={theme} multiline>
            <TextArea
              theme={theme}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                this.setState({ description: e.currentTarget.value })
              }
            />
          </Field>
        )}
      </div>
    );
  };

  render() {
    const { theme, locale } = this.props;
    const { step, playZones, activeZoneId, events, successGoals, failureGoals } = this.state;
    const isLast = step === Step.Review;
    const isFirst = step === Step.Details;
    const stepLabel = `${this.stepTitle_()} (${step + 1} / ${STEP_COUNT})`;
    const sourceScene = this.sourceSceneForWizard_();
    const worldItems = sourceScene ? worldItemsFromScene(sourceScene) : [];

    if (step === Step.DefineArea) {
      return (
        <>
          <MatZoneEditOverlay
            theme={theme}
            locale={locale}
            active
            interactive
            zones={playZones}
            activeZoneId={activeZoneId}
            onZoneShapeChange={this.onZoneShapeChange_}
          />
          <MatPlayZonesSidePanel
            theme={theme}
            locale={locale}
            stepLabel={stepLabel}
            zones={playZones}
            activeZoneId={activeZoneId}
            worldItems={worldItems}
            onActiveZoneChange={id => this.setState({ activeZoneId: id })}
            onZonesChange={playZones => this.setState({ playZones })}
            selectedWorldItemKeys={this.state.selectedWorldItemKeys}
            selectedGeometryKeys={this.state.selectedGeometryKeys}
            onWorldItemToggle={this.onWorldItemToggle_}
            onAddPaperReam={this.onAddPaperReam_}
            onGeometryToggle={this.onGeometryToggle_}
            onAddZone={this.onAddPlayZone_}
            onDeleteZone={this.onDeletePlayZone_}
            onCancel={this.onCancel_}
            onBack={this.onBack_}
            onContinue={this.onNext_}
            tourRegistry={this.props.tourRegistry}
            tourTargetKey="custom-challenge-mat-setup-panel"
          />
        </>
      );
    }

    if (step === Step.Success || step === Step.Failure || step === Step.Review) {
      return (
        <>
          <MatZoneEditOverlay
            theme={theme}
            locale={locale}
            active
            interactive={false}
            zones={playZones}
            activeZoneId={activeZoneId}
            onZoneShapeChange={this.onZoneShapeChange_}
          />
          <CustomChallengeRulesSidePanel
            theme={theme}
            locale={locale}
            step={
              step === Step.Success
                ? 'success'
                : step === Step.Failure
                  ? 'failure'
                  : 'review'
            }
            stepLabel={stepLabel}
            playZones={playZones}
            placement={this.matPlacement_()}
            worldItems={worldItems}
            events={events}
            successGoals={successGoals}
            failureGoals={failureGoals}
            selectedCatalogSuccessKeys={this.selectedCatalogSuccessKeys_()}
            disabledCatalogSuccessKeys={this.disabledCatalogSuccessKeys_()}
            onCatalogSuccessGoalToggle={this.onCatalogSuccessGoalToggle_}
            onAddCatalogSuccessGoals={this.onAddCatalogSuccessGoals_}
            onAddConditionSuccessGoals={this.onAddConditionSuccessGoals_}
            onSuccessGoalsChange={next => this.syncWizardGoalsAndEvents_({ successGoals: next })}
            itemSuccessChoices={this.state.itemSuccessChoices}
            onItemSuccessChoicesChange={itemSuccessChoices =>
              this.syncWizardGoalsAndEvents_({ itemSuccessChoices })
            }
            onFailureGoalsChange={next => this.syncWizardGoalsAndEvents_({ failureGoals: next })}
            onCancel={this.onCancel_}
            onBack={this.onBack_}
            onContinue={this.onNext_}
            tourRegistry={this.props.tourRegistry}
            tourTargetKey={`custom-challenge-${step === Step.Success
              ? 'success'
              : step === Step.Failure
                ? 'failure'
                : 'review'}-panel`}
            continueLabel={
              isLast
                ? (this.props.editingChallengeId ? tr('Save changes') : tr('Create challenge'))
                : tr('Continue')
            }
            isFinishStep={isLast}
          />
        </>
      );
    }

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(
          this.props.editingChallengeId
            ? tr('Edit custom challenge')
            : tr('New custom challenge'),
          locale
        )}
        onClose={this.onCancel_}
        tourRegistry={this.props.tourRegistry}
        tourTargetKey="custom-challenge-setup-dialog"
        maxWidth="1040px"
      >
        <StepIndicator theme={theme}>
          {stepLabel}
        </StepIndicator>
        <Body theme={theme}>{this.renderDetailsStep_()}</Body>
        <NavBar theme={theme}>
          <NavButton theme={theme} type="button" onClick={this.onCancel_}>
            {LocalizedString.lookup(tr('Cancel'), locale)}
          </NavButton>
          <div style={{ flex: 1 }} />
          {!isFirst && (
            <NavButton theme={theme} type="button" onClick={this.onBack_}>
              <FontAwesome icon={faChevronLeft} /> {LocalizedString.lookup(tr('Back'), locale)}
            </NavButton>
          )}
          {this.props.tourRegistry ? (
            <TourTarget registry={this.props.tourRegistry} targetKey="custom-challenge-details-continue">
              <NavButton theme={theme} type="button" $primary onClick={this.onNext_}>
                {isLast ? (
                  <>
                    <FontAwesome icon={faCheck} />{' '}
                    {LocalizedString.lookup(
                      this.props.editingChallengeId ? tr('Save changes') : tr('Create challenge'),
                      locale
                    )}
                  </>
                ) : (
                  <>
                    {LocalizedString.lookup(tr('Continue'), locale)}{' '}
                    <FontAwesome icon={faChevronRight} />
                  </>
                )}
              </NavButton>
            </TourTarget>
          ) : (
            <NavButton theme={theme} type="button" $primary onClick={this.onNext_}>
              {isLast ? (
                <>
                  <FontAwesome icon={faCheck} />{' '}
                  {LocalizedString.lookup(
                    this.props.editingChallengeId ? tr('Save changes') : tr('Create challenge'),
                    locale
                  )}
                </>
              ) : (
                <>
                  {LocalizedString.lookup(tr('Continue'), locale)}{' '}
                  <FontAwesome icon={faChevronRight} />
                </>
              )}
            </NavButton>
          )}
        </NavBar>
      </Dialog>
    );
  }
}

export default connect(
  (state: ReduxState, ownProps: CustomChallengeSetupDialogPublicProps) => ({
    locale: state.i18n.locale,
    sandboxScene: Async.latestValue(state.scenes[JBC_SANDBOX_SCENE_ID]),
    editingSceneAsync: ownProps.editingChallengeId
      ? state.scenes[ownProps.editingChallengeId] ?? null
      : null,
    editingScene: ownProps.editingChallengeId
      ? Async.latestValue(state.scenes[ownProps.editingChallengeId]) ?? null
      : null,
    editingChallengeAsync: ownProps.editingChallengeId
      ? state.challenges[ownProps.editingChallengeId] ?? null
      : null,
    editingChallenge: ownProps.editingChallengeId
      ? Async.latestValue(state.challenges[ownProps.editingChallengeId]) ?? null
      : null,
    editingChallengeCompletionAsync: ownProps.editingChallengeId
      ? state.challengeCompletions[ownProps.editingChallengeId] ?? null
      : null,
  }),
  dispatch => ({ dispatch })
)(withNavigate(CustomChallengeSetupDialog)) as React.ComponentType<CustomChallengeSetupDialogPublicProps>;
