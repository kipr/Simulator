import fs from 'fs';
import path from 'path';
import {
  AbstractMesh, HavokPlugin, Mesh, MeshoptCompression, NullEngine, PhysicsBody,
  PhysicsMotionType, PhysicsShape, PhysicsShapeCapsule, PhysicsShapeContainer,
  PhysicsShapeMesh, Scene, SceneLoader, Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {
  FALL_27_GAME_PIECE_NODES, FALL_27_TABLE_GEOMETRY, FALL_27_TABLE_NODES,
} from '../../src/simulator/definitions/scenes/2027FallGameTable';
import { buildGeometry } from '../../src/simulator/babylonBindings/createSceneObjects/createObjects';
import { torusCapsuleSegments } from '../../src/simulator/babylonBindings/torusCollider';
import Node from '../../src/state/State/Scene/Node';
import { ReferenceFramewUnits } from '../../src/util/math/unitMath';

jest.mock('../../src/simulator/definitions/nodes', () => ({ preBuiltGeometries: {} }));

const HavokPhysics = require('@babylonjs/havok');
const wasmBinary = fs.readFileSync(path.join(path.dirname(require.resolve('@babylonjs/havok')), 'HavokPhysics.wasm'));
const decoder = require('../../static/meshopt_decoder.js');

describe('fall game ring/post collisions', () => {
  beforeEach(() => {
    // Decode the checked-in GLBs locally, using the same importer as the app.
    jest.spyOn(MeshoptCompression, 'Default', 'get').mockReturnValue({
      decodeGltfBufferAsync: async (source, count, stride, mode, filter) => {
        await decoder.ready;
        const result = new Uint8Array(count * stride);
        decoder.decodeGltfBuffer(result, count, stride, source, mode, filter);
        return result;
      },
      dispose: () => {},
    } as MeshoptCompression);
    const importMesh = SceneLoader.ImportMeshAsync.bind(SceneLoader);
    jest.spyOn(SceneLoader, 'ImportMeshAsync').mockImplementation((names, root, file, scene) => {
      const data = fs.readFileSync(path.join(__dirname, '../..', root, file as string));
      return importMesh(names, '', `data:;base64,${data.toString('base64')}`, scene, undefined, '.glb');
    });
  });
  afterEach(() => jest.restoreAllMocks());

  it.each([
    { postId: 'fall27_pvc_13', fittingId: 'fall27_t_connector_15', firstRing: 0 },
    { postId: 'fall27_pvc_12', fittingId: 'fall27_t_connector_1', firstRing: 3 },
  ])('keeps the lower rings on $postId when the top ring is dragged away', async ({ postId, fittingId, firstRing }) => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    // This is essential: the app uses a right-handed scene. Left-handed GLB
    // imports reflect the fitting and hide rings embedded in its upright socket.
    scene.useRightHandedSystem = true;
    const shapes: PhysicsShape[] = [];
    const children: PhysicsShapeCapsule[] = [];
    try {
      scene.enablePhysics(new Vector3(0, -98, 0), new HavokPlugin(true, await HavokPhysics({ wasmBinary })));
      const create = async (node: Node.Obj) => {
        const geometry = FALL_27_TABLE_GEOMETRY[node.geometryId];
        const mesh = (await buildGeometry(node.geometryId, geometry, scene)).visual;
        const origin = ReferenceFramewUnits.toBabylon(node.origin, 'centimeters');
        mesh.position.copyFrom(origin.position);
        mesh.rotationQuaternion = origin.rotationQuaternion;
        mesh.scaling.copyFrom(origin.scaling);
        mesh.computeWorldMatrix(true);
        return mesh;
      };
      const attach = (mesh: AbstractMesh, motion: PhysicsMotionType, shape: PhysicsShape) => {
        const body = new PhysicsBody(mesh, motion, true, scene);
        body.setMassProperties({ mass: motion === PhysicsMotionType.DYNAMIC ? 5 : 0 });
        body.shape = shape;
        shapes.push(shape);
      };
      for (const id of [postId, fittingId]) {
        const node = FALL_27_TABLE_NODES[id] as Node.Obj;
        const mesh = await create(node);
        attach(mesh, PhysicsMotionType.STATIC, new PhysicsShapeMesh(mesh as Mesh, scene));
      }
      const rings: AbstractMesh[] = [];
      for (let i = firstRing; i < firstRing + 3; i++) {
        const mesh = await create(FALL_27_GAME_PIECE_NODES[`fall27_ring_${i}`] as Node.Obj);
        const bounds = mesh.getRawBoundingInfo().boundingBox;
        const segments = torusCapsuleSegments(bounds.extendSize.scale(2), bounds.center);
        const shape = new PhysicsShapeContainer(scene);
        for (const { pointA, pointB, radius } of segments) {
          const capsule = new PhysicsShapeCapsule(
            new Vector3(pointA.x, pointA.y, pointA.z),
            new Vector3(pointB.x, pointB.y, pointB.z), radius, scene,
          );
          capsule.material = { friction: 1, restitution: 0.2 };
          shape.addChild(capsule);
          children.push(capsule);
        }
        attach(mesh, PhysicsMotionType.DYNAMIC, shape);
        rings.push(mesh);
      }
      const initial = rings.map(mesh => mesh.position.clone());
      const physics = scene.getPhysicsEngine();
      for (let i = 0; i < 100; i++) physics._step(0.001);
      // Match the start of a gizmo drag. No force or artificial penetration is
      // applied to the lower rings: removing the top body's contacts wakes them.
      rings[2].physicsBody.dispose();
      rings[2].physicsBody = null;
      rings[2].position.y += 40;
      for (let i = 0; i < 3000; i++) physics._step(0.001);

      for (let i = 0; i < 2; i++) {
        expect(Vector3.Distance(rings[i].position, initial[i])).toBeLessThan(0.05);
      }
      expect(rings[1].position.y - rings[0].position.y).toBeGreaterThan(0.85);
    } finally {
      scene.dispose();
      shapes.forEach(shape => shape.dispose());
      children.forEach(shape => shape.dispose());
      engine.dispose();
    }
  });
});
