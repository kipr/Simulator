import { Color3, NullEngine, Scene, StandardMaterial } from '@babylonjs/core';
import { createMaterial, updateMaterialBasic } from '../../src/simulator/babylonBindings/createSceneObjects/createMaterials';
import Material from '../../src/state/State/Scene/Material';
import Patch from '../../src/util/redux/Patch';

const textured: Material.Basic = {
  type: 'basic',
  color: { type: 'texture', uri: '/static/textures/2026_bex_mat.webp' },
};

describe('matte basic materials', () => {
  let engine: NullEngine;
  let scene: Scene;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
  });

  afterEach(() => {
    scene.dispose();
    engine.dispose();
  });

  it('keeps diffuse lighting but removes highlights, bump and emission', () => {
    const material = createMaterial('mat', { ...textured, matte: true }, scene) as StandardMaterial;
    expect(material.specularColor).toEqual(Color3.Black());
    expect(material.diffuseTexture?.name).toBe(textured.color.type === 'texture' ? textured.color.uri : '');
    expect(material.bumpTexture).toBeNull();
    expect(material.emissiveTexture).toBeNull();
    expect(material.disableLighting).toBe(false);
  });

  it('preserves existing textured materials by default', () => {
    const material = createMaterial('other', textured, scene) as StandardMaterial;
    expect(material.specularColor).not.toEqual(Color3.Black());
    expect(material.bumpTexture).not.toBeNull();
    expect(material.emissiveTexture).not.toBeNull();
  });

  it('recreates the material when matte changes in either direction', () => {
    const matte = { ...textured, matte: true };
    expect(Material.diff(textured, matte).type).toBe(Patch.Type.OuterChange);
    expect(Material.diff(matte, textured).type).toBe(Patch.Type.OuterChange);
  });

  it('retains the matte setting when updating the texture', () => {
    const prev = { ...textured, matte: true };
    const next: Material.Basic = {
      ...prev,
      color: { type: 'texture', uri: '/static/textures/replacement.webp' },
    };
    const patch = Material.Basic.diff(prev, next);
    expect(patch.type).toBe(Patch.Type.InnerChange);
    expect(Patch.apply(patch, prev)).toEqual(next);
    if (patch.type !== Patch.Type.InnerChange) throw new Error('Expected an inner change');

    const material = createMaterial('mat', prev, scene) as StandardMaterial;
    updateMaterialBasic(material, patch.inner, scene);
    expect(material.specularColor).toEqual(Color3.Black());
    expect(material.diffuseTexture?.name).toBe('/static/textures/replacement.webp');
    expect(material.bumpTexture).toBeNull();
    expect(material.emissiveTexture).toBeNull();
  });
});
