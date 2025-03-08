import {
  TransformNode, AbstractMesh, CreateBox, CreateSphere, CreateCylinder, PhysicsShapeType,
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
import Console from 'components/EditorConsole';

export type FrameLike = TransformNode | AbstractMesh;

export interface BuiltGeometry {
  nonCollider?: BuiltGeometry.Mesher;
  collider: BuiltGeometry.Mesher;
}

export namespace BuiltGeometry {
  export interface Mesher {
    name: string;
    mesh: AbstractMesh;
    type: number;
  }
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

export const buildGeometry = async (name: string, geometry: Geometry, bScene_: babylonScene, faceUvs?: RawVector2[]): Promise<BuiltGeometry> => {
  const nonColliders: BuiltGeometry.Mesher[] = [];
  const colliders: BuiltGeometry.Mesher[] = [];
  const ret: BuiltGeometry = { nonCollider: undefined, collider: undefined };

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
      colliders.push({ name, mesh: rect, type: PhysicsShapeType.MESH });
      // const visual = rect.createInstance(`${rect.name}-instanced`);
      // nonColliders.push({ name: visual.name, mesh: visual, type: PhysicsShapeType.MESH });
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
      colliders.push({ name, mesh: rock, type: PhysicsShapeType.MESH });
      nonColliders.push({ name, mesh: rock, type: PhysicsShapeType.MESH });
      break;
    }
    case 'cylinder': {
      const cyl = CreateCylinder(name, {
        height: Distance.toCentimetersValue(geometry.height),
        diameterTop: Distance.toCentimetersValue(geometry.radius) * 2,
        diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
        faceUV: buildGeometryFaceUvs(faceUvs, 6),
      }, bScene_);
      colliders.push({ name, mesh: cyl, type: PhysicsShapeType.MESH });
      nonColliders.push({ name, mesh: cyl, type: PhysicsShapeType.MESH });
      break;
    }
    case 'cone': {
      const cone = CreateCylinder(name, {
        diameterTop: 0,
        height: Distance.toCentimetersValue(geometry.height),
        diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
        faceUV: buildGeometryFaceUvs(faceUvs, 6),
      }, bScene_);
      colliders.push({ name, mesh: cone, type: PhysicsShapeType.MESH });
      nonColliders.push({ name, mesh: cone, type: PhysicsShapeType.MESH });
      break;
    }
    case 'plane': {
      const plane = CreatePlane(name, {
        width: Distance.toCentimetersValue(geometry.size.x),
        height: Distance.toCentimetersValue(geometry.size.y),
        frontUVs: buildGeometryFaceUvs(faceUvs, 2)?.[0],
      }, bScene_);
      colliders.push({ name, mesh: plane, type: PhysicsShapeType.MESH });
      nonColliders.push({ name, mesh: plane, type: PhysicsShapeType.MESH });
      break;
    }
    case 'file': {
      const index = geometry.uri.lastIndexOf('/');
      const fileName = geometry.uri.substring(index + 1);
      const baseName = geometry.uri.substring(0, index + 1);

      const res = await SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, bScene_);
      if (res.meshes.length === 1) {
        console.log(`No collider found for ${name}\nUsing only mesh as both`);
        colliders.push({ name, mesh: res.meshes[0], type: PhysicsShapeType.MESH });
        nonColliders.push({ name: res.meshes[0].name, mesh: res.meshes[0], type: PhysicsShapeType.MESH });
        break;
      }

      for (const mesh of res.meshes as Mesh[]) {
        // GLTF importer adds a __root__ mesh (always the first one) that we can ignore 
        if (mesh.name === '__root__') continue;
        // nonColliders.push(mesh);
        if (mesh.name.startsWith('collider')) {
          console.log(`Adding collider: ${mesh.name}`);
          colliders.push({ name: mesh.name, mesh: mesh, type: PhysicsShapeType.MESH });
        } else {
          nonColliders.push({ name: mesh.name, mesh: mesh, type: PhysicsShapeType.MESH });
        }
      }
      // const mesh = Mesh.MergeMeshes(nonColliders, true, true, undefined, false, true);

      break;
    }
    default: {
      throw new Error(`Unsupported geometry type: ${geometry.type}`);
    }
  }
  // Check non-colliders
  if (nonColliders.length === 1) {
    ret.nonCollider = nonColliders[0];
    ret.nonCollider.mesh.visibility = 1;
  } else if (nonColliders.length > 1) {
    console.log(`Getting children of ${name}`);
    // const children = ncParent.getChildren(c => c instanceof AbstractMesh) as Mesh[];
    const mesh = Mesh.MergeMeshes(nonColliders.map(nc => nc.mesh as Mesh), true, true, undefined, false, true);
    console.log(mesh);
    mesh.visibility = 1;
    ret.nonCollider = { name: nonColliders[0].name, mesh: mesh, type: PhysicsShapeType.MESH };
  }
  // Check colliders
  if (colliders.length === 1) {
    ret.collider = colliders[0];
    ret.collider.mesh.visibility = 0;
  } else {
    console.log(`Getting children of ${name}`);
    // const children = ncParent.getChildren(c => c instanceof AbstractMesh) as Mesh[];
    const mesh = Mesh.MergeMeshes(colliders.map(c => c.mesh as Mesh), true, true, undefined, false, true);
    mesh.visibility = 0;
    ret.nonCollider = { name: colliders[0].name, mesh: mesh, type: PhysicsShapeType.MESH };
  }

  return ret;
};

export const createObject = async (node: Node.Obj, nextScene: Scene, parent: babylonNode, bScene_: babylonScene): Promise<babylonNode> => {
  // if (Object.keys(nextScene.geometry).includes(node.geometryId)) {
  //   console.log(`src/simulator/babylonBindings/createSceneObjects/createObjects.ts: createObject: Found duplicate of ${node.geometryId}`);
  // }

  // let ret: FrameLike;

  // // Use instancing on duplicate meshes
  // const dups = bScene_.meshes.filter((m) => m.id.includes(node.geometryId));
  // // console.log(dups);
  // // console.log(bScene_.meshes);
  // if (dups.length > 0) {
  //   const dup = dups[0] as Mesh;
  //   ret = dup.createInstance(`${dup.name}-next`);
  //   console.log(`Creating instanced mesh ${dup.name}-next`);
  //   if (ret instanceof Mesh) {
  //     ret.visibility = 1;
  //   }
  //   return ret;
  // }
  const geometry = nextScene.geometry[node.geometryId] ?? preBuiltGeometries[node.geometryId];
  if (!geometry) {
    console.error(`node ${LocalizedString.lookup(node.name, LocalizedString.EN_US)} has invalid geometry ID: ${node.geometryId}`);
    return null;
  }
  const bg = (await buildGeometry(node.name[LocalizedString.EN_US], geometry, bScene_, node.faceUvs));
  node.colliderId = bg.collider.name;
  const collider = bg.collider.mesh as Mesh;
  let ret = bg.collider.mesh;
  if (!node.visible) {
    console.log(`Making ${node.name[LocalizedString.EN_US]} invisible`);
    apply(collider, m => m.isVisible = false);
  }
  if (node.material) {
    console.log(`Creating material for ${node.name[LocalizedString.EN_US]}`);
    const material = createMaterial(node.name[LocalizedString.EN_US], node.material, bScene_);
    apply(collider, m => m.material = material);
  }
  return collider;
  if (!bg.nonCollider) {
    console.log(`Instancing ${collider.id} for visual mesh`);
    collider.isVisible = false;
    ret = collider.createInstance(`${collider.id}-instance`);
    ret.position = collider.position;
  }
  ret.setParent(parent);
  return ret;
};

export const createEmpty = (node: Node.Empty, parent: babylonNode, bScene_: babylonScene): TransformNode => {

  const ret = new TransformNode(node.name[LocalizedString.EN_US], bScene_);
  ret.setParent(parent);
  return ret;
};
