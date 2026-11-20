import fs from 'fs';
import path from 'path';

import { MODELS, MODELS_ROOT } from '../../src/simulator/definitions/models';

const legacyModelPaths: Record<string, string> = require('../../legacyModelPaths.json');

const REPO_ROOT = path.join(__dirname, '../..');
const MODELS_DIR = path.join(REPO_ROOT, MODELS_ROOT);

// Models kept for reference but never loaded by the simulator.
const REFERENCE_ONLY = new Set(['games/2027/full_table.glb']);

type Tree = { readonly [key: string]: string | Tree };

const uris = (tree: Tree): string[] => Object.values(tree).flatMap(value => (
  typeof value === 'string' ? [value] : uris(value)
));

const listFiles = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? listFiles(full) : [path.relative(MODELS_DIR, full).split(path.sep).join('/')];
});

const manifestPaths = uris(MODELS).map(uri => uri.slice(MODELS_ROOT.length + 1));
const glbFiles = listFiles(MODELS_DIR).filter(file => file.endsWith('.glb'));

describe('MODELS', () => {
  it('points only at files that exist', () => {
    const missing = manifestPaths.filter(file => !fs.existsSync(path.join(MODELS_DIR, file)));
    expect(missing).toEqual([]);
  });

  it('lists every model in static/object_binaries', () => {
    const listed = new Set(manifestPaths);
    const unlisted = glbFiles.filter(file => !listed.has(file) && !REFERENCE_ONLY.has(file));
    expect(unlisted).toEqual([]);
  });

  it('follows the naming rules', () => {
    const badNames = glbFiles.filter(file => !/^[a-z0-9_/]+\.glb$/.test(file));
    expect(badNames).toEqual([]);
  });
});

describe('legacyModelPaths.json', () => {
  const current = new Set(manifestPaths);

  it('redirects only to current models', () => {
    const stale = Object.values(legacyModelPaths).filter(target => !current.has(target));
    expect(stale).toEqual([]);
  });

  it('does not shadow a current model', () => {
    const shadowing = Object.keys(legacyModelPaths).filter(old => current.has(old));
    expect(shadowing).toEqual([]);
  });
});
