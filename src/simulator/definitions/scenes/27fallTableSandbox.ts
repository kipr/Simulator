import Scene from '../../../state/State/Scene';
import { createBaseSceneSurface } from './27fallTableBase';
import { FALL_27_GAME_PIECE_NODES } from './2027FallGameTable';

import tr from '@i18n';

const baseScene = createBaseSceneSurface();

export const FALL_27_SANDBOX: Scene = {
  ...baseScene,
  name: tr('2026-2027 Fall Game Table'),
  description: tr('2026-2027 Fall Botball game table sandbox'),
  geometry: { ...baseScene.geometry },
  scripts: {},
  nodes: {
    ...baseScene.nodes,
    ...FALL_27_GAME_PIECE_NODES,
  },
};
