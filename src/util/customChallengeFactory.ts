import { v4 as uuidv4 } from 'uuid';
import Author from '../db/Author';
import Challenge, { AsyncChallenge } from '../state/State/Challenge';
import Scene, { AsyncScene } from '../state/State/Scene';
import Script from '../state/State/Scene/Script';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';
import LocalizedString from './LocalizedString';
import Async from '../state/State/Async';
import Dict from './objectOps/Dict';
import { JBC_Sandbox } from '../simulator/definitions/scenes/jbcSandbox';
import tr from '@i18n';

export const CUSTOM_CHALLENGE_ID_PREFIX = 'custom-';

export function isCustomChallengeId(challengeId: string): boolean {
  return challengeId.startsWith(CUSTOM_CHALLENGE_ID_PREFIX);
}

/** Scene routes use the same id as the linked challenge for custom JBC challenges. */
export function sceneHasLinkedChallenge(
  sceneId: string | undefined,
  challenges: Dict<AsyncChallenge>,
  scene?: AsyncScene
): boolean {
  if (!sceneId) return false;
  if (isCustomChallengeId(sceneId)) return true;
  if (sceneId in challenges) return true;
  const value = Async.latestValue(scene);
  return !!(value?.matPlayZones?.length || value?.customChallengePlacement);
}

export function newCustomChallengeId(): string {
  return `${CUSTOM_CHALLENGE_ID_PREFIX}${uuidv4()}`;
}

const CHALLENGE_EVENT_HELPER_SCRIPT = Script.ecmaScript(
  'Challenge events (edit me)',
  `// Set challenge events from scene scripts (same as built-in JBC challenges):
// scene.setChallengeEventValue('myEventId', true);
//
// Define matching event ids in the Custom Challenge editor, then wire
// intersections, timers, or sensor logic here.

// example: scene.setChallengeEventValue('goalReached', true);
`
);

export function createSceneFromJbcSandbox(
  author: Author,
  name: LocalizedString,
  description: LocalizedString
): Scene {
  const scene = JSON.parse(JSON.stringify(JBC_Sandbox)) as Scene;
  scene.author = author;
  scene.name = name;
  scene.description = description;
  scene.scripts = {
    ...(scene.scripts ?? {}),
    challengeEventHelper: CHALLENGE_EVENT_HELPER_SCRIPT,
  };
  return scene;
}

export function createCustomChallengeTemplate(
  challengeId: string,
  author: Author,
  name: LocalizedString,
  description: LocalizedString
): Challenge {
  return {
    name,
    description,
    author,
    code: {
      c: ProgrammingLanguage.DEFAULT_CODE.c,
      cpp: ProgrammingLanguage.DEFAULT_CODE.cpp,
      python: ProgrammingLanguage.DEFAULT_CODE.python,
    },
    defaultLanguage: 'c',
    events: {},
    sceneId: challengeId,
  };
}

export function defaultCustomChallengeName(): LocalizedString {
  return tr('My custom challenge');
}

export function defaultCustomChallengeDescription(): LocalizedString {
  return tr('A custom JBC challenge.');
}
