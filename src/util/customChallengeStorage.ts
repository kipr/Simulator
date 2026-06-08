import Challenge, { Goal } from '../state/State/Challenge';
import Scene from '../state/State/Scene';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';
import Dict from './objectOps/Dict';
import Event from '../state/State/Challenge/Event';
import Predicate from '../state/State/Challenge/Predicate';
import { isCustomChallengeId } from './customChallengeFactory';

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
