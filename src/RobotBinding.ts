import * as Babylon from 'babylonjs';
import SceneNode from './state/State/Scene/Node';
import Robot from './state/State/Robot';
import Node from './state/State/Robot/Node';
import { Quaternion, Vector3 as RawVector3, ReferenceFrame as RawReferenceFrame, clamp, AxisAngle, Euler } from './math';
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

  private rootId_: string;

  private links_: Dict<Babylon.Mesh> = {};
  private weights_: Dict<Babylon.Mesh> = {};
  private fixed_: Dict<Babylon.PhysicsJoint> = {};
  private motors_: Dict<Babylon.MotorEnabledJoint> = {};
  private servos_: Dict<Babylon.MotorEnabledJoint> = {};
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
            if (parts.length !== 3) throw new Error(`Invalid collider name: ${mesh.name}`);
            const [_, type, name] = parts;

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

  private bParentChild_ = (id: string, parentId: string): {
    bParent: Babylon.Mesh;
    bChild: Babylon.Mesh;
    childId: string;
  } => {
    if (!parentId) throw new Error(`Missing parent: "${parentId}" for node "${id}"`);
    
    const children = this.childrenNodeIds_[id];
    if (children.length !== 1) throw new Error(`"${id}" must have exactly one child`);

    const childId = children[0];

    const bParent = this.links_[parentId];
    if (!bParent) throw new Error(`Missing link: ${parentId}`);

    const bChild = this.links_[childId];
    if (!bChild) throw new Error(`Missing link: ${childId}`);

    return {
      bParent,
      bChild,
      childId,
    };
  };

  private createHinge_ = (id: string, hinge: Node.HingeJoint & { parentId: string }) => {
    const { bParent, bChild } = this.bParentChild_(id, hinge.parentId);
    
    const childAxis = hinge.childAxis || hinge.parentAxis;
    const bChildAxis = RawVector3.toBabylon(childAxis);

    if (hinge.childTwist) {
      bChild.rotationQuaternion = Babylon.Quaternion.RotationAxis(bChildAxis, Angle.toRadiansValue(hinge.childTwist));
      bChild.computeWorldMatrix(true);
    }

    const ret = new Babylon.HingeJoint({
      mainPivot: Vector3.toBabylon(hinge.parentPivot, RENDER_SCALE),
      mainAxis: RawVector3.toBabylon(hinge.parentAxis),
      connectedAxis: bChildAxis,
      connectedPivot: Vector3.toBabylon(hinge.childPivot, RENDER_SCALE)
    });

    bParent.physicsImpostor.addJoint(bChild.physicsImpostor, ret);

    ret.setMotor(0, 10);

    return ret;
  };

  private damp_ = 0;

  private lastMotorAngles_: [number, number, number, number] = [0, 0, 0, 0];

  tick(input: RobotBinding.TickIn): RobotBinding.TickOut {
    this.damp_ = this.damp_ * 0.95 + 0.05;

    const root = this.links_[this.rootId_];

    const motorPositionDeltas: [number, number, number, number] = [0, 0, 0, 0];

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

      const inputVelocity = (motor.plug === undefined || motor.plug === 'normal')
        ? input.motorVelocities[i]
        : -input.motorVelocities[i];

      const clampedVelocity = clamp(-maxVelocity, inputVelocity, maxVelocity);

      // Convert input velocity to radians per second.
      const velocity = (clampedVelocity / ticksPerRevolution) * (2 * Math.PI);

      let currentAngle: number;
      bMotor.executeNativeFunction((world, joint) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        currentAngle = joint.getHingeAngle();
      });

      const lastMotorAngle = this.lastMotorAngles_[i];

      let deltaAngle = 0;

      if (lastMotorAngle > Math.PI / 2 && currentAngle < -Math.PI / 2) {
        deltaAngle = currentAngle + 2 * Math.PI - lastMotorAngle;
      } else if (lastMotorAngle < -Math.PI / 2 && currentAngle > Math.PI / 2) {
        deltaAngle = currentAngle - 2 * Math.PI - lastMotorAngle;
      } else {
        deltaAngle = currentAngle - lastMotorAngle;
      }

      this.lastMotorAngles_[i] = currentAngle;

      motorPositionDeltas[i] = Math.round(deltaAngle / (2 * Math.PI) * ticksPerRevolution);

      bMotor.setMotor(velocity);


    }

    for (let i = 0; i < input.servoPositions.length; i++) {
      const servoId = this.servoPorts_[i];

      // If no servo is bound to the port, skip it.
      if (!servoId) continue;

      const servo = this.robot_.nodes[servoId];
      if (!servo) throw new Error(`Missing servo: ${servoId}`);
      if (servo.type !== Node.Type.Servo) throw new Error(`Invalid servo type: ${servo.type}`);

      const bServo = this.servos_[servoId];
      if (!bServo) throw new Error(`Missing motor instantiation: "${servoId}" on port ${i}`);

      const position = servo.position ?? {};

      const physicalMin = position.min ?? RobotBinding.SERVO_LOGICAL_MIN_ANGLE;
      const physicalMax = position.max ?? RobotBinding.SERVO_LOGICAL_MAX_ANGLE;

      const physicalMinRads = Angle.toRadiansValue(physicalMin);
      const physicalMaxRads = Angle.toRadiansValue(physicalMax);

      const servoPosition = clamp(0, input.servoPositions[i], 2048);
      const desiredAngle = (servoPosition - 1024) / 2048 * RobotBinding.SERVO_LOGICAL_RANGE_RADS;

      bServo.executeNativeFunction((world, joint) => {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

        joint.setLimit(physicalMinRads, physicalMaxRads, 0.9, 0.3, 1);
        joint.setMaxMotorImpulse(1000);
        joint.setMotorTarget(desiredAngle * this.damp_ + joint.getHingeAngle() * (1 - this.damp_), 0.05);
      
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
      });
    }

    return {
      origin: this.origin,
      motorPositionDeltas
    };
  }

  get origin(): ReferenceFrame {
    const rootLink = this.links_[this.rootId_];
    return {
      position: Vector3.fromRaw(RawVector3.fromBabylon(rootLink.position), RENDER_SCALE),
      orientation: Rotation.Euler.fromRaw(Euler.fromQuaternion(rootLink.rotationQuaternion)),
      scale: RawVector3.divideScalar(RawVector3.fromBabylon(rootLink.scaling), RENDER_SCALE_METERS_MULTIPLIER),
    };
  }

  set origin(origin: ReferenceFrame) {
    const rootLink = this.links_[this.rootId_];

    const resetTransformNode = new Babylon.TransformNode('resetTransformNode', this.bScene_);
    resetTransformNode.setAbsolutePosition(rootLink.absolutePosition);
    resetTransformNode.rotationQuaternion = rootLink.absoluteRotationQuaternion;

    console.log('rootLink absolute position', rootLink.absolutePosition);
    console.log('rootLink absolute rotation', rootLink.absoluteRotationQuaternion);


    for (const link of Object.values(this.links_)) {
      link.physicsImpostor.setLinearVelocity(Babylon.Vector3.Zero());
      link.physicsImpostor.setAngularVelocity(Babylon.Vector3.Zero());
      link.setParent(resetTransformNode);
    }

    resetTransformNode.setAbsolutePosition(Vector3.toBabylon(origin.position, RENDER_SCALE));
    resetTransformNode.rotationQuaternion = Quaternion.toBabylon(Rotation.toRawQuaternion(origin.orientation));

    for (const link of Object.values(this.links_)) {
      link.setParent(null);
    }

    resetTransformNode.dispose();

    this.damp_ = 0;
  }

  get visible(): boolean {
    return this.links_[this.rootId_].visibility === 1;
  }

  set visible(visible: boolean) {
    const visibility = visible ? 1 : 0;
    for (const link of Object.values(this.links_)) {
      link.visibility = visibility;
    }
  }

  async setRobot(sceneRobot: SceneNode.Robot, robot: Robot) {
    if (this.robot_) throw new Error('Robot already set');

    this.robot_ = robot;

    const rootIds = Robot.rootNodeIds(robot);
    console.log('rootIds', rootIds);
    if (rootIds.length !== 1) throw new Error('Only one root node is supported');
    
    this.rootId_ = rootIds[0];


    console.log(rootIds, this.rootId_);

    const nodeIds = Robot.breadthFirstNodeIds(robot);
    this.childrenNodeIds_ = Robot.childrenNodeIds(robot);

    if (robot.nodes[this.rootId_].type !== Node.Type.Link) throw new Error('Root node must be a link');

    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type !== Node.Type.Link) continue;
      const bNode = await this.createLink_(nodeId, node);
      this.links_[nodeId] = bNode;
    }

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
          const bJoint = this.createHinge_(nodeId, node);
          this.motors_[nodeId] = bJoint;
          this.motorPorts_[node.motorPort] = nodeId;
          console.log('added joint', nodeId);
          break;
        }
        case Node.Type.Servo: {
          const bJoint = this.createHinge_(nodeId, node);
          this.servos_[nodeId] = bJoint;
          console.log('added joint', bJoint);
          this.servoPorts_[node.servoPort] = nodeId;
          break;
        }
      }
    }
  }

  dispose() {
    for (const link of Object.values(this.links_)) link.dispose();
    this.links_ = {};

    for (const weight of Object.values(this.weights_)) weight.dispose();
    this.weights_ = {};

    this.motors_ = {};
    this.servos_ = {};
  }
}

namespace RobotBinding {
  export interface TickIn {
    /**
     * Velocities in ticks/second
     */
    motorVelocities: [number, number, number, number];

    /**
     * Servo positions in ticks
     */
    servoPositions: [number, number, number, number];
  }

  export interface TickOut {
    /**
     * The new origin of the robot
     */
    origin: ReferenceFrame;
    
    /**
     * Delta of motor positions in ticks
     */
    motorPositionDeltas: [number, number, number, number];
  }

  export namespace TickOut {
    export const NIL: TickOut = {
      origin: ReferenceFrame.IDENTITY,
      motorPositionDeltas: [0, 0, 0, 0],
    };
  }

  export const SERVO_LOGICAL_MIN_ANGLE = Angle.degrees(-90.0);
  export const SERVO_LOGICAL_MAX_ANGLE = Angle.degrees(90.0);

  export const SERVO_LOGICAL_MIN_ANGLE_RADS = Angle.toRadiansValue(SERVO_LOGICAL_MIN_ANGLE);
  export const SERVO_LOGICAL_MAX_ANGLE_RADS = Angle.toRadiansValue(SERVO_LOGICAL_MAX_ANGLE);

  export const SERVO_LOGICAL_RANGE_RADS = SERVO_LOGICAL_MAX_ANGLE_RADS - SERVO_LOGICAL_MIN_ANGLE_RADS;
}

export default RobotBinding;