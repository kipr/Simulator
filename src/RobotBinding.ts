import * as Babylon from 'babylonjs';
import Robot from './state/State/Robot';
import Node from './state/State/Robot/Node';
import { Quaternion, Vector3 as RawVector3 } from './math';
import { ReferenceFrame, Rotation, Vector3 } from './unit-math';
import { Distance } from './util';
import { FrameLike } from './SceneBinding';
import Geometry from './state/State/Robot/Geometry';
import Patch from './util/Patch';
import Dict from './Dict';

class RobotBinding {
  private bScene_: Babylon.Scene;
  get scene() { return this.bScene_; }

  private root_: Babylon.TransformNode;
  get root() { return this.root_; }

  private robot_: Robot;
  get robot() { return this.robot_; }

  private nodes_: Dict<Babylon.Node> = {};

  constructor(bScene: Babylon.Scene) {
    this.bScene_ = bScene;
    this.root_ = new Babylon.TransformNode('root', this.bScene_);
  }

  private buildGeometry_ = async (name: string, geometry: Geometry): Promise<FrameLike> => {
    let ret: FrameLike;
    switch (geometry.type) {
      case 'remote-mesh': {
        const index = geometry.uri.lastIndexOf('/');
        const fileName = geometry.uri.substring(index + 1);
        const baseName = geometry.uri.substring(0, index + 1);
  
        const res = await Babylon.SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, this.bScene_);
        if (res.meshes.length === 1) return res.meshes[0];
        ret = new Babylon.TransformNode(geometry.uri, this.bScene_);
        for (const mesh of res.meshes) {
          // GLTF importer adds a __root__ mesh (always the first one) that we can ignore 
          if (mesh === res.meshes[0]) continue;

          mesh.setParent(ret);
        }
        break; 
      }
      default: {
        throw new Error(`Unsupported geometry type: ${geometry.type}`);
      }
    }

    if (ret instanceof Babylon.AbstractMesh) {
      ret.visibility = 1;
    } else {
      const children = ret.getChildren(c => c instanceof Babylon.AbstractMesh) as Babylon.AbstractMesh[];
      for (const child of children) {
        child.visibility = 1;
      }
    }

    return ret;
  };

  private updateNodeOrigin_ = (origin: ReferenceFrame, bNode: Babylon.TransformNode | Babylon.Mesh) => {
    origin = origin || {};
    const position: Vector3 = origin.position ?? Vector3.zero();
    const orientation: Rotation = origin.orientation ?? Rotation.Euler.identity();
    const scale = origin.scale ?? RawVector3.ONE;

    bNode.position.set(
      Distance.toCentimetersValue(position.x || Distance.centimeters(0)),
      Distance.toCentimetersValue(position.y || Distance.centimeters(0)),
      Distance.toCentimetersValue(position.z || Distance.centimeters(0))
    );

    bNode.rotationQuaternion = Quaternion.toBabylon(Rotation.toRawQuaternion(orientation));
    bNode.scaling.set(scale.x, scale.y, scale.z);
  };

  private createFrame_ = (id: string, frame: Node.Frame) => {
    const bFrame = new Babylon.TransformNode(id, this.bScene_);
    this.updateNodeOrigin_(frame.origin, bFrame);
    return bFrame;
  };

  private findBNode_ = (id?: string, defaultToRoot?: boolean): Babylon.Node => {
    if (id === undefined && defaultToRoot) return this.root_;
    if (id !== undefined && !(id in this.nodes_)) throw new Error(`${id} doesn't exist`);
    return this.nodes_[id];
  };

  private createMesh_ = async (id: string, mesh: Node.Mesh, robot: Robot) => {
    
    let bMesh: FrameLike;
    if (mesh.geometryId === undefined)
    {
      bMesh = new Babylon.TransformNode(id, this.bScene_);
    }
    else
    {
      const geometry = robot.geometry[mesh.geometryId];
      if (!geometry) throw new Error(`Missing geometry: ${mesh.geometryId}`);
      bMesh = await this.buildGeometry_(id, geometry);
    }

    this.updateNodeOrigin_(mesh.origin, bMesh);



    return bMesh;
  };

  private createNode_ = async (id: string, node: Node, nextRobot: Robot): Promise<Babylon.Node> => {
    switch (node.type) {
      case 'frame': return this.createFrame_(id, node);
      case 'mesh': return await this.createMesh_(id, node, nextRobot);
      default: throw new Error(`Unsupported node type: ${node.type}`);
    }
  }

  private updateFrame_ = (id: string, node: Patch.InnerChange<Node.Frame>): Babylon.TransformNode => {
    const bNode = this.findBNode_(id) as Babylon.TransformNode;

    if (node.inner.parentId.type === Patch.Type.OuterChange) {
      const parent = this.findBNode_(node.inner.parentId.next, true);
      bNode.setParent(parent);
    }

    if (node.inner.origin.type === Patch.Type.OuterChange) {
      this.updateNodeOrigin_(node.next.origin, bNode);
    }

    return bNode;
  };

  private updateMesh_ = async (id: string, node: Patch.InnerChange<Node.Frame>) => {

  };

  private updateNode_ = async (id: string, node: Patch<Node>, geometryPatches: Dict<Patch<Geometry>>, nextRobot: Robot): Promise<Babylon.Node> => {
    switch (node.type) {
      // The node hasn't changed type, but some fields have been changed
      case Patch.Type.InnerChange: {
        switch (node.next.type) {
          case 'frame': this.updateFrame_(id, node as Patch.InnerChange<Node.Frame>); break;
          case 'mesh': await this.updateMesh_(id, node as Patch.InnerChange<Node.Mesh>); break;
          default: {
            console.error('invalid node type for inner change:', (node.next as Node).type);
            return this.findBNode_(id);
          }
        }
      }
      // The node has been wholesale replaced by another type of node
      case Patch.Type.OuterChange: {
        this.destroyNode_(id);
        return this.createNode_(id, node.next, nextRobot);
      }
      // The node was newly added to the scene
      case Patch.Type.Add: {
        return this.createNode_(id, node.next, nextRobot);
      }
      // The node was removed from the scene
      case Patch.Type.Remove: {
        this.destroyNode_(id);

        return undefined;
      }
      case Patch.Type.None: {
        if (node.prev.type === 'mesh') {
          // Even though the node is unchanged, if the underlying geometry changed, recreate the mesh entirely
          const geometryPatch = geometryPatches[node.prev.geometryId];
          if (geometryPatch.type === Patch.Type.InnerChange || geometryPatch.type === Patch.Type.OuterChange) {
            this.destroyNode_(id);
            return this.createNode_(id, node.prev, nextRobot);
          }
        }

        return this.findBNode_(id);
      }
    }
  };

  private destroyNode_ = (id: string) => {
    const bNode = this.findBNode_(id);
    bNode.dispose();
  };

  async setRobot(robot: Robot) {
    const patch = Robot.diff(this.robot_, robot);
  
    const nodeIds = Object.keys(patch.nodes);
    const removedKeys = new Set<string>();

    // Handle removals
    for (const nodeId of nodeIds) {
      const node = patch.nodes[nodeId];
      if (node.type !== Patch.Type.Remove) continue;

      await this.updateNode_(nodeId, node, patch.geometry, robot);
      
      delete this.nodes_[nodeId];

      removedKeys.add(nodeId);
    }

    for (const nodeId of nodeIds) {
      const node = patch.nodes[nodeId];

      switch (node.type) {
        case Patch.Type.Add: {

        }
      }
    }

    this.robot_ = robot;
  }
}