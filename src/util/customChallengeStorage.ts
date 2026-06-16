import Challenge, { Goal } from '../state/State/Challenge';
import Scene from '../state/State/Scene';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';
import Dict from './objectOps/Dict';
import Event from '../state/State/Challenge/Event';
import Predicate from '../state/State/Challenge/Predicate';
import { isCustomChallengeId } from './customChallengeFactory';
import LocalizedString from './LocalizedString';

/** Challenge rules and code stored on the scene document (not the challenge collection). */
export interface CustomChallengeDefinition {
  code: { [language in ProgrammingLanguage]?: string };
  defaultLanguage: ProgrammingLanguage;
  events: Dict<Event>;
  success?: Predicate;
  failure?: Predicate;
  successGoals?: Goal[];
  failureGoals?: Goal[];
}

export function customChallengeDefinitionFromChallenge(
  challenge: Challenge
): CustomChallengeDefinition {
  return {
    code: challenge.code,
    defaultLanguage: challenge.defaultLanguage,
    events: challenge.events,
    success: challenge.success,
    failure: challenge.failure,
    successGoals: challenge.successGoals,
    failureGoals: challenge.failureGoals,
  };
}

const emptyCustomChallengeDefinition_ = (): CustomChallengeDefinition => ({
  code: {},
  defaultLanguage: 'c',
  events: {},
});

export function challengeFromScene(sceneId: string, scene: Scene): Challenge | null {
  if (!isCustomChallengeId(sceneId) && !scene.customChallenge) {
    return null;
  }
  const def = scene.customChallenge ?? emptyCustomChallengeDefinition_();
  return {
    name: scene.name,
    description: scene.description,
    author: scene.author,
    sceneId,
    code: def.code,
    defaultLanguage: def.defaultLanguage,
    events: def.events,
    success: def.success,
    failure: def.failure,
    successGoals: def.successGoals,
    failureGoals: def.failureGoals,
  };
}

export function sceneWithCustomChallenge(scene: Scene, challenge: Challenge): Scene {
  return {
    ...scene,
    name: challenge.name,
    description: challenge.description,
    author: challenge.author,
    customChallenge: customChallengeDefinitionFromChallenge(challenge),
  };
}

export function isCustomChallengeScene(sceneId: string, scene: Scene): boolean {
  return isCustomChallengeId(sceneId) || !!scene.customChallenge;
}

const CUSTOM_CHALLENGE_START_HANDOFF_PREFIX = 'custom-jbc-start:';
const CUSTOM_CHALLENGE_TOUR_SANDBOX_HANDOFF_KEY = 'custom-jbc-tour:sandbox-open-world';

export interface CustomChallengeStartHandoff {
  challengeId: string;
  name?: LocalizedString;
  description?: LocalizedString;
}

function customChallengeStartHandoffKey_(challengeId: string): string {
  return `${CUSTOM_CHALLENGE_START_HANDOFF_PREFIX}${challengeId}`;
}

export function saveCustomChallengeStartHandoff(
  challengeId: string,
  scene: Scene
): void {
  if (!isCustomChallengeId(challengeId) || typeof window === 'undefined') return;
  const handoff: CustomChallengeStartHandoff = {
    challengeId,
    name: scene.name,
    description: scene.description,
  };
  try {
    window.sessionStorage.setItem(
      customChallengeStartHandoffKey_(challengeId),
      JSON.stringify(handoff)
    );
  } catch {
    // Navigation should still work if browser storage is unavailable.
  }
}

export function loadCustomChallengeStartHandoff(
  challengeId: string
): CustomChallengeStartHandoff | null {
  if (!isCustomChallengeId(challengeId) || typeof window === 'undefined') return null;
  let raw: string | null;
  try {
    raw = window.sessionStorage.getItem(
      customChallengeStartHandoffKey_(challengeId)
    );
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CustomChallengeStartHandoff;
    return parsed.challengeId === challengeId ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCustomChallengeTourSandboxHandoff(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(CUSTOM_CHALLENGE_TOUR_SANDBOX_HANDOFF_KEY, '1');
  } catch {
    // The challenge should still be created if browser storage is unavailable.
  }
}

export function consumeCustomChallengeTourSandboxHandoff(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const hasHandoff =
      window.sessionStorage.getItem(CUSTOM_CHALLENGE_TOUR_SANDBOX_HANDOFF_KEY) === '1';
    window.sessionStorage.removeItem(CUSTOM_CHALLENGE_TOUR_SANDBOX_HANDOFF_KEY);
    return hasHandoff;
  } catch {
    return false;
  }
}
