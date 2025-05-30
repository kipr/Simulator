
import {
  Scene as babylonScene, Vector3, Mesh, SceneLoader, PhysicsBody, PhysicsMotionType, PhysicsShape,
  PhysicsAggregate, PhysicsShapeType, PhysicShapeOptions, PhysicsShapeParameters, PhysicsShapeContainer,
  GizmoManager,
  Color3
} from '@babylonjs/core';

import Geometry from '../../../state/State/Robot/Geometry';
import Node from '../../../state/State/Robot/Node';
import { RENDER_SCALE_METERS_MULTIPLIER } from '../../../components/constants/renderConstants';
import Robot from '../../../state/State/Robot';
import { Mass } from '../../../util/math/Value';


export interface BuiltGeometry {
  nonColliders: Mesh[];
  colliders?: BuiltGeometry.Collider[];
}

export namespace BuiltGeometry {
  export interface Collider {
    name: string;
    mesh: Mesh;
    type: number;
    volume: number;
  }
}

// Loads the geometry of a robot part and divides into the collider and noncollider pieces
const buildGeometry_ = async (name: string, geometry: Geometry, bScene_: babylonScene): Promise<BuiltGeometry> => {
  let ret: BuiltGeometry;
  switch (geometry.type) {
    case 'remote-mesh': {
      const index = geometry.uri.lastIndexOf('/');
      const fileName = geometry.uri.substring(index + 1);
      const baseName = geometry.uri.substring(0, index + 1);

      const res = await SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, bScene_);

      const nonColliders: Mesh[] = [];
      const colliders: BuiltGeometry.Collider[] = [];
      // Comment in to show bounding boxes on robot
      // const gizmoManager_ = new GizmoManager(bScene_);
      // gizmoManager_.boundingBoxGizmoEnabled = true;
      // gizmoManager_.gizmos.boundingBoxGizmo.setColor(new Color3(0, 0, 1));
      for (const mesh of res.meshes.slice(1) as Mesh[]) {
        // The robot mesh includes sub-meshes with the 'collider' name to indicate their use.
        if (mesh.name.startsWith('collider')) {
          const parts = mesh.name.split('-');
          if (parts.length !== 3) throw new Error(`Invalid collider name: ${mesh.name}`);
          const [_, type, name] = parts;
          const { extendSize } = mesh.getBoundingInfo().boundingBox;
          const volume = extendSize.x * extendSize.y * extendSize.z;
          let bType: number;
          switch (type) {
            case 'box': bType = PhysicsShapeType.BOX; break;
            case 'sphere': bType = PhysicsShapeType.SPHERE; break;
            case 'cylinder': bType = PhysicsShapeType.CYLINDER; break;
            case 'capsule': bType = PhysicsShapeType.CAPSULE; break;
            case 'plane': bType = PhysicsShapeType.HEIGHTFIELD; break;
            case 'mesh': bType = PhysicsShapeType.MESH; break;
            default: throw new Error(`Invalid collider type: ${type}`);
          }
          colliders.push({ mesh, type: bType, name, volume });
        } else {
          nonColliders.push(mesh);
        }
      }
      ret = { nonColliders, colliders };
      break;
    }
    default: { throw new Error(`Unsupported geometry type: ${geometry.type}`); }
  }
  return ret;
};



// Creates a link and returns the root mesh. Links are wheels, chasis, arms, etc.
// Loads the geometry and adds the appropriate physics properties to the mesh
export const createLink = async (id: string, link: Node.Link, bScene_: babylonScene, robot_: Robot, colliders_: Set<Mesh>) => {
  let builtGeometry: BuiltGeometry;
  if (link.geometryId === undefined) {
    builtGeometry = { nonColliders: [new Mesh(id, bScene_)] };
  } else {
    const geometry = robot_.geometry[link.geometryId];
    if (!geometry) throw new Error(`Missing geometry: ${link.geometryId}`);
    builtGeometry = await buildGeometry_(id, geometry, bScene_);
  }

  const meshes = builtGeometry.nonColliders;
  let myMesh: Mesh;

  switch (link.collisionBody.type) {
    // Notes on Links - the root link should have the highest mass and inertia and it should 
    // scale down further out the tree to prevent wild oscillations. 
    // body.setMassProperties can also help setting the inertia vector,
    // body.setAngularDamping and body.setLinearDamping can help with oscillations
    case Node.Link.CollisionBody.Type.Box: {
      // alert("box collision body"); // Currently there are no box collision bodies in the robot model
      myMesh = Mesh.MergeMeshes(meshes, true, true, undefined, false, true);
      myMesh.scaling.scaleInPlace(RENDER_SCALE_METERS_MULTIPLIER);
      const aggregate = new PhysicsAggregate(myMesh, PhysicsShapeType.BOX, {
        mass: Mass.toGramsValue(link.mass || Mass.grams(10)),
        friction: link.friction ?? 0.5,
        restitution: link.restitution ?? 0,
        startAsleep: true,
      }, bScene_);
      colliders_.add(myMesh);
      break;
    }
    case Node.Link.CollisionBody.Type.Cylinder: {
      myMesh = Mesh.MergeMeshes(meshes, true, true, undefined, false, true);
      const scale = link.scale ?? 1;
      // myMesh.scaling.y *= 1 / scale;
      myMesh.scaling.scaleInPlace(RENDER_SCALE_METERS_MULTIPLIER);

      const aggregate = new PhysicsAggregate(myMesh, PhysicsShapeType.CYLINDER, {
        mass: Mass.toGramsValue(link.mass || Mass.grams(10)),
        friction: link.friction ?? 0.5,
        restitution: link.restitution ?? 0,
        startAsleep: true,
      }, bScene_);
      colliders_.add(myMesh);
      break;
    }
    case Node.Link.CollisionBody.Type.Embedded: {
      myMesh = Mesh.MergeMeshes(meshes, true, true, undefined, false, true);
      myMesh.scaling.scaleInPlace(RENDER_SCALE_METERS_MULTIPLIER);
      // As the embedded collision body consists of multiple meshes, we need to create a parent
      // This mmeans we are unable to use the physics aggregate
      const parentShape = new PhysicsShapeContainer(bScene_);
      for (const collider of builtGeometry.colliders ?? []) {
        const bCollider = collider.mesh;
        bCollider.parent = myMesh;
        const parameters: PhysicsShapeParameters = { mesh: bCollider };
        const options: PhysicShapeOptions = { type: PhysicsShapeType.MESH, parameters: parameters };
        const shape = new PhysicsShape(options, bScene_);
        shape.material = {
          friction: link.friction ?? 0.5,
          restitution: link.restitution ?? 0.1,
        };
        parentShape.addChild(shape, bCollider.absolutePosition, bCollider.absoluteRotationQuaternion);
        bCollider.visibility = 0;
        colliders_.add(bCollider);
      }

      const body = new PhysicsBody(myMesh, PhysicsMotionType.DYNAMIC, false, bScene_);
      body.shape = parentShape;
      if (link.inertia) {
        body.setMassProperties({
          mass: Mass.toGramsValue(link.mass),
          inertia: new Vector3(link.inertia[0], link.inertia[1], link.inertia[2]) // (left/right, twist around, rock forward and backward)
        });
      }
      body.setAngularDamping(.5);

      colliders_.add(myMesh);
      break;
    }
    default: {
      throw new Error(`Unsupported collision body type: ${link.collisionBody.type}`);
    }
  }
  myMesh.isPickable = false;
  return myMesh;
};
