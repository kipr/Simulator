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
import { RobotState } from './RobotState';

export class RobotBinding {
  private robot_: Robot;
  get robot() { return this.robot_; }

  private links_: Dict<FrameLike> = {};
  private motors_: Dict<Babylon.MotorEnabledJoint> = {};
  private servos_: Dict<Babylon.MotorEnabledJoint> = {};

  constructor() {
    
  }

  private buildGeometry_ = async (name: string, geometry: Geometry): Promise<FrameLike> => {
    let ret: FrameLike;
    switch (geometry.type) {
      case 'remote-mesh': {
        const index = geometry.uri.lastIndexOf('/');
        const fileName = geometry.uri.substring(index + 1);
        const baseName = geometry.uri.substring(0, index + 1);
  
        const res = await Babylon.SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName);
        if (res.meshes.length === 1) return res.meshes[0];
        ret = new Babylon.TransformNode(geometry.uri);
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


  private createLink_ = async (id: string, link: Node.Link) => {
    let ret: FrameLike;
    if (link.geometryId === undefined)
    {
      ret = new Babylon.Mesh(id);
    }
    else
    {
      const geometry = this.robot_.geometry[link.geometryId];
      if (!geometry) throw new Error(`Missing geometry: ${link.geometryId}`);
      ret = await this.buildGeometry_(id, geometry);
    }

    const origin = link.origin || {};
    const position: Vector3 = origin.position ?? Vector3.zero();
    const orientation: Rotation = origin.orientation ?? Rotation.Euler.identity();
    const scale = origin.scale ?? RawVector3.ONE;

    ret.position.set(
      Distance.toCentimetersValue(position.x || Distance.centimeters(0)),
      Distance.toCentimetersValue(position.y || Distance.centimeters(0)),
      Distance.toCentimetersValue(position.z || Distance.centimeters(0))
    );

    ret.rotationQuaternion = Quaternion.toBabylon(Rotation.toRawQuaternion(orientation));
    ret.scaling.set(scale.x, scale.y, scale.z);

    return ret;
  };

  async setRobot(robot: Robot) {
    if (this.robot_) throw new Error('Robot already set');
    this.robot_ = robot;

    const nodeIds = Robot.breadthFirstNodeIds(robot);

    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type !== Node.Type.Link) continue;
      const bNode = await this.createLink_(nodeId, node);
      this.links_[nodeId] = bNode;
    }
  }
}
