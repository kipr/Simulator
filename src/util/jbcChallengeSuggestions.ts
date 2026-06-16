import tr from '@i18n';
import {
  JBC_CATALOG_GEOMETRIES,
  JBC_CATALOG_ITEMS,
  JBC_CATALOG_SUCCESS_GOALS,
  JbcCatalogSuccessGoal,
  WorldSceneItem,
} from './jbcChallengeCatalog';
import { ConditionGoalInput, sanitizeChallengeEventId } from './customChallengePredicates';
import { oppositeFailureGoal } from './customChallengeGoals';
import LocalizedString from './LocalizedString';
import { MatPlayZone, MatPlacementSelection } from './jbcMatPlayArea';

export interface PlayZoneSelectionSummary {
  zoneCount: number;
  zones: Array<{
    name: string;
    itemLabels: string[];
    geometryLabels: string[];
  }>;
  /** Items on the mat (not per zone). */
  matItemLabels: string[];
  matGeometryLabels: string[];
  nodeIds: Set<string>;
  hasCans: boolean;
  hasCircles: boolean;
  hasReams: boolean;
  hasStartBox: boolean;
  hasNotStartBox: boolean;
  hasGarage: boolean;
  hasLine: boolean;
  hasEndZone: boolean;
}

export interface ChallengeSuggestion {
  id: string;
  title: string;
  description: string;
  scriptTip?: string;
  /** Matching official JBC success catalog keys the student can add with one click. */
  relatedSuccessGoalKeys?: string[];
  relatedFailureEventIds?: string[];
}

function labelForKey_(
  key: string,
  worldItems: WorldSceneItem[]
): string {
  const world = worldItems.find(i => i.key === key);
  if (world) return world.displayName;
  const geom = JBC_CATALOG_GEOMETRIES.find(g => g.key === key);
  if (geom) return geom.displayName;
  return key;
}

export function summarizeChallengePlacement(
  zones: MatPlayZone[],
  worldItems: WorldSceneItem[],
  worldItemKeys: string[],
  geometryKeys: string[]
): PlayZoneSelectionSummary {
  const nodeIds = new Set<string>();
  worldItemKeys.forEach(k => nodeIds.add(k));
  geometryKeys.forEach(k => {
    nodeIds.add(k);
    const geom = JBC_CATALOG_GEOMETRIES.find(g => g.key === k);
    if (geom) nodeIds.add(geom.nodeId);
  });

  const hasMatch = (re: RegExp) => [...nodeIds].some(id => re.test(id));

  const itemLabels = worldItemKeys.map(k => labelForKey_(k, worldItems));
  const geometryLabels = geometryKeys.map(k => labelForKey_(k, worldItems));

  return {
    zoneCount: zones.length,
    zones: zones.map(z => ({
      name: z.name,
      itemLabels: [],
      geometryLabels: [],
    })),
    matItemLabels: itemLabels,
    matGeometryLabels: geometryLabels,
    nodeIds,
    hasCans: hasMatch(/^can\d+$/i),
    hasCircles: hasMatch(/^circle\d+$/i),
    hasReams: hasMatch(/^ream\d*$/i),
    hasStartBox: nodeIds.has('startBox'),
    hasNotStartBox: nodeIds.has('notStartBox'),
    hasGarage: [...nodeIds].some(id => /garage/i.test(id)),
    hasLine: [...nodeIds].some(id => /line/i.test(id)),
    hasEndZone: nodeIds.has('endBox') || nodeIds.has('endOfMat'),
  };
}

function catalogGoalsMatching_(
  predicate: (goal: JbcCatalogSuccessGoal) => boolean
): string[] {
  return JBC_CATALOG_SUCCESS_GOALS.filter(predicate).map(g => g.key);
}

export function buildSuccessSuggestions(
  summary: PlayZoneSelectionSummary
): ChallengeSuggestion[] {
  const suggestions: ChallengeSuggestion[] = [];
  const { nodeIds } = summary;

  if (summary.hasCans) {
    suggestions.push({
      id: 'cans-upright',
      title: 'Keep cans upright',
      description:
        'Grade whether each can stays upright during the run. Official JBC challenges use a y-angle check in scene scripts (nodeUpright).',
      scriptTip:
        "scene.addOnRenderListener(() => {\n  if (scene.programStatus === 'running') {\n    scene.setChallengeEventValue('can1Upright', nodeUpright('can1'));\n  }\n});",
      relatedSuccessGoalKeys: catalogGoalsMatching_(
        g => /upright/i.test(g.eventId) || /upright/i.test(g.label)
      ),
    });
    suggestions.push({
      id: 'cans-intersection',
      title: 'Detect robot or claw at a can',
      description:
        'Use addOnIntersectionListener on can nodes to know when the robot enters or leaves a can zone.',
      scriptTip:
        "scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  if (scene.programStatus === 'running' && otherNodeId === 'can1') {\n    scene.setChallengeEventValue('touchedCan1', type === 'start');\n  }\n}, 'can1');",
      relatedSuccessGoalKeys: catalogGoalsMatching_(
        g =>
          /touch|intersect|reach|ring|chop|fetch|load/i.test(g.eventId + g.label) &&
          /can/i.test(g.eventId + g.label)
      ),
    });
  }

  if (summary.hasCircles) {
    const circleIds = [...nodeIds].filter(id => /^circle\d+$/i.test(id)).slice(0, 3);
    suggestions.push({
      id: 'circles-cover',
      title: 'Cover or touch mat circles',
      description:
        'Listen for intersections between a circle volume and a can or the robot. Many JBC challenges hide circles until a can enters them.',
      scriptTip: circleIds.length
        ? `scene.addOnIntersectionListener('${circleIds[0]}', (type, otherNodeId) => {\n  /* setChallengeEventValue when can/robot enters */\n}, 'can1');`
        : "scene.addOnIntersectionListener('circle1', (type, otherNodeId) => { /* ... */ }, 'can1');",
      relatedSuccessGoalKeys: catalogGoalsMatching_(
        g => /circle|touch|cover|base|serpentine|odd/i.test(g.eventId + g.label)
      ),
    });
  }

  if (summary.hasReams) {
    suggestions.push({
      id: 'ream-proximity',
      title: 'Stop or bump near a paper ream',
      description:
        'Use intersection listeners on ream front boundaries or the ream template to score proximity challenges.',
      scriptTip:
        "scene.addOnIntersectionListener('claw_link', (type, otherNodeId) => {\n  scene.setChallengeEventValue('stopAtReam', type === 'start');\n}, 'reamFrontBoundary');",
      relatedSuccessGoalKeys: catalogGoalsMatching_(
        g => /ream|proximity|bump|stop|search/i.test(g.eventId + g.label)
      ),
    });
  }

  if (summary.hasStartBox || summary.hasNotStartBox) {
    suggestions.push({
      id: 'start-box',
      title: 'Start inside (or outside) the start box',
      description:
        'The robot is checked against invisible start / not-start boxes—common for fair starts in JBC.',
      scriptTip:
        "scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  scene.setChallengeEventValue('inStartBox', type === 'start');\n}, 'startBox');",
      relatedSuccessGoalKeys: catalogGoalsMatching_(
        g => /startbox|start box|instart|notinstart/i.test(g.eventId + g.label)
      ),
      relatedFailureEventIds: ['notInStartBox'],
    });
  }

  if (summary.hasGarage) {
    suggestions.push({
      id: 'garage-park',
      title: 'Park in a colored garage',
      description:
        'Garage boxes detect when the robot or cans intersect the parking region (Precision Parking style).',
      scriptTip:
        "scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  scene.setChallengeEventValue('inGarage', type === 'start');\n}, 'greenGarage');",
      relatedSuccessGoalKeys: catalogGoalsMatching_(
        g => /garage|park|precision/i.test(g.eventId + g.label)
      ),
    });
  }

  if (summary.hasLine) {
    suggestions.push({
      id: 'line-follow',
      title: 'Follow or avoid a line',
      description:
        'Line geometries can mean “stay on the path” success or “touching the line” failure, depending on your script.',
      scriptTip:
        "scene.addOnIntersectionListener('lineB', (type, otherNodeId) => {\n  scene.setChallengeEventValue('onLine', type === 'start');\n}, ['left_wheel_link', 'right_wheel_link']);",
      relatedSuccessGoalKeys: catalogGoalsMatching_(
        g => /line|walk|black/i.test(g.eventId + g.label)
      ),
      relatedFailureEventIds: ['robotTouchingLine'],
    });
  }

  if (summary.hasEndZone) {
    suggestions.push({
      id: 'reach-end',
      title: 'Reach the end of the course',
      description:
        'End boxes and end-of-mat volumes detect when the robot finishes a straight drive or course.',
      scriptTip:
        "scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  scene.setChallengeEventValue('reachedEnd', type === 'start');\n}, 'endBox');",
      relatedSuccessGoalKeys: catalogGoalsMatching_(
        g => /end|reach|finish|amazing/i.test(g.eventId + g.label)
      ),
    });
  }

  if (summary.zoneCount > 1) {
    suggestions.push({
      id: 'multi-zone',
      title: 'Combine per-area rules',
      description:
        'You defined multiple play areas. Use per-area success picks from the previous step, then add challenge-wide rules here for anything that spans the whole mat.',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: 'general-events',
      title: 'Define events in scene scripts',
      description:
        'Add items and collision volumes on the mat, then write ecmaScript in the scene Scripts panel. Call scene.setChallengeEventValue(\'myEvent\', true) when something should count toward success or failure.',
      scriptTip:
        "scene.addOnRenderListener(() => {\n  if (scene.programStatus === 'running') {\n    scene.setChallengeEventValue('myEvent', /* your condition */);\n  }\n});",
    });
    suggestions.push({
      id: 'catalog-rules',
      title: 'Reuse official JBC grading rules',
      description:
        'Pick ready-made success conditions below that match how standard JBC challenges score students.',
    });
  }

  return suggestions;
}

export function buildFailureSuggestions(
  summary: PlayZoneSelectionSummary
): ChallengeSuggestion[] {
  const suggestions: ChallengeSuggestion[] = [];

  if (summary.hasStartBox || summary.hasNotStartBox) {
    suggestions.push({
      id: 'fail-not-in-start',
      title: 'Fail if the robot never starts in the box',
      description:
        'Students fail when notInStartBox becomes true—typical when the robot is not fully inside the start region at the beginning.',
      relatedFailureEventIds: ['notInStartBox'],
    });
  }

  if (summary.hasLine) {
    suggestions.push({
      id: 'fail-touch-line',
      title: 'Fail when wheels touch a boundary line',
      description:
        'Use robotTouchingLine or similar events when the robot crosses a line it should avoid.',
      relatedFailureEventIds: ['robotTouchingLine'],
    });
  }

  if (summary.hasEndZone || summary.hasNotStartBox) {
    suggestions.push({
      id: 'fail-off-mat',
      title: 'Fail when the robot leaves the mat',
      description:
        'An end-of-mat or off-mat listener ends the run if the robot drives off the playing surface.',
      relatedFailureEventIds: ['offMat'],
    });
  }

  if (summary.hasCans) {
    suggestions.push({
      id: 'fail-can-rules',
      title: 'Fail on wrong can order or knocked cans',
      description:
        'Challenges like Serpentine or Ring Around the Can fail students for touching cans out of order or tipping required cans.',
      relatedFailureEventIds: ['wrongOrder', 'notInStartBox'],
    });
  }

  suggestions.push({
    id: 'fail-custom',
    title: 'Add your own failure events',
    description:
      'In scene scripts, set an event when something goes wrong, then select it below. Failure uses OR logic—any selected event ends the run.',
    scriptTip:
      "scene.setChallengeEventValue('myFailure', true);",
  });

  return suggestions;
}

export function successGoalsForSuggestionKeys(
  keys: string[] | undefined
): JbcCatalogSuccessGoal[] {
  if (!keys?.length) return [];
  const keySet = new Set(keys);
  return JBC_CATALOG_SUCCESS_GOALS.filter(g => keySet.has(g.key));
}

export type ItemKind =
  | 'can'
  | 'circle'
  | 'ream'
  | 'start_box'
  | 'not_start_box'
  | 'garage'
  | 'line'
  | 'end_zone'
  | 'generic';

export type ItemSuccessOutcomeId =
  | 'robot_touch'
  | 'knock_over'
  | 'stay_upright'
  | 'cover_location'
  | 'robot_inside'
  | 'robot_reach'
  | 'sequence_touch'
  | 'stop_near'
  | 'custom_script'
  | 'skip';

export interface ItemSuccessOutcomeOption {
  id: ItemSuccessOutcomeId;
  title: string;
  description: string;
  scriptTip?: string;
  relatedSuccessGoalKeys?: string[];
}

export interface ItemSuccessWizardStep {
  id: string;
  itemKey: string;
  nodeId: string;
  displayName: string;
  zoneId: string;
  zoneName: string;
  itemKind: ItemKind;
  outcomes: ItemSuccessOutcomeOption[];
}

function itemKindForKey_(key: string, nodeId: string): ItemKind {
  if (/^can\d+$/i.test(nodeId)) return 'can';
  if (/^circle\d+$/i.test(nodeId)) return 'circle';
  if (/ream/i.test(nodeId)) return 'ream';
  if (nodeId === 'startBox') return 'start_box';
  if (nodeId === 'notStartBox') return 'not_start_box';
  if (/garage/i.test(nodeId)) return 'garage';
  if (/line/i.test(nodeId)) return 'line';
  if (nodeId === 'endBox' || nodeId === 'endOfMat') return 'end_zone';
  return 'generic';
}

function nodeIdForPlacementKey_(key: string): string {
  const item = JBC_CATALOG_ITEMS.find(i => i.key === key);
  if (item) return item.nodeId;
  const geom = JBC_CATALOG_GEOMETRIES.find(g => g.key === key);
  return geom?.nodeId ?? key;
}

function goalsForCan_(nodeId: string, mode: 'touch' | 'upright' | 'knocked'): string[] {
  const canNum = nodeId.replace(/^can/i, '');
  if (mode === 'upright') {
    return catalogGoalsMatching_(
      g =>
        /upright/i.test(g.eventId + g.label) &&
        !/not/i.test(g.eventId + g.label) &&
        (canNum === '' || g.eventId.toLowerCase().includes(canNum.toLowerCase()))
    );
  }
  if (mode === 'knocked') {
    return catalogGoalsMatching_(
      g =>
        /not\s*upright|notupright|knock/i.test(g.eventId + g.label) &&
        (canNum === '' || g.eventId.toLowerCase().includes(canNum.toLowerCase()))
    );
  }
  return catalogGoalsMatching_(
    g =>
      /touch|intersect|reach|ring|chop|fetch|load|touched/i.test(g.eventId + g.label) &&
      (/can/i.test(g.eventId + g.label) ||
        (canNum !== '' && g.eventId.toLowerCase().includes(canNum.toLowerCase())))
  );
}

function outcomesForKind_(kind: ItemKind, nodeId: string): ItemSuccessOutcomeOption[] {
  switch (kind) {
    case 'can':
      return [
        {
          id: 'knock_over',
          title: 'Robot knocks over this can',
          description:
            'Success when the can is tipped over (no longer upright). Common for Bulldozer-style challenges.',
          scriptTip: `scene.addOnRenderListener(() => {\n  if (scene.programStatus === 'running') {\n    scene.setChallengeEventValue('${nodeId}KnockedOver', !nodeUpright('${nodeId}'));\n  }\n});`,
          relatedSuccessGoalKeys: goalsForCan_(nodeId, 'knocked'),
        },
        {
          id: 'robot_touch',
          title: 'Robot reaches or touches this can',
          description:
            'Success when the robot (or claw) intersects this can—common for Ring Around the Can, Fetch, and similar challenges.',
          scriptTip: `scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  if (scene.programStatus === 'running' && otherNodeId === '${nodeId}') {\n    scene.setChallengeEventValue('${nodeId}Touched', type === 'start');\n  }\n}, '${nodeId}');`,
          relatedSuccessGoalKeys: goalsForCan_(nodeId, 'touch'),
        },
        {
          id: 'stay_upright',
          title: 'This can stays upright',
          description:
            'Success if the can is still standing at the end (or throughout the run). Uses a tilt check in scene scripts.',
          scriptTip: `scene.addOnRenderListener(() => {\n  if (scene.programStatus === 'running') {\n    scene.setChallengeEventValue('${nodeId}Upright', nodeUpright('${nodeId}'));\n  }\n});`,
          relatedSuccessGoalKeys: goalsForCan_(nodeId, 'upright'),
        },
        {
          id: 'skip',
          title: 'Skip — no success rule for this can',
          description: 'You can add challenge-wide rules later or rely on other areas.',
        },
      ];
    case 'circle':
      return [
        {
          id: 'cover_location',
          title: 'A can or the robot covers this circle',
          description:
            'Typical JBC scoring: a hidden circle becomes true when the right can enters it.',
          scriptTip: `scene.addOnIntersectionListener('${nodeId}', (type, otherNodeId) => {\n  scene.setChallengeEventValue('${nodeId}Covered', type === 'start');\n}, 'can1');`,
          relatedSuccessGoalKeys: catalogGoalsMatching_(g =>
            /circle|cover|touch|serpentine|odd|base/i.test(g.eventId + g.label)
          ),
        },
        {
          id: 'robot_touch',
          title: 'Robot drives onto this circle',
          description: 'Success when the robot intersects the circle marker on the mat.',
          scriptTip: `scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  if (otherNodeId === '${nodeId}') scene.setChallengeEventValue('${nodeId}Reached', type === 'start');\n}, '${nodeId}');`,
          relatedSuccessGoalKeys: catalogGoalsMatching_(g =>
            /circle|line|walk/i.test(g.eventId + g.label)
          ),
        },
        {
          id: 'custom_script',
          title: 'Custom event in Scripts',
          description: 'Define your own condition for this circle.',
        },
        {
          id: 'skip',
          title: 'Skip this circle',
          description: 'No success rule tied to this circle.',
        },
      ];
    case 'ream':
      return [
        {
          id: 'stop_near',
          title: 'Robot stops near the ream without bumping it',
          description: 'Proximity-style success: claw or robot reaches a boundary in front of the ream.',
          scriptTip:
            "scene.addOnIntersectionListener('claw_link', (type, otherNodeId) => {\n  scene.setChallengeEventValue('stopAtReam', type === 'start');\n}, 'reamFrontBoundary');",
        },
        {
          id: 'robot_touch',
          title: 'Robot bumps or touches the ream',
          description: 'Success when contact with the ream is required (Bump-style challenges).',
          relatedSuccessGoalKeys: catalogGoalsMatching_(g =>
            /bump|ream|touch/i.test(g.eventId + g.label)
          ),
        },
        {
          id: 'skip',
          title: 'Skip this ream',
          description: 'No success rule for this ream.',
        },
      ];
    case 'start_box':
      return [
        {
          id: 'robot_inside',
          title: 'Robot starts inside the start box',
          description:
            'Standard JBC start fairness: the robot must begin fully inside the start region.',
          scriptTip:
            "scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  scene.setChallengeEventValue('inStartBox', type === 'start');\n}, 'startBox');",
          relatedSuccessGoalKeys: catalogGoalsMatching_(g =>
            /startbox|start box|instart/i.test(g.eventId + g.label)
          ),
        },
        {
          id: 'skip',
          title: 'Skip',
          description: 'Do not use this start box for success.',
        },
      ];
    case 'not_start_box':
      return [
        {
          id: 'robot_inside',
          title: 'Robot began outside the legal start region',
          description:
            'Often paired with failure: notInStartBox fires if the robot was not in the start box when the run began.',
          scriptTip:
            "scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  scene.setChallengeEventValue('notInStartBox', type === 'start');\n}, 'notStartBox');",
          relatedSuccessGoalKeys: catalogGoalsMatching_(g =>
            /notinstart|not in start/i.test(g.eventId + g.label)
          ),
        },
        {
          id: 'skip',
          title: 'Skip',
          description: 'Not used for success scoring.',
        },
      ];
    case 'garage':
      return [
        {
          id: 'robot_inside',
          title: 'Robot parks inside this garage',
          description: 'Precision Parking style: robot must intersect the garage volume.',
          scriptTip: `scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  scene.setChallengeEventValue('in${nodeId}', type === 'start');\n}, '${nodeId}');`,
          relatedSuccessGoalKeys: catalogGoalsMatching_(g =>
            /garage|park|precision/i.test(g.eventId + g.label)
          ),
        },
        {
          id: 'cover_location',
          title: 'A can is placed in this garage',
          description: 'Success when a can (not the robot) enters the garage region.',
          relatedSuccessGoalKeys: catalogGoalsMatching_(g =>
            /garage|can|placed|lifted/i.test(g.eventId + g.label)
          ),
        },
        {
          id: 'skip',
          title: 'Skip this garage',
          description: 'No rule for this garage.',
        },
      ];
    case 'line':
      return [
        {
          id: 'sequence_touch',
          title: 'Robot follows or touches this line in order',
          description:
            'Use for path following or Serpentine-style sequences along line markers.',
          scriptTip: `scene.addOnIntersectionListener('${nodeId}', (type, otherNodeId) => {\n  scene.setChallengeEventValue('onLine', type === 'start');\n}, ['left_wheel_link', 'right_wheel_link']);`,
          relatedSuccessGoalKeys: catalogGoalsMatching_(g =>
            /line|walk|touch|serpentine|touched/i.test(g.eventId + g.label)
          ),
        },
        {
          id: 'skip',
          title: 'Skip this line',
          description: 'Not used for success.',
        },
      ];
    case 'end_zone':
      return [
        {
          id: 'robot_reach',
          title: 'Robot reaches this end zone',
          description: 'Drive Straight and similar: success when the robot enters the end region.',
          scriptTip: `scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  scene.setChallengeEventValue('reachedEnd', type === 'start');\n}, '${nodeId}');`,
          relatedSuccessGoalKeys: catalogGoalsMatching_(g =>
            /end|reach|finish|amazing/i.test(g.eventId + g.label)
          ),
        },
        {
          id: 'skip',
          title: 'Skip',
          description: 'Not used for success.',
        },
      ];
    default:
      return [
        {
          id: 'robot_touch',
          title: 'Robot intersects this object',
          description: 'Generic success when the robot touches or enters this volume.',
          scriptTip: `scene.addOnIntersectionListener('robot', (type, otherNodeId) => {\n  if (otherNodeId === '${nodeId}') scene.setChallengeEventValue('${nodeId}Reached', type === 'start');\n}, '${nodeId}');`,
        },
        {
          id: 'custom_script',
          title: 'Custom event in Scripts',
          description: 'Define your own success event for this object.',
        },
        {
          id: 'skip',
          title: 'Skip',
          description: 'No success rule for this object.',
        },
      ];
  }
}

/** One wizard step per item or script geometry on the mat. */
export function buildItemSuccessWizardSteps(
  worldItemKeys: string[],
  geometryKeys: string[],
  worldItems: WorldSceneItem[]
): ItemSuccessWizardStep[] {
  const steps: ItemSuccessWizardStep[] = [];
  const keys = [...worldItemKeys, ...geometryKeys];

  for (const itemKey of keys) {
    const nodeId = nodeIdForPlacementKey_(itemKey);
    const itemKind = itemKindForKey_(itemKey, nodeId);
    steps.push({
      id: itemKey,
      itemKey,
      nodeId,
      displayName: labelForKey_(itemKey, worldItems),
      zoneId: '',
      zoneName: '',
      itemKind,
      outcomes: outcomesForKind_(itemKind, nodeId),
    });
  }

  return steps;
}

/** @deprecated Use {@link summarizeChallengePlacement} */
export function summarizePlayZoneSelection(
  zones: MatPlayZone[],
  worldItems: WorldSceneItem[]
): PlayZoneSelectionSummary {
  return summarizeChallengePlacement(zones, worldItems, [], []);
}

export function catalogGoalsForOutcome(
  step: ItemSuccessWizardStep,
  outcomeId: ItemSuccessOutcomeId
): JbcCatalogSuccessGoal[] {
  const option = step.outcomes.find(o => o.id === outcomeId);
  return successGoalsForSuggestionKeys(option?.relatedSuccessGoalKeys);
}

export interface ItemSuccessChoiceSummary {
  displayName: string;
  nodeId: string;
  outcomeTitle: string;
}

export function itemSuccessChoiceSummaries(
  worldItemKeys: string[],
  geometryKeys: string[],
  worldItems: WorldSceneItem[],
  choices: Record<string, ItemSuccessOutcomeId>
): ItemSuccessChoiceSummary[] {
  const steps = buildItemSuccessWizardSteps(worldItemKeys, geometryKeys, worldItems);
  return steps.map(step => {
    const outcomeId = choices[step.id];
    const outcomeTitle =
      outcomeId === undefined
        ? '—'
        : step.outcomes.find(o => o.id === outcomeId)?.title ?? outcomeId;
    return {
      displayName: step.displayName,
      nodeId: step.nodeId,
      outcomeTitle,
    };
  });
}

/** Drop per-item wizard rows from manual success lists (wizard choices are merged separately). */
export function stripItemWizardSuccessGoals(
  successGoals: ConditionGoalInput[],
  worldItemKeys: string[],
  geometryKeys: string[],
  worldItems: WorldSceneItem[]
): ConditionGoalInput[] {
  const steps = buildItemSuccessWizardSteps(worldItemKeys, geometryKeys, worldItems);
  return successGoals.filter(goal => {
    if (steps.some(step => goalBelongsToWizardStep(goal, step))) return false;
    // Drop misplaced catalog ream rows (e.g. ream3Touched) when the label names a placed ream.
    if (/^ream[a-z0-9]+(Touched|StopNear)$/i.test(goal.eventId)) {
      const colon = goal.label.indexOf(':');
      if (colon > 0) {
        const prefix = goal.label.slice(0, colon);
        if (steps.some(s => s.itemKind === 'ream' && s.displayName === prefix)) {
          return false;
        }
      }
    }
    return true;
  });
}

function wizardStepForPlacementKey_(
  placementKey: string,
  prevPlacement: MatPlacementSelection,
  worldItems: WorldSceneItem[]
): ItemSuccessWizardStep | null {
  const worldItemKeys = prevPlacement.worldItemKeys.includes(placementKey)
    ? [placementKey]
    : [];
  const geometryKeys = prevPlacement.geometryKeys.includes(placementKey)
    ? [placementKey]
    : [];
  const steps = buildItemSuccessWizardSteps(
    worldItemKeys,
    geometryKeys,
    worldItems
  );
  return steps[0] ?? null;
}

function removedPlacementKeys_(
  prevPlacement: MatPlacementSelection,
  nextPlacement: MatPlacementSelection
): Set<string> {
  const nextKeys = new Set([
    ...nextPlacement.worldItemKeys,
    ...nextPlacement.geometryKeys,
  ]);
  const removed = new Set<string>();
  for (const key of [
    ...prevPlacement.worldItemKeys,
    ...prevPlacement.geometryKeys,
  ]) {
    if (!nextKeys.has(key)) removed.add(key);
  }
  return removed;
}

export interface PruneGoalsForRemovedPlacementResult {
  successGoals: ConditionGoalInput[];
  failureGoals: ConditionGoalInput[];
  itemSuccessChoices: Record<string, ItemSuccessOutcomeId>;
  removedEventIds: Set<string>;
}

/** Remove success/failure rows and wizard choices when mat items or geometries are deselected. */
export function pruneConditionGoalsForRemovedPlacement(
  prevPlacement: MatPlacementSelection,
  nextPlacement: MatPlacementSelection,
  successGoals: ConditionGoalInput[],
  failureGoals: ConditionGoalInput[],
  itemSuccessChoices: Record<string, ItemSuccessOutcomeId>,
  worldItems: WorldSceneItem[]
): PruneGoalsForRemovedPlacementResult {
  const removedKeys = removedPlacementKeys_(prevPlacement, nextPlacement);
  if (removedKeys.size === 0) {
    return {
      successGoals,
      failureGoals,
      itemSuccessChoices,
      removedEventIds: new Set(),
    };
  }

  const removedSteps: ItemSuccessWizardStep[] = [];
  for (const key of removedKeys) {
    const step = wizardStepForPlacementKey_(key, prevPlacement, worldItems);
    if (step) removedSteps.push(step);
  }

  const removedEventIds = new Set<string>();
  const nextChoices = { ...itemSuccessChoices };
  for (const key of removedKeys) {
    delete nextChoices[key];
  }

  for (const step of removedSteps) {
    for (const id of possibleOppositeFailureEventIdsForWizardStep(step)) {
      removedEventIds.add(id);
    }
    const choice = itemSuccessChoices[step.id];
    if (choice && choice !== 'skip' && choice !== 'custom_script') {
      for (const goal of conditionGoalsForItemOutcome(step, choice)) {
        removedEventIds.add(goal.eventId);
        const opposite = oppositeFailureGoal(goal);
        if (opposite) removedEventIds.add(opposite.eventId);
      }
    }
  }

  const goalOnRemovedStep = (goal: ConditionGoalInput) =>
    removedSteps.some(step => goalBelongsToWizardStep(goal, step));

  return {
    successGoals: successGoals.filter(goal => !goalOnRemovedStep(goal)),
    failureGoals: failureGoals.filter(
      goal => !goalOnRemovedStep(goal) && !removedEventIds.has(goal.eventId)
    ),
    itemSuccessChoices: nextChoices,
    removedEventIds,
  };
}

/** Failure event ids that any outcome for this item could auto-generate. */
export function possibleOppositeFailureEventIdsForWizardStep(
  step: ItemSuccessWizardStep
): Set<string> {
  const ids = new Set<string>();
  for (const outcome of step.outcomes) {
    if (outcome.id === 'skip' || outcome.id === 'custom_script') continue;
    for (const goal of conditionGoalsForItemOutcome(step, outcome.id)) {
      const opposite = oppositeFailureGoal(goal);
      if (opposite) ids.add(opposite.eventId);
    }
  }
  return ids;
}

/** Whether a success row was produced by the per-item wizard for a given mat object. */
export function goalBelongsToWizardStep(
  goal: ConditionGoalInput,
  step: ItemSuccessWizardStep
): boolean {
  const eventId = goal.eventId;
  const nodeId = step.nodeId;
  if (step.itemKind === 'can') {
    const canRule = new RegExp(
      `^${nodeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(KnockedOver|Upright|Touched|NotKnockedOver)$`,
      'i'
    );
    if (canRule.test(eventId)) return true;
  }
  if (step.itemKind === 'ream') {
    const reamRule = new RegExp(
      `^${nodeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(StopNear|Touched)$`,
      'i'
    );
    if (reamRule.test(eventId)) return true;
  }
  const labelPrefix = `${step.displayName}:`;
  if (goal.label.startsWith(labelPrefix)) return true;
  return false;
}

/** Rebuild per-item wizard choices from saved success goals (best-effort). */
export function inferItemSuccessChoicesFromGoals(
  worldItemKeys: string[],
  geometryKeys: string[],
  worldItems: WorldSceneItem[],
  goals: ConditionGoalInput[]
): Record<string, ItemSuccessOutcomeId> {
  const steps = buildItemSuccessWizardSteps(worldItemKeys, geometryKeys, worldItems);
  const choices: Record<string, ItemSuccessOutcomeId> = {};

  for (const step of steps) {
    for (const outcome of step.outcomes) {
      if (outcome.id === 'skip' || outcome.id === 'custom_script') continue;
      const forOutcome = conditionGoalsForItemOutcome(step, outcome.id);
      if (forOutcome.some(g => goals.some(sg => sg.eventId === g.eventId))) {
        choices[step.id] = outcome.id;
        break;
      }
    }
    if (choices[step.id] !== undefined || step.itemKind !== 'ream') continue;
    const labelPrefix = `${step.displayName}:`;
    const forStep = goals.filter(g => g.label.startsWith(labelPrefix));
    if (forStep.some(g => /StopNear$/i.test(g.eventId))) {
      choices[step.id] = 'stop_near';
    } else if (forStep.some(g => /Touched$/i.test(g.eventId))) {
      choices[step.id] = 'robot_touch';
    }
  }

  return choices;
}

/** All success goals implied by item-wizard choices (mat items + geometries). */
export function conditionGoalsFromItemWizardChoices(
  worldItemKeys: string[],
  geometryKeys: string[],
  worldItems: WorldSceneItem[],
  choices: Record<string, ItemSuccessOutcomeId>
): ConditionGoalInput[] {
  const steps = buildItemSuccessWizardSteps(worldItemKeys, geometryKeys, worldItems);
  const goals: ConditionGoalInput[] = [];
  for (const step of steps) {
    const outcomeId = choices[step.id];
    if (!outcomeId || outcomeId === 'skip' || outcomeId === 'custom_script') {
      continue;
    }
    goals.push(...conditionGoalsForItemOutcome(step, outcomeId));
  }
  return goals;
}

/** Success goals for an item wizard choice (catalog or custom per-can events). */
function singleMarkerGoalForItemOutcome_(
  step: ItemSuccessWizardStep,
  outcomeId: ItemSuccessOutcomeId
): ConditionGoalInput | null {
  const option = step.outcomes.find(o => o.id === outcomeId);
  if (!option || outcomeId === 'skip' || outcomeId === 'custom_script') return null;

  const label = `${step.displayName}: ${option.title}`;
  const goal = (suffix: string, eventId = `${step.nodeId}${suffix}`): ConditionGoalInput => ({
    eventId: sanitizeChallengeEventId(eventId),
    label,
    latchOnce: true,
  });

  switch (outcomeId) {
    case 'cover_location':
      return goal('Covered');
    case 'robot_touch':
    case 'robot_reach':
      return goal('Reached');
    case 'robot_inside':
      if (step.nodeId === 'startBox') return goal('', 'inStartBox');
      if (step.nodeId === 'notStartBox') return goal('', 'notInStartBox');
      return goal('Inside', `in${step.nodeId}`);
    case 'sequence_touch':
      return goal('Touched');
    default:
      return null;
  }
}

export function conditionGoalsForItemOutcome(
  step: ItemSuccessWizardStep,
  outcomeId: ItemSuccessOutcomeId
): ConditionGoalInput[] {
  if (step.itemKind === 'can') {
    const name = step.displayName;
    switch (outcomeId) {
      case 'knock_over':
        return [
          {
            eventId: sanitizeChallengeEventId(`${step.nodeId}KnockedOver`),
            label: String(
              LocalizedString.lookup(
                tr('{name}: Robot knocks over this can'),
                LocalizedString.EN_US
              )
            ).replace('{name}', name),
            latchOnce: true,
          },
        ];
      case 'stay_upright':
        return [
          {
            eventId: sanitizeChallengeEventId(`${step.nodeId}Upright`),
            label: String(
              LocalizedString.lookup(
                tr('{name}: This can stays upright'),
                LocalizedString.EN_US
              )
            ).replace('{name}', name),
            latchOnce: true,
          },
        ];
      case 'robot_touch':
        return [
          {
            eventId: sanitizeChallengeEventId(`${step.nodeId}Touched`),
            label: String(
              LocalizedString.lookup(
                tr('{name}: Robot touches this can'),
                LocalizedString.EN_US
              )
            ).replace('{name}', name),
            latchOnce: true,
          },
        ];
      default:
        break;
    }
  }

  if (step.itemKind === 'ream') {
    const name = step.displayName;
    switch (outcomeId) {
      case 'stop_near':
        return [
          {
            eventId: sanitizeChallengeEventId(`${step.nodeId}StopNear`),
            label: String(
              LocalizedString.lookup(
                tr('{name}: Robot stops near the ream without bumping it'),
                LocalizedString.EN_US
              )
            ).replace('{name}', name),
            latchOnce: true,
          },
        ];
      case 'robot_touch':
        return [
          {
            eventId: sanitizeChallengeEventId(`${step.nodeId}Touched`),
            label: String(
              LocalizedString.lookup(
                tr('{name}: Robot bumps or touches the ream'),
                LocalizedString.EN_US
              )
            ).replace('{name}', name),
            latchOnce: true,
          },
        ];
      default:
        break;
    }
  }

  const markerGoal = singleMarkerGoalForItemOutcome_(step, outcomeId);
  if (markerGoal) {
    return [markerGoal];
  }

  const catalog = catalogGoalsForOutcome(step, outcomeId);
  if (catalog.length > 0) {
    return catalog.map(entry => ({
      eventId: entry.eventId,
      label: `${step.displayName}: ${entry.label}`,
      latchOnce: entry.latchOnce,
    }));
  }

  return [];
}
