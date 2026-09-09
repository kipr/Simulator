import {
  InstancedMesh,
  Mesh,
  NullEngine,
  Scene as BabylonScene,
  SceneLoader,
  TransformNode,
} from '@babylonjs/core';

import Scene from '../../../../src/state/State/Scene';
import Geometry from '../../../../src/state/State/Scene/Geometry';
import Node from '../../../../src/state/State/Scene/Node';
import LocalizedString from '../../../../src/util/LocalizedString';
import {
  SceneMeshMetadata,
  withSceneNodeId,
} from '../../../../src/simulator/babylonBindings/SceneMeshMetadata';
import { createObject } from '../../../../src/simulator/babylonBindings/createSceneObjects/createObjects';

const fileGeometry = (uri: string): Geometry.File => ({ type: 'file', uri });

const objectNode = (name: string, geometryId: string): Node.Obj => ({
  ...Node.Obj.NIL,
  name: { [LocalizedString.EN_US]: name },
  geometryId,
});

const sceneWithGeometry = (geometry: Scene['geometry']): Scene => ({
  ...Scene.EMPTY,
  geometry,
});

describe('createObject geometry instancing', () => {
  let engine: NullEngine;
  let bScene: BabylonScene;
  let parent: TransformNode;
  let importMesh: jest.SpyInstance;

  beforeEach(() => {
    engine = new NullEngine();
    bScene = new BabylonScene(engine);
    parent = new TransformNode('parent', bScene);
  });

  afterEach(() => {
    importMesh?.mockRestore();
    bScene.dispose();
    engine.dispose();
  });

  it('imports a shared geometry once and instances its tagged source mesh', async () => {
    let importedMeshNumber = 0;
    importMesh = jest.spyOn(SceneLoader, 'ImportMeshAsync').mockImplementation(async () => {
      const mesh = new Mesh(`unrelated-glb-mesh-${importedMeshNumber++}`, bScene);
      mesh.metadata = { imported: true };
      return { meshes: [mesh] } as any;
    });
    const scene = sceneWithGeometry({ prop: fileGeometry('/assets/prop.glb') });

    const first = await createObject(objectNode('First prop', 'prop'), scene, parent, bScene);
    const firstMetadata = first.metadata as SceneMeshMetadata & { imported?: boolean };
    expect(first).toBeInstanceOf(Mesh);
    expect(firstMetadata).toMatchObject({ imported: true, sourceGeometryId: 'prop' });

    // SceneBinding adds the scene node ID after createObject returns. Its merge
    // must preserve the source tag used by the next object lookup.
    first.metadata = withSceneNodeId(firstMetadata, 'first-node');

    const second = await createObject(objectNode('Second prop', 'prop'), scene, parent, bScene);

    expect(importMesh).toHaveBeenCalledTimes(1);
    expect(second).toBeInstanceOf(InstancedMesh);
    expect((second as InstancedMesh).sourceMesh).toBe(first);
  });

  it('does not reuse sources whose geometry IDs only share a prefix', async () => {
    let importedMeshNumber = 0;
    importMesh = jest.spyOn(SceneLoader, 'ImportMeshAsync').mockImplementation(async () => {
      const name = importedMeshNumber++ === 0 ? 'cubeRed-imported-mesh' : 'other-imported-mesh';
      return { meshes: [new Mesh(name, bScene)] } as any;
    });
    const scene = sceneWithGeometry({
      cube: fileGeometry('/assets/cube.glb'),
      cubeRed: fileGeometry('/assets/cube-red.glb'),
    });

    const cube = await createObject(objectNode('Cube', 'cube'), scene, parent, bScene);
    const cubeRed = await createObject(objectNode('Red cube', 'cubeRed'), scene, parent, bScene);

    expect(importMesh).toHaveBeenCalledTimes(2);
    expect(cube).toBeInstanceOf(Mesh);
    expect(cubeRed).toBeInstanceOf(Mesh);
    expect(cubeRed).not.toBeInstanceOf(InstancedMesh);
    expect((cube.metadata as SceneMeshMetadata).sourceGeometryId).toBe('cube');
    expect((cubeRed.metadata as SceneMeshMetadata).sourceGeometryId).toBe('cubeRed');
  });

  it('preserves source and imported metadata when adding the authoritative scene node ID', () => {
    const metadata = withSceneNodeId({
      id: 'glb-owned-id',
      selected: true,
      sourceGeometryId: 'prop',
      imported: true,
    } as SceneMeshMetadata & { imported: boolean }, 'scene-node-id');

    expect(metadata).toMatchObject({
      id: 'scene-node-id',
      imported: true,
      selected: true,
      sourceGeometryId: 'prop',
    });
  });
});
