import * as Babylon from 'babylonjs';
import SceneNode from './state/State/Scene/Node';
import Robot from './state/State/Robot';
import Node from './state/State/Robot/Node';
import { Quaternion, Vector3 as RawVector3, ReferenceFrame as RawReferenceFrame } from './math';
import { ReferenceFrame, Rotation, Vector3 } from './unit-math';
import { Distance, Mass } from './util';
import { FrameLike } from './SceneBinding';
import Geometry from './state/State/Robot/Geometry';
import Patch from './util/Patch';
import Dict from './Dict';
import { RobotState } from './RobotState';

export class RobotBinding {
  private bScene_: Babylon.Scene;

  private robot_: Robot;
  get robot() { return this.robot_; }

  private links_: Dict<FrameLike> = {};
  private motors_: Dict<Babylon.MotorEnabledJoint> = {};
  private servos_: Dict<Babylon.MotorEnabledJoint> = {};

  private physicsViewer_: Babylon.PhysicsViewer;

  constructor(bScene: Babylon.Scene, physicsViewer?: Babylon.PhysicsViewer) {
    this.bScene_ = bScene;
    this.physicsViewer_ = physicsViewer;
  }

  private buildGeometry_ = async (name: string, geometry: Geometry): Promise<Babylon.Mesh> => {
    let ret: Babylon.Mesh;
    switch (geometry.type) {
      case 'remote-mesh': {
        const index = geometry.uri.lastIndexOf('/');
        const fileName = geometry.uri.substring(index + 1);
        const baseName = geometry.uri.substring(0, index + 1);
  
        const res = await Babylon.SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, this.bScene_);
        
        ret = new Babylon.Mesh(name, this.bScene_);
        
        const meshes = res.meshes.slice(1);
        for (const mesh of meshes) ret.addChild(mesh);

        break; 
      }
      default: {
        throw new Error(`Unsupported geometry type: ${geometry.type}`);
      }
    }

    ret.visibility = 1;
  
    return ret;
  };


  private createLink_ = async (id: string, link: Node.Link) => {
    let ret: Babylon.Mesh;
    if (link.geometryId === undefined) {
      ret = new Babylon.Mesh(id, this.bScene_);
    } else {
      const geometry = this.robot_.geometry[link.geometryId];
      if (!geometry) throw new Error(`Missing geometry: ${link.geometryId}`);
      ret = await this.buildGeometry_(id, geometry);
    }

    

    ReferenceFrame.syncBabylon(link.origin, ret, 'centimeters');
    ret.scaling.scaleInPlace(100);
    ret.computeWorldMatrix(true);

    

    if (link.collisionBody) {
      const children = ret.getChildren(c => c instanceof Babylon.Mesh) as Babylon.Mesh[];

      for (const child of children) {
        console.log(child.id);
        child.physicsImpostor = new Babylon.PhysicsImpostor(child, Babylon.PhysicsImpostor.BoxImpostor, {
          mass: 0,
          restitution: 1,
          friction: link.friction ?? 0.5,
        }, this.bScene_);
        const mat = new Babylon.StandardMaterial('material', this.bScene_);
        mat.diffuseColor = Babylon.Color3.Red();
        child.material = mat;
      }
      
      ret.physicsImpostor = new Babylon.PhysicsImpostor(ret, Babylon.PhysicsImpostor.NoImpostor, {
        mass: 0,
        restitution: 1,
      }, this.bScene_);

      this.physicsViewer_.showImpostor(ret.physicsImpostor, ret);
      
      
    }

    return ret;
  };

  async setRobot(sceneRobot: SceneNode.Robot, robot: Robot) {
    if (this.robot_) throw new Error('Robot already set');
    this.robot_ = robot;

    const rootIds = Robot.rootNodeIds(robot);
    if (rootIds.length !== 1) throw new Error('Only one root node is supported');
    const rootId = rootIds[0];

    const nodeIds = Robot.breadthFirstNodeIds(robot);

    if (robot.nodes[rootId].type !== Node.Type.Link) throw new Error('Root node must be a link');

    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type !== Node.Type.Link) continue;
      const bNode = await this.createLink_(nodeId, node);
      this.links_[nodeId] = bNode;
    }

    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type === Node.Type.Link) continue;
    }

    // Update root origin
    const rootLink = this.links_[rootId];

    const bRootOrigin = ReferenceFrame.toBabylon(robot.nodes[rootId].origin, 'centimeters');
    const bRobotOrigin = ReferenceFrame.toBabylon(sceneRobot.origin, 'centimeters');

    rootLink.position = bRobotOrigin.position.add(bRootOrigin.position);
    rootLink.rotationQuaternion = bRobotOrigin.rotationQuaternion.multiply(bRootOrigin.rotationQuaternion);
    rootLink.scaling = bRobotOrigin.scaling.multiply(bRootOrigin.scaling).scaleInPlace(100);
  }

  dispose() {
    
  }
}
