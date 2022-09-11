import * as Babylon from 'babylonjs';
import SceneNode from './state/State/Scene/Node';
import Robot from './state/State/Robot';
import Node from './state/State/Robot/Node';
import { Quaternion, Vector3 as RawVector3, ReferenceFrame as RawReferenceFrame, clamp } from './math';
import { ReferenceFrame, Rotation, Vector3 } from './unit-math';
import { Angle, Distance, Mass } from './util';
import { FrameLike } from './SceneBinding';
import Geometry from './state/State/Robot/Geometry';
import Patch from './util/Patch';
import Dict from './Dict';
import { RobotState } from './RobotState';
import { minmaxReduxPixelShader } from 'babylonjs/Shaders/minmaxRedux.fragment';
import { RENDER_SCALE, RENDER_SCALE_METERS_MULTIPLIER } from './renderConstants';

interface BuiltGeometry {
  mesh: Babylon.Mesh;
  colliders?: BuiltGeometry.Collider[];
}

namespace BuiltGeometry {
  export interface Collider {
    name: string;
    mesh: Babylon.Mesh;
    type: number;
    volume: number;
  }
}

class RobotBinding {
  private bScene_: Babylon.Scene;

  private robot_: Robot;
  get robot() { return this.robot_; }

  private childrenNodeIds_: Dict<string[]>;

  private links_: Dict<Babylon.Mesh> = {};
  private weights_: Dict<Babylon.Mesh> = {};
  private fixed_: Dict<Babylon.PhysicsJoint> = {};
  private motors_: Dict<Babylon.MotorEnabledJoint> = {};
  private servos_: Dict<RobotBinding.ServoJoint> = {};
  private motorPorts_ = new Array<string>(4);
  private servoPorts_ = new Array<string>(4);

  private colliders_: Set<Babylon.IPhysicsEnabledObject> = new Set();

  private physicsViewer_: Babylon.PhysicsViewer;

  constructor(bScene: Babylon.Scene, physicsViewer?: Babylon.PhysicsViewer) {
    this.bScene_ = bScene;
    this.physicsViewer_ = physicsViewer;
  }

  private buildGeometry_ = async (name: string, geometry: Geometry): Promise<BuiltGeometry> => {
    let ret: BuiltGeometry;

    switch (geometry.type) {
      case 'remote-mesh': {
        const index = geometry.uri.lastIndexOf('/');
        const fileName = geometry.uri.substring(index + 1);
        const baseName = geometry.uri.substring(0, index + 1);
  
        const res = await Babylon.SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, this.bScene_);
        
        const nonColliders: Babylon.Mesh[] = [];
        const colliders: BuiltGeometry.Collider[] = [];

        for (const mesh of res.meshes.slice(1) as Babylon.Mesh[]) {
          

          if (mesh.name.startsWith('collider')) {
            const parts = mesh.name.split('-');
            if (parts.length != 3) throw new Error(`Invalid collider name: ${mesh.name}`);
            const [ _, type, name ] = parts;

            const { extendSize } = mesh.getBoundingInfo().boundingBox;

            const volume = extendSize.x * extendSize.y * extendSize.z;

            let bType: number;
            switch (type) {
              case 'box': bType = Babylon.PhysicsImpostor.BoxImpostor; break;
              case 'sphere': bType = Babylon.PhysicsImpostor.SphereImpostor; break;
              case 'cylinder': bType = Babylon.PhysicsImpostor.CylinderImpostor; break;
              case 'capsule': bType = Babylon.PhysicsImpostor.CapsuleImpostor; break;
              case 'plane': bType = Babylon.PhysicsImpostor.PlaneImpostor; break;
              case 'mesh': bType = Babylon.PhysicsImpostor.MeshImpostor; break;
              default: throw new Error(`Invalid collider type: ${type}`);
            }

            colliders.push({ mesh, type: bType, name, volume });
          } else {
            nonColliders.push(mesh);
          }
        }

        const mesh = Babylon.Mesh.MergeMeshes(nonColliders, true, true, undefined, false, true);
        mesh.visibility = 1;
        ret = { mesh, colliders };
        break; 
      }
      default: {
        throw new Error(`Unsupported geometry type: ${geometry.type}`);
      }
    }

    return ret;
  };


  private createLink_ = async (id: string, link: Node.Link) => {
    let builtGeometry: BuiltGeometry;
    if (link.geometryId === undefined) {
      builtGeometry = { mesh: new Babylon.Mesh(id, this.bScene_) };
    } else {
      const geometry = this.robot_.geometry[link.geometryId];
      if (!geometry) throw new Error(`Missing geometry: ${link.geometryId}`);
      builtGeometry = await this.buildGeometry_(id, geometry);
    }

    const ret = builtGeometry.mesh;

    const physicsImposterParams: Babylon.PhysicsImpostorParameters = {
      mass: Mass.toGramsValue(link.mass || Mass.grams(0)),
      restitution: link.restitution ?? 0,
      friction: link.friction ?? 0.5,
    };

    // We assume the mesh is defined in meters. Bring it into our default scaling.
    ret.scaling.scaleInPlace(RENDER_SCALE_METERS_MULTIPLIER);

    switch (link.collisionBody.type) {
      case Node.Link.CollisionBody.Type.Box: {
        ret.physicsImpostor = new Babylon.PhysicsImpostor(
          ret,
          Babylon.PhysicsImpostor.BoxImpostor,
          physicsImposterParams,
          this.bScene_
        );
        this.colliders_.add(ret);
        break;
      }
      case Node.Link.CollisionBody.Type.Cylinder: {
        ret.physicsImpostor = new Babylon.PhysicsImpostor(
          ret,
          Babylon.PhysicsImpostor.CylinderImpostor,
          physicsImposterParams,
          this.bScene_
        );
        this.colliders_.add(ret);
        break;
      }
      case Node.Link.CollisionBody.Type.Embedded: {
        for (const collider of builtGeometry.colliders ?? []) {
          const bCollider = collider.mesh;
          bCollider.parent = ret;

          bCollider.physicsImpostor = new Babylon.PhysicsImpostor(
            bCollider,
            collider.type,
            {
              ...physicsImposterParams,
              mass: 0,
            },
            this.bScene_
          );

          bCollider.visibility = 0;
          this.colliders_.add(bCollider);
        }

        ret.physicsImpostor = new Babylon.PhysicsImpostor(
          ret,
          Babylon.PhysicsImpostor.NoImpostor,
          physicsImposterParams,
          this.bScene_
        );
        this.colliders_.add(ret);

        break;
      }
      default: {
        throw new Error(`Unsupported collision body type: ${link.collisionBody.type}`);
      }
    }

    if (this.physicsViewer_) this.physicsViewer_.showImpostor(ret.physicsImpostor, ret);


    // If the parent is a link we need to create a fixed joint.
    // If the parent is not a link, the joint creation will be
    // handled by the `createJoint_` (e.g., `createMotor_`) method.
    if (link.parentId) {
      const parent = this.robot_.nodes[link.parentId];
      if (!parent) throw new Error(`Missing parent: ${link.parentId}`);

      if (parent.type === Node.Type.Link) {
        const bParent = this.links_[link.parentId];
        if (!bParent) throw new Error(`Missing parent: ${link.parentId}`);

        const bOrigin = ReferenceFrame.toBabylon(link.origin, RENDER_SCALE);
        const bOriginRotationInv = bOrigin.rotationQuaternion.invert();

        const bJoint = new Babylon.PhysicsJoint(Babylon.PhysicsJoint.LockJoint, {
          mainPivot: bOrigin.position,
          mainAxis: Babylon.Vector3.Up(),
          connectedPivot: Babylon.Vector3.Zero(),
          connectedAxis: Babylon.Vector3.Up().applyRotationQuaternion(bOriginRotationInv),
        });

        bParent.physicsImpostor.addJoint(ret.physicsImpostor, bJoint);
      }
    }

    return ret;
  };

  // Transform a vector using the child frame's orientation. This operation is invariant on a single
  // axis, so we return a new quaternion with the leftover rotation.
  private static connectedAxisAngle_ = (rotationAxis: Babylon.Vector3, childOrientation: Babylon.Quaternion): { axis: Babylon.Vector3, twist: Babylon.Quaternion } => {
    const childOrientationInv = childOrientation.invert();
    const axis = rotationAxis.applyRotationQuaternion(childOrientationInv);
    const v = new Babylon.Vector3(childOrientationInv.x, childOrientationInv.y, childOrientationInv.z);
    const s = childOrientationInv.w;
    v.multiplyInPlace(axis);

    const twist = new Babylon.Quaternion(v.x, v.y, v.z, s);
    twist.normalize();

    
    return {
      axis,
      twist,
    };
  };

  private createWeight_ = (id: string, weight: Node.Weight) => {
    const ret = Babylon.MeshBuilder.CreateSphere(id, { diameter: 1 }, this.bScene_);
    ret.visibility = 0;

    const parent = this.robot_.nodes[weight.parentId];
    if (!parent) throw new Error(`Missing parent: "${weight.parentId}" for weight "${id}"`);
    if (parent.type !== Node.Type.Link) throw new Error(`Invalid parent type: "${parent.type}" for weight "${id}"`);

    ret.physicsImpostor = new Babylon.PhysicsImpostor(
      ret,
      Babylon.PhysicsImpostor.NoImpostor,
      {
        mass: Mass.toGramsValue(weight.mass),
        restitution: 0,
        friction: 0,
      },
      this.bScene_
    );

    const bParent = this.links_[weight.parentId];
    if (!bParent) throw new Error(`Missing parent instantiation: "${weight.parentId}" for weight "${id}"`);

    const bOrigin = ReferenceFrame.toBabylon(weight.origin, RENDER_SCALE);
    
    const bJoint = new Babylon.PhysicsJoint(Babylon.PhysicsJoint.LockJoint, {
      mainPivot: bOrigin.position,
      mainAxis: Babylon.Vector3.Up(),
      connectedPivot: Babylon.Vector3.Zero(),
      connectedAxis: Babylon.Vector3.Up().applyRotationQuaternion(bOrigin.rotationQuaternion.invert()),
    });

    bParent.physicsImpostor.addJoint(ret.physicsImpostor, bJoint);

    return ret;
  };

  private createMotor_ = (id: string, motor: Node.Motor) => {
    const children = this.childrenNodeIds_[id];
    if (children.length !== 1) throw new Error(`Motor "${id}" must have exactly one child`);

    const { parentId } = motor;
    const childId = children[0];

    const parent = this.robot_.nodes[parentId];
    if (parent.type !== Node.Type.Link) throw new Error(`Motor "${id}" must have a parent that is a link`);
    
    const bParent = this.links_[parentId];
    if (!bParent) throw new Error(`Missing link: ${parentId}`);

    const child = this.robot_.nodes[childId];
    if (child.type !== Node.Type.Link) throw new Error(`Motor "${id}" must have a child that is a link`);

    const bChild = this.links_[childId];
    if (!bChild) throw new Error(`Missing link: ${childId}`);

    const bMotorOrigin = ReferenceFrame.toBabylon(motor.origin, RENDER_SCALE);
    const bChildOrigin = ReferenceFrame.toBabylon(child.origin, RENDER_SCALE);
    
    const bAxis = RawVector3.toBabylon(motor.axis);

    console.log({
      mainPivot: bMotorOrigin.position,
      connectedAxis:  bAxis.applyRotationQuaternion(bChildOrigin.rotationQuaternion.invert())
    });

    const bChildOriginRotationInv = bChildOrigin.rotationQuaternion.invert();

    const ret = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint, {
      mainPivot: bMotorOrigin.position,
      mainAxis: bAxis,
      connectedAxis: bAxis.applyRotationQuaternion(bChildOriginRotationInv),
      connectedPivot: Babylon.Vector3.Zero(),
    });

    bParent.physicsImpostor.addJoint(bChild.physicsImpostor, ret);
    ret.setMotor();

    return ret;
  };

  private createServo_ = (id: string, servo: Node.Servo): RobotBinding.ServoJoint => {
    const children = this.childrenNodeIds_[id];
    if (children.length !== 1) throw new Error(`Servo "${id}" must have exactly one child`);

    const { parentId } = servo;
    const childId = children[0];

    const parent = this.robot_.nodes[parentId];
    if (parent.type !== Node.Type.Link) throw new Error(`Servo "${id}" must have a parent that is a link`);
    
    const bParent = this.links_[parentId];
    if (!bParent) throw new Error(`Missing link: ${parentId}`);

    const child = this.robot_.nodes[childId];
    if (child.type !== Node.Type.Link) throw new Error(`Servo "${id}" must have a child that is a link`);

    const bChild = this.links_[childId];
    if (!bChild) throw new Error(`Missing link: ${childId}`);

    const bMotorOrigin = ReferenceFrame.toBabylon(servo.origin, RENDER_SCALE);
    const childOriginRaw = ReferenceFrame.toRaw(child.origin, RENDER_SCALE);
    const bChildOrigin = RawReferenceFrame.toBabylon(childOriginRaw);

    const qAxis = Quaternion.fromVector3(servo.axis);

    const bAxis = RawVector3.toBabylon(servo.axis);

    const { axis, twist } = RobotBinding.connectedAxisAngle_(bAxis, bChildOrigin.rotationQuaternion);

    console.log({
      mainPivot: bMotorOrigin.position,
      connectedAxis: axis,
      leftoverEuler: twist.toEulerAngles(),
    });

    bChild.rotationQuaternion = twist;

    const ret = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint, {
      mainPivot: bMotorOrigin.position,
      mainAxis: bAxis,
      connectedAxis: axis,
      connectedPivot: Babylon.Vector3.Zero(),
    });

    bParent.physicsImpostor.addJoint(bChild.physicsImpostor, ret);
    ret.setMotor();

    return {
      joint: ret,
      child: bChild,
      startOrientation: bChild.rotationQuaternion.clone(),
      startAngle: Quaternion.angle(twist, Quaternion.IDENTITY),
    }
  };

  private lastTick_: number = undefined;
  tick(input: RobotBinding.TickIn): RobotBinding.TickOut {
    for (let i = 0; i < input.motorVelocities.length; i++) {
      const motorId = this.motorPorts_[i];
      
      // If no motor is bound to the port, skip it.
      if (!motorId) continue;
    
      const motor = this.robot_.nodes[motorId];
      if (!motor) throw new Error(`Missing motor: ${motorId}`);
      if (motor.type !== Node.Type.Motor) throw new Error(`Invalid motor type: ${motor.type}`);


      const bMotor = this.motors_[motorId];
      // If motorId is set but the motor is not found, throw an error.
      if (!bMotor) throw new Error(`Missing motor instantiation: "${motorId}" on port ${i}`);

      const ticksPerRevolution = motor.ticksPerRevolution ?? 2048;
      const maxVelocity = motor.velocityMax ?? 1500;

      const clampedVelocity = clamp(-maxVelocity, input.motorVelocities[i], maxVelocity);

      // Convert input velocity to radians per second.
      const velocity = (clampedVelocity / ticksPerRevolution) * (2 * Math.PI);

      bMotor.setMotor(velocity);
    }

    for (let i = 0; i < input.servoPositions.length; i++) {
      const servoId = this.servoPorts_[i];

      // If no servo is bound to the port, skip it.
      if (!servoId) continue;

      const servo = this.robot_.nodes[servoId];
      if (!servo) throw new Error(`Missing servo: ${servoId}`);
      if (servo.type !== Node.Type.Servo) throw new Error(`Invalid servo type: ${servo.type}`);

      const servoJoint = this.servos_[servoId];
      if (!servoJoint) throw new Error(`Missing motor instantiation: "${servoId}" on port ${i}`);

      const bServo = servoJoint.joint;
      const { startAngle, startOrientation, child } = servoJoint;

      const position = servo.position ?? {};

      const min = Angle.toRadiansValue(position.min ?? Angle.degrees(-87.5));
      const max = Angle.toRadiansValue(position.max ?? Angle.degrees(87.5));
      

      const range = max - min;

      const servoPosition = clamp(0, input.servoPositions[i], 2048);
      const desiredAngle = (servoPosition - 1024) * range;

      const currentAngle = Quaternion.angle(startOrientation, child.rotationQuaternion) - startAngle;

      const deltaAngle = desiredAngle - currentAngle;


    }

    return RobotBinding.TickOut.NIL;
  }

  async setRobot(sceneRobot: SceneNode.Robot, robot: Robot) {
    if (this.robot_) throw new Error('Robot already set');

    this.robot_ = robot;

    const rootIds = Robot.rootNodeIds(robot);
    if (rootIds.length !== 1) throw new Error('Only one root node is supported');
    
    const rootId = rootIds[0];
    const nodeIds = Robot.breadthFirstNodeIds(robot);
    this.childrenNodeIds_ = Robot.childrenNodeIds(robot);

    if (robot.nodes[rootId].type !== Node.Type.Link) throw new Error('Root node must be a link');

    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type !== Node.Type.Link) continue;
      const bNode = await this.createLink_(nodeId, node);
      this.links_[nodeId] = bNode;
    }

    console.log(this.links_);

    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type === Node.Type.Link) continue;
    
      switch (node.type) {
        case Node.Type.Weight: {
          const bNode = this.createWeight_(nodeId, node);
          this.weights_[nodeId] = bNode;
          break;
        }
        case Node.Type.Motor: {
          const bJoint = this.createMotor_(nodeId, node);
          this.motors_[nodeId] = bJoint;
          this.motorPorts_[node.motorPort] = nodeId;
          console.log('added joint', nodeId);
          break;
        }
        case Node.Type.Servo: {
          const bJoint = this.createServo_(nodeId, node);
          this.servos_[nodeId] = bJoint;
          console.log('added joint', bJoint);
          this.servoPorts_[node.servoPort] = nodeId;
          break;
        }
      }
    }

    // Update root origin
    const rootLink = this.links_[rootId];

    const bRootOrigin = ReferenceFrame.toBabylon(robot.nodes[rootId].origin, RENDER_SCALE);
    const bRobotOrigin = ReferenceFrame.toBabylon(sceneRobot.origin, RENDER_SCALE);

    rootLink.position = bRobotOrigin.position
      .add(bRootOrigin.position);
    rootLink.rotationQuaternion = bRobotOrigin.rotationQuaternion
      .multiply(bRootOrigin.rotationQuaternion);
    rootLink.scaling = bRobotOrigin.scaling
      .multiply(bRootOrigin.scaling)
      .scaleInPlace(RENDER_SCALE_METERS_MULTIPLIER);

    for (const impostor of this.bScene_.getPhysicsEngine().getImpostors()) {
      if (!this.colliders_.has(impostor.object)) {
        console.log('no collider', impostor);
        continue;
      }
      console.log('impostor', impostor);
      impostor.executeNativeFunction((world, body) => {
        console.log('body', body);
      })
    }

  
    console.log();
  }

  dispose() {
    
  }
}

namespace RobotBinding {
  export interface TickIn {
    /// Velocities in ticks/second
    motorVelocities: [number, number, number, number];

    /// Servo positions in ticks
    servoPositions: [number, number, number, number];
  }

  export interface TickOut {
    /// Delta of motor positions in ticks
    motorPositionDeltas: [number, number, number, number];
  }

  export namespace TickOut {
    export const NIL: TickOut = {
      motorPositionDeltas: [0, 0, 0, 0],
    };
  }

  export interface ServoJoint {
    joint: Babylon.MotorEnabledJoint;
    child: Babylon.Mesh;
    startOrientation: Quaternion;
    startAngle: number;
  }
}

export default RobotBinding;