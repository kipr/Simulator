import {
  TransformNode, AbstractMesh, CreateBox, CreateSphere, CreateCylinder,
  CreatePlane, Vector4, Mesh, SceneLoader, Scene as babylonScene, Node as babylonNode
} from '@babylonjs/core';

import Geometry from "../../../state/State/Scene/Geometry";
import { RawVector2 } from "../../../util/math/math";
import { Distance } from "../../../util";
import Node from "../../../state/State/Scene/Node";
import Scene from "../../../state/State/Scene";
import LocalizedString from '../../../util/LocalizedString';
import apply from '../Apply';
import { createMaterial } from './createMaterials';
import { preBuiltGeometries } from "../../definitions/nodes";

export type FrameLike = TransformNode | AbstractMesh;

export interface meshPair {
  visual: AbstractMesh;
  collider?: AbstractMesh;
}

let seed_ = 1;

const random = (max: number, min: number) => {
  let x = Math.sin(seed_++) * 10000;
  x = x - Math.floor(x);
  x = ((x - .5) * (max - min)) + ((max + min) / 2);
  return x;
};

export const buildGeometryFaceUvs = (faceUvs: RawVector2[] | undefined, expectedUvs: number): Vector4[] => {
  if (faceUvs?.length !== expectedUvs) {
    return undefined;
  }
  const ret: Vector4[] = [];
  for (let i = 0; i + 1 < faceUvs.length; i += 2) {
    ret.push(new Vector4(faceUvs[i].x, faceUvs[i].y, faceUvs[i + 1].x, faceUvs[i + 1].y));
  }
  return ret;
};

export const buildGeometry = async (name: string, geometry: Geometry, bScene_: babylonScene, faceUvs?: RawVector2[]): Promise<meshPair> => {
  const ret: meshPair = {} as meshPair;
  let parentTNode: TransformNode;
  switch (geometry.type) {
    case 'box': {
      const rect = CreateBox(name, {
        updatable: true,
        width: Distance.toCentimetersValue(geometry.size.x),
        height: Distance.toCentimetersValue(geometry.size.y),
        depth: Distance.toCentimetersValue(geometry.size.z),
        faceUV: buildGeometryFaceUvs(faceUvs, 12),
      }, bScene_);
      const verts = rect.getVerticesData("position");
      ret.visual = rect;
      break;
    }
    case 'sphere': {
      const bFaceUvs = buildGeometryFaceUvs(faceUvs, 2)?.[0];
      const segments = 4;
      const rock = CreateSphere(name, {
        segments: segments,
        updatable: true,
        frontUVs: bFaceUvs,
        sideOrientation: bFaceUvs ? Mesh.DOUBLESIDE : undefined,
        diameterX: Distance.toCentimetersValue(geometry.radius) * 2,
        diameterY: Distance.toCentimetersValue(geometry.radius) * 2 * geometry.squash,
        diameterZ: Distance.toCentimetersValue(geometry.radius) * 2 * geometry.stretch,
      }, bScene_);

      const positions = rock.getVerticesData("position");
      // TODO: Replace with custom rocks from blender
      if (name.includes('Rock')) {
        const skip = [25, 26, 38, 39, 51, 52, 64, 65];
        for (let i = 14; i < 65; i++) {
          if (skip.includes(i)) {
            continue;
          } else {
            positions[3 * i] = positions[3 * i] + random(geometry.noise, -1 * geometry.noise);
            positions[1 + 3 * i] = positions[1 + 3 * i] + random(geometry.noise, -1 * geometry.noise);
            positions[2 + 3 * i] = positions[2 + 3 * i] + random(geometry.noise, -1 * geometry.noise);
          }
        }
      }
      rock.updateVerticesData("position", positions);
      ret.visual = rock;
      break;
    }
    case 'cylinder': {
      ret.visual = CreateCylinder(name, {
        height: Distance.toCentimetersValue(geometry.height),
        diameterTop: Distance.toCentimetersValue(geometry.radius) * 2,
        diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
        faceUV: buildGeometryFaceUvs(faceUvs, 6),
      }, bScene_);
      break;
    }
    case 'cone': {
      ret.visual = CreateCylinder(name, {
        diameterTop: 0,
        height: Distance.toCentimetersValue(geometry.height),
        diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
        faceUV: buildGeometryFaceUvs(faceUvs, 6),
      }, bScene_);
      break;
    }
    case 'plane': {
      ret.visual = CreatePlane(name, {
        width: Distance.toCentimetersValue(geometry.size.x),
        height: Distance.toCentimetersValue(geometry.size.y),
        frontUVs: buildGeometryFaceUvs(faceUvs, 2)?.[0],
      }, bScene_);
      break;
    }
    case 'file': {
      const index = geometry.uri.lastIndexOf('/');
      const fileName = geometry.uri.substring(index + 1);
      const baseName = geometry.uri.substring(0, index + 1);

      const res = await SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, bScene_);
      if (res.meshes.length === 1) return { visual: res.meshes[0] };
      parentTNode = new TransformNode(geometry.uri, bScene_);
      for (const mesh of res.meshes as Mesh[]) {
        // GLTF importer adds a __root__ mesh (always the first one) which we can ignore 
        if (mesh.name === '__root__') continue;
        if (mesh.name.startsWith('collider')) {
          ret.collider = mesh;
          continue;
        }
        mesh.setParent(parentTNode);
      }
      break;
    }
    default: {
      throw new Error(`Unsupported geometry type: ${geometry.type}`);
    }
  }
  if (parentTNode) {
    const children = parentTNode.getChildren(c => c instanceof AbstractMesh) as Mesh[];
    const mesh = Mesh.MergeMeshes(children, true, true, undefined, false, true);
    ret.visual = mesh;
  }

  ret.visual.visibility = 1;
  return ret;
};

export const createObject = async (node: Node.Obj, nextScene: Scene, parent: babylonNode, bScene_: babylonScene): Promise<babylonNode> => {

  const geometry = nextScene.geometry[node.geometryId] ?? preBuiltGeometries[node.geometryId];
  if (!geometry) {
    console.error(`node ${LocalizedString.lookup(node.name, LocalizedString.EN_US)} has invalid geometry ID: ${node.geometryId}`);
    return null;
  }

  let ret: meshPair = { visual: null };

  /*
   * Search the scene to check if there is an existing node we can instance.
   * If so, we save significant resources by using instancing and we avoid building and storing multiple copies of the same geometry.
   * For more on instances see: https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/instances
   */
  const match = bScene_.meshes.filter(m => m.name.startsWith(node.geometryId))[0];
  if (match && match instanceof Mesh) {
    ret.visual = match.createInstance(`${match.name}-instance`);

    if (!node.visible) {
      apply(ret.visual, m => m.isVisible = false);
    }

    ret.visual.setParent(parent);
    return ret.visual;
  }

  ret = await buildGeometry(node.name[LocalizedString.EN_US], geometry, bScene_, node.faceUvs);
  if (ret.collider) {
    apply(ret.collider, m => m.isVisible = false);
    if (node.physics && !node.physics.colliderId) {
      node.physics.colliderId = ret.collider.id;
    }
  }
  if (!node.visible) {
    apply(ret.visual, m => m.isVisible = false);
  }
  if (node.material) {
    const material = createMaterial(node.name[LocalizedString.EN_US], node.material, bScene_);
    apply(ret.visual, m => m.material = material);
  }
  ret.visual.setParent(parent);
  return ret.visual;
};

export const createEmpty = (node: Node.Empty, parent: babylonNode, bScene_: babylonScene): TransformNode => {

  const ret = new TransformNode(node.name[LocalizedString.EN_US], bScene_);
  ret.setParent(parent);
  return ret;
};
