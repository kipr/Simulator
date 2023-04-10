import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { TransformNode as BabylonTransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PhysicsViewer as BabylonPhysicsViewer } from '@babylonjs/core/Debug/physicsViewer';
import { SphereBuilder as BabylonSphereBuilder } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { Vector3 as BabylonVector3, Quaternion as BabylonQuaternion } from '@babylonjs/core/Maths/math.vector';
import { PhysicsImpostor as BabylonPhysicsImpostor, PhysicsImpostorParameters as BabylonPhysicsImpostorParameters, IPhysicsEnabledObject as BabylonIPhysicsEnabledObject } from '@babylonjs/core/Physics/physicsImpostor';
import { Mesh as BabylonMesh } from '@babylonjs/core/Meshes/mesh';
import { SceneLoader as BabylonSceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { MotorEnabledJoint as BabylonMotorEnabledJoint, PhysicsJoint as BabylonPhysicsJoint, HingeJoint as BabylonHingeJoint } from '@babylonjs/core/Physics/physicsJoint';

import '@babylonjs/core/Physics/physicsEngineComponent';

import SceneNode from './state/State/Scene/Node';
import Robot from './state/State/Robot';
import Node from './state/State/Robot/Node';
import { Quaternion, Vector3 as RawVector3, clamp, Euler } from './math';
import { ReferenceFrame, Rotation, Vector3 } from './unit-math';
import { Angle, Distance, Mass } from './util/Value';
import { SceneMeshMetadata } from './SceneBinding';
import Geometry from './state/State/Robot/Geometry';
import Dict from './Dict';
import { RENDER_SCALE, RENDER_SCALE_METERS_MULTIPLIER } from './renderConstants';
import WriteCommand from './AbstractRobot/WriteCommand';
import AbstractRobot from './AbstractRobot';
import Motor from './AbstractRobot/Motor';
import SerialU32 from './SerialU32';
import CreateBinding from './Create/CreateBinding';
import workerInstance from './WorkerInstance';
import Sensor from './Sensor/Sensor';
import EtSensor from './Sensor/EtSensor';
import TouchSensor from './Sensor/TouchSensor';
import ReflectanceSensor from './Sensor/ReflectanceSensor';
import SensorObject from './Sensor/SensorObject';
import SensorParameters from './Sensor/SensorParameters';
import LightSensor from './Sensor/LightSensor';
import BuiltGeometry from './BuiltGeometry';



class RobotBinding {
  private bScene_: BabylonScene;

  get scene() { return this.bScene_; }

  private robot_: Robot;
  get robot() { return this.robot_; }

  private childrenNodeIds_: Dict<string[]>;

  private rootId_: string;
  private robotSceneId_: string;

  private links_: Dict<BabylonMesh> = {};

  get links() { return this.links_; }

  private weights_: Dict<BabylonMesh> = {};
  private fixed_: Dict<BabylonPhysicsJoint> = {};
  private motors_: Dict<BabylonHingeJoint> = {};
  private servos_: Dict<BabylonHingeJoint> = {};
  private motorPorts_ = new Array<string>(4);
  private servoPorts_ = new Array<string>(4);

  private digitalSensors_: Dict<Sensor<boolean>> = {};
  private digitalPorts_ = new Array<string>(6);

  private analogSensors_: Dict<Sensor<number>> = {};
  private analogPorts_ = new Array<string>(6);

  private colliders_: Set<BabylonMesh> = new Set();

  get colliders() { return this.colliders_; }

  private physicsViewer_: BabylonPhysicsViewer;
  get physicsViewer() { return this.physicsViewer_; }

  private createBinding_: CreateBinding;

  get createBinding() { return this.createBinding_; }

  constructor(bScene: BabylonScene, physicsViewer?: BabylonPhysicsViewer) {
    this.bScene_ = bScene;
    this.physicsViewer_ = physicsViewer;
  }

  public buildGeometry_ = async (name: string, geometry: Geometry): Promise<BuiltGeometry> => {
    let ret: BuiltGeometry;

    switch (geometry.type) {
      case 'remote-mesh': {
        const index = geometry.uri.lastIndexOf('/');
        const fileName = geometry.uri.substring(index + 1);
        const baseName = geometry.uri.substring(0, index + 1);
  
        const res = await BabylonSceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, this.bScene_);
        
        const nonColliders: BabylonMesh[] = [];
        const colliders: BuiltGeometry.Collider[] = [];

        for (const mesh of res.meshes.slice(1) as BabylonMesh[]) {
          if (mesh.name.startsWith('collider')) {
            const parts = mesh.name.split('-');
            if (parts.length !== 3) throw new Error(`Invalid collider name: ${mesh.name}`);
            const [_, type, name] = parts;

            const { extendSize } = mesh.getBoundingInfo().boundingBox;

            const volume = extendSize.x * extendSize.y * extendSize.z;

            let bType: number;
            switch (type) {
              case 'box': bType = BabylonPhysicsImpostor.BoxImpostor; break;
              case 'sphere': bType = BabylonPhysicsImpostor.SphereImpostor; break;
              case 'cylinder': bType = BabylonPhysicsImpostor.CylinderImpostor; break;
              case 'capsule': bType = BabylonPhysicsImpostor.CapsuleImpostor; break;
              case 'plane': bType = BabylonPhysicsImpostor.PlaneImpostor; break;
              case 'mesh': bType = BabylonPhysicsImpostor.MeshImpostor; break;
              default: throw new Error(`Invalid collider type: ${type}`);
            }

            colliders.push({ mesh, type: bType, name, volume });
          } else {
            nonColliders.push(mesh);
          }
        }

        const mesh = BabylonMesh.MergeMeshes(nonColliders, true, true, undefined, false, true);
        mesh.visibility = 0;
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
      builtGeometry = { mesh: new BabylonMesh(id, this.bScene_) };
    } else {
      const geometry = this.robot_.geometry[link.geometryId];
      if (!geometry) throw new Error(`Missing geometry: ${link.geometryId}`);
      builtGeometry = await this.buildGeometry_(id, geometry);
    }

    const ret = builtGeometry.mesh;

    const physicsImposterParams: BabylonPhysicsImpostorParameters = {
      mass: Mass.toGramsValue(link.mass || Mass.grams(0)),
      restitution: link.restitution ?? 0,
      friction: link.friction ?? 0.5,
    };

    // We assume the mesh is defined in meters. Bring it into our default scaling.
    ret.scaling.scaleInPlace(RENDER_SCALE_METERS_MULTIPLIER);

    switch (link.collisionBody.type) {
      case Node.Link.CollisionBody.Type.Box: {
        ret.physicsImpostor = new BabylonPhysicsImpostor(
          ret,
          BabylonPhysicsImpostor.BoxImpostor,
          physicsImposterParams,
          this.bScene_
        );
        this.colliders_.add(ret);
        break;
      }
      case Node.Link.CollisionBody.Type.Cylinder: {
        ret.physicsImpostor = new BabylonPhysicsImpostor(
          ret,
          BabylonPhysicsImpostor.CylinderImpostor,
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

          bCollider.physicsImpostor = new BabylonPhysicsImpostor(
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

        ret.physicsImpostor = new BabylonPhysicsImpostor(
          ret,
          BabylonPhysicsImpostor.NoImpostor,
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

  private createSensor_ = <T extends Node.FrameLike, O, S extends SensorObject<T, O>>(s: { new(parameters: SensorParameters<T>): S }) => (id: string, definition: T): S => {
    const parent = this.links_[definition.parentId];
    
    return new s({
      id,
      definition,
      parent,
      scene: this.bScene_,
      links: new Set(Object.values(this.links_)),
      colliders: this.colliders_,
    });
  };

  private createTouchSensor_ = this.createSensor_(TouchSensor);
  private createEtSensor_ = this.createSensor_(EtSensor);
  private createLightSensor_ = this.createSensor_(LightSensor);
  private createReflectanceSensor_ = this.createSensor_(ReflectanceSensor);

  // Transform a vector using the child frame's orientation. This operation is invariant on a single
  // axis, so we return a new quaternion with the leftover rotation.
  private static connectedAxisAngle_ = (rotationAxis: BabylonVector3, childOrientation: BabylonQuaternion): { axis: BabylonVector3, twist: BabylonQuaternion } => {
    const childOrientationInv = childOrientation.invert();
    const axis = rotationAxis.applyRotationQuaternion(childOrientationInv);
    const v = new BabylonVector3(childOrientationInv.x, childOrientationInv.y, childOrientationInv.z);
    const s = childOrientationInv.w;
    v.multiplyInPlace(axis);

    const twist = new BabylonQuaternion(v.x, v.y, v.z, s);
    twist.normalize();

    
    return {
      axis,
      twist,
    };
  };

  private createWeight_ = (id: string, weight: Node.Weight) => {
    const ret = BabylonSphereBuilder.CreateSphere(id, { diameter: 1 }, this.bScene_);
    ret.visibility = 0;

    const parent = this.robot_.nodes[weight.parentId];
    if (!parent) throw new Error(`Missing parent: "${weight.parentId}" for weight "${id}"`);
    if (parent.type !== Node.Type.Link) throw new Error(`Invalid parent type: "${parent.type}" for weight "${id}"`);

    ret.physicsImpostor = new BabylonPhysicsImpostor(
      ret,
      BabylonPhysicsImpostor.NoImpostor,
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
    
    const bJoint = new BabylonPhysicsJoint(BabylonPhysicsJoint.LockJoint, {
      mainPivot: bOrigin.position,
      mainAxis: BabylonVector3.Up(),
      connectedPivot: BabylonVector3.Zero(),
      connectedAxis: BabylonVector3.Up().applyRotationQuaternion(bOrigin.rotationQuaternion.invert()),
    });

    bParent.physicsImpostor.addJoint(ret.physicsImpostor, bJoint);

    return ret;
  };

  private bParentChild_ = (id: string, parentId: string): {
    bParent: BabylonMesh;
    bChild: BabylonMesh;
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
      bChild.rotationQuaternion = BabylonQuaternion.RotationAxis(bChildAxis, Angle.toRadiansValue(hinge.childTwist));
      bChild.computeWorldMatrix(true);
    }

    const ret = new BabylonHingeJoint({
      mainPivot: Vector3.toBabylon(hinge.parentPivot, RENDER_SCALE),
      mainAxis: RawVector3.toBabylon(hinge.parentAxis),
      connectedAxis: bChildAxis,
      connectedPivot: Vector3.toBabylon(hinge.childPivot, RENDER_SCALE)
    });

    bParent.physicsImpostor.addJoint(bChild.physicsImpostor, ret);

    ret.setMotor(0, 10);

    return ret;
  };

  private createIRobotCreate_ = async (id: string, iRobotCreate: Node.IRobotCreate) => {
    if (this.createBinding_) throw new Error('Only one create per robot');

    const parent = this.links_[iRobotCreate.parentId];
    if (!parent) throw new Error(`Missing parent: "${iRobotCreate.parentId}" for iRobotCreate "${id}"`);

    this.createBinding_ = new CreateBinding(workerInstance.createSerial, this);
    await this.createBinding_.build();

    const bOrigin = ReferenceFrame.toBabylon(iRobotCreate.origin, RENDER_SCALE);

    if (this.createBinding_.root.physicsImpostor) {
      const bJoint = new BabylonPhysicsJoint(BabylonPhysicsJoint.LockJoint, {
        mainPivot: bOrigin.position,
        mainAxis: BabylonVector3.Up(),
        connectedPivot: BabylonVector3.Zero(),
        connectedAxis: BabylonVector3.Up().applyRotationQuaternion(bOrigin.rotationQuaternion.invert()),
      });
  
      parent.physicsImpostor.addJoint(this.createBinding_.root.physicsImpostor, bJoint);
    } else {
      // Just statically connect them
      console.log('awsdsad');
      parent.addChild(this.createBinding_.root);
      this.createBinding_.root.position = bOrigin.position;
      this.createBinding_.root.rotationQuaternion = bOrigin.rotationQuaternion;
    }
  };

  private hingeAngle_ = (joint: BabylonMotorEnabledJoint): number => {
    let currentAngle: number;
    joint.executeNativeFunction((world, joint) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      currentAngle = joint.getHingeAngle();
    });
    return currentAngle;
  };

  private setMotorVelocity_ = (joint: BabylonMotorEnabledJoint, velocity: number) => {
    joint.executeNativeFunction((world, joint) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      joint.enableAngularMotor(true, velocity, 100000);
    });
  };

  

  private lastTick_ = 0;
  private lastMotorAngles_: [number, number, number, number] = [0, 0, 0, 0];

  // Getting sensor values is async. We store the pending promises in these dictionaries.
  private outstandingDigitalGetValues_: Dict<RobotBinding.OutstandingPromise<boolean>> = {};
  private outstandingAnalogGetValues_: Dict<RobotBinding.OutstandingPromise<number>> = {};

  private latestDigitalValues_: [boolean, boolean, boolean, boolean, boolean, boolean] = [false, false, false, false, false, false];
  private latestAnalogValues_: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];

  private lastPErrs_: [number, number, number, number] = [0, 0, 0, 0];
  private iErrs_: [number, number, number, number] = [0, 0, 0, 0];

  private brakeAt_: [number, number, number, number] = [undefined, undefined, undefined, undefined];

  private positionDeltaFracs_: [number, number, number, number] = [0, 0, 0, 0];
  private lastServoEnabledAngle_: [number, number, number, number] = [0, 0, 0, 0];

  

  tick(readable: AbstractRobot.Readable): RobotBinding.TickOut {
    const motorPositionDeltas: [number, number, number, number] = [0, 0, 0, 0];

    const writeCommands: WriteCommand[] = [];

    const now = performance.now();
    const delta = (now - this.lastTick_) / 1000;
    this.lastTick_ = now;

    if (this.createBinding_) this.createBinding_.tick(delta);

    const abstractMotors: [Motor, Motor, Motor, Motor] = [
      readable.getMotor(0),
      readable.getMotor(1),
      readable.getMotor(2),
      readable.getMotor(3)
    ];

    // Update motor position deltas
    const nextPositions: [number, number, number, number] = [0, 0, 0, 0];
    for (let port = 0; port < 4; ++port) {
      const motorId = this.motorPorts_[port];
      
      // If no motor is bound to the port, skip it.
      if (!motorId) continue;

      const abstractMotor = abstractMotors[port];
    
      const motorNode = this.robot_.nodes[motorId] as Node.Motor;
      const bMotor = this.motors_[motorId];
      const ticksPerRevolution = motorNode.ticksPerRevolution ?? 2048;

      const plug = (motorNode.plug === undefined || motorNode.plug === 'normal') ? 1 : -1;

      // Get the delta angle of the motor since the last tick.
      const currentAngle = this.hingeAngle_(bMotor);
      const lastMotorAngle = this.lastMotorAngles_[port];
      let deltaAngle = 0;
      if (lastMotorAngle > Math.PI / 2 && currentAngle < -Math.PI / 2) {
        deltaAngle = currentAngle + 2 * Math.PI - lastMotorAngle;
      } else if (lastMotorAngle < -Math.PI / 2 && currentAngle > Math.PI / 2) {
        deltaAngle = currentAngle - 2 * Math.PI - lastMotorAngle;
      } else {
        deltaAngle = currentAngle - lastMotorAngle;
      }
      this.lastMotorAngles_[port] = currentAngle;

      const angularVelocity = deltaAngle / delta;

      const {
        position,
        kP,
        kD,
        kI,
        direction
      } = abstractMotor;
      let { pwm, mode, positionGoal, speedGoal, done } = abstractMotor;

      // Convert to ticks
      const positionDeltaRaw = plug * deltaAngle / (2 * Math.PI) * ticksPerRevolution + this.positionDeltaFracs_[port];



      const positionDelta = Math.trunc(positionDeltaRaw);
      this.positionDeltaFracs_[port] = positionDeltaRaw - positionDelta;


      const velocity = plug * angularVelocity / (2 * Math.PI) * ticksPerRevolution;

      nextPositions[port] = position + positionDelta;

      writeCommands.push(WriteCommand.addMotorPosition({ port, positionDelta }));

      

      let writePwm = true;

      if (mode === Motor.Mode.Pwm && direction === Motor.Direction.Idle) {
        this.setMotorVelocity_(bMotor, 0);
        continue;
      }

      if (mode === Motor.Mode.Pwm && direction === Motor.Direction.Brake) {
        if (this.brakeAt_[port] === undefined) {
          this.brakeAt_[port] = position;
          this.lastPErrs_[port] = 0;
          this.iErrs_[port] = 0;
        }

        done = false;

        if (this.brakeAt_[port] === position) {
          mode = Motor.Mode.Pwm;
          pwm = 0;
        } else {
          mode = Motor.Mode.SpeedPosition;
          positionGoal = this.brakeAt_[port];
          speedGoal = position > positionGoal ? -2 : 2;
        }

        writePwm = false;
      } else {
        this.brakeAt_[port] = undefined;
      }

      const velocityMax = motorNode.velocityMax || 1500;

      if (mode !== Motor.Mode.Pwm && !done) {
        // This code is taken from Wombat-Firmware for parity.
        const pErr = speedGoal - velocity;
        const dErr = pErr - this.lastPErrs_[port];
        this.lastPErrs_[port] = pErr;

        const iErr = clamp(-10000, this.iErrs_[port] + pErr, 10000);
        this.iErrs_[port] = iErr;

        pwm = speedGoal / velocityMax * 400;
        pwm = pwm + kP * pErr + kI * iErr + kD * dErr;

        if (mode === Motor.Mode.Position || mode === Motor.Mode.SpeedPosition) {
          if (speedGoal < 0 && position < positionGoal) {
            pwm = 0;
            writeCommands.push(WriteCommand.motorDone({ port, done: true }));
          } else if (speedGoal > 0 && position > positionGoal) {
            pwm = 0;
            writeCommands.push(WriteCommand.motorDone({ port, done: true }));
          }
        }
      } else {
        this.lastPErrs_[port] = 0;
        this.iErrs_[port] = 0;
      }

      pwm = plug * clamp(-400, pwm, 400);

      if (writePwm) writeCommands.push(WriteCommand.motorPwm({ port, pwm }));
      
      const normalizedPwm = pwm / 400;
      const nextAngularVelocity = normalizedPwm * velocityMax * 2 * Math.PI / ticksPerRevolution;

      this.setMotorVelocity_(bMotor, nextAngularVelocity);
    }


    // Servos
    for (let i = 0; i < 4; i++) {
      const servoId = this.servoPorts_[i];

      // If no servo is bound to the port, skip it.
      if (!servoId) continue;

      const servo = this.robot_.nodes[servoId];
      if (!servo) throw new Error(`Missing servo: ${servoId}`);
      if (servo.type !== Node.Type.Servo) throw new Error(`Invalid servo type: ${servo.type}`);

      const bServo = this.servos_[servoId];
      if (!bServo) throw new Error(`Missing motor instantiation: "${servoId}" on port ${i}`);

      const abstractServo = readable.getServo(i);

      const position = servo.position ?? {};

      const physicalMin = position.min ?? RobotBinding.SERVO_LOGICAL_MIN_ANGLE;
      const physicalMax = position.max ?? RobotBinding.SERVO_LOGICAL_MAX_ANGLE;

      const twist = Angle.toRadiansValue(servo.childTwist || Angle.degrees(0));

      const physicalMinRads = Angle.toRadiansValue(physicalMin) + twist;
      const physicalMaxRads = Angle.toRadiansValue(physicalMax) + twist;

      if (abstractServo.enabled) {
        const servoPosition = clamp(0, abstractServo.position, 2048);
        const desiredAngle = (servoPosition - 1024) / 2048 * RobotBinding.SERVO_LOGICAL_RANGE_RADS;
        this.lastServoEnabledAngle_[i] = -desiredAngle + twist;
      }

      bServo.executeNativeFunction((world, joint) => {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

        joint.setLimit(physicalMinRads, physicalMaxRads, 0.9, 0.3, 1);
        joint.setMaxMotorImpulse(10000);
        const angle = this.lastServoEnabledAngle_[i];
        if (Math.abs(angle - joint.getHingeAngle()) > Math.PI / 8) {
          joint.setMotorTarget(angle, 0.2);
        } else {
          joint.setMotorTarget(angle, 0.1);
        }
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
      });
    }

    // Digital Sensors
    const digitalValues: AbstractRobot.Stateless.DigitalValues = [false, false, false, false, false, false];
    for (let i = 0; i < 6; ++i) {
      const digitalId = this.digitalPorts_[i];
      if (!digitalId) continue;

      const digital = this.digitalSensors_[digitalId];
      if (!digital) throw new Error(`Missing digital sensor: ${digitalId}`);

      const outstanding = this.outstandingDigitalGetValues_[digitalId];
      if (!outstanding) {
        this.outstandingDigitalGetValues_[digitalId] = RobotBinding.OutstandingPromise.create(digital.getValue());
      } else {
        if (RobotBinding.OutstandingPromise.isDone(outstanding)) {
          this.latestDigitalValues_[i] = RobotBinding.OutstandingPromise.value(outstanding);
          this.outstandingDigitalGetValues_[digitalId] = RobotBinding.OutstandingPromise.create(digital.getValue());
        }
      }

      digitalValues[i] = this.latestDigitalValues_[i];
      writeCommands.push(WriteCommand.digitalIn({ port: i, value: digitalValues[i] }));
    }

    const analogValues: AbstractRobot.Stateless.AnalogValues = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 6; ++i) {
      const analogId = this.analogPorts_[i];
      if (!analogId) continue;

      const analog = this.analogSensors_[analogId];
      if (!analog) throw new Error(`Missing analog sensor: ${analogId}`);

      const outstanding = this.outstandingAnalogGetValues_[analogId];
      if (!outstanding) {
        this.outstandingAnalogGetValues_[analogId] = RobotBinding.OutstandingPromise.create(analog.getValue());
      } else {
        if (RobotBinding.OutstandingPromise.isDone(outstanding)) {
          this.latestAnalogValues_[i] = RobotBinding.OutstandingPromise.value(outstanding);
          this.outstandingAnalogGetValues_[analogId] = RobotBinding.OutstandingPromise.create(analog.getValue());
        }
      }

      analogValues[i] = this.latestAnalogValues_[i];
      writeCommands.push(WriteCommand.analog({ port: i, value: analogValues[i] }));
    }

    return {
      origin: this.origin,
      writeCommands
    };
  }

  get linkOrigins(): Dict<ReferenceFrame> {
    const linkOrigins: Dict<ReferenceFrame> = {};
    for (const [linkId, link] of Object.entries(this.links_)) {
      const rawLinkPosition = RawVector3.fromBabylon(link.position);
      const rawLinkOrientation = Quaternion.fromBabylon(link.rotationQuaternion);
      const rawLinkScale = RawVector3.fromBabylon(link.scaling);

      linkOrigins[linkId] = {
        position: Vector3.fromRaw(rawLinkPosition, RENDER_SCALE),
        orientation: Rotation.Euler.fromRaw(Euler.fromQuaternion(rawLinkOrientation)),
        scale: rawLinkScale
      };
    }
    return linkOrigins;
  }

  set linkOrigins(linkOrigins: Dict<ReferenceFrame>) {
    for (const [linkId, link] of Object.entries(this.links_)) {
      if (!(linkId in linkOrigins)) continue;
      const rawLinkPosition = ReferenceFrame.toRaw(linkOrigins[linkId], RENDER_SCALE);
      link.position = RawVector3.toBabylon(rawLinkPosition.position);
      link.rotationQuaternion = Quaternion.toBabylon(rawLinkPosition.orientation);
      link.scaling = RawVector3.toBabylon(rawLinkPosition.scale);
    }
  }

  get origin(): ReferenceFrame {
    const rootLink = this.links_[this.rootId_];
    const rawOrientation = rootLink.rotationQuaternion;
    const rawInternalOrigin = ReferenceFrame.toRaw(this.robot_.origin || ReferenceFrame.IDENTITY, RENDER_SCALE);

    const orientation = Quaternion.toBabylon(rawOrientation || Quaternion.IDENTITY).multiply(
      Quaternion.toBabylon(rawInternalOrigin.orientation || Quaternion.IDENTITY).invert()
    );

    return {
      position: Vector3.fromRaw(RawVector3.fromBabylon(rootLink.position), RENDER_SCALE),
      orientation: Rotation.Euler.fromRaw(Euler.fromQuaternion(orientation)),
      scale: RawVector3.divideScalar(RawVector3.fromBabylon(rootLink.scaling), RENDER_SCALE_METERS_MULTIPLIER),
    };
  }

  set origin(origin: ReferenceFrame) {

    this.lastPErrs_ = [0, 0, 0, 0];
    this.iErrs_ = [0, 0, 0, 0];
    this.brakeAt_ = [undefined, undefined, undefined, undefined];

    const rawOrigin = ReferenceFrame.toRaw(origin, RENDER_SCALE);
    const rawInternalOrigin = ReferenceFrame.toRaw(this.robot_.origin || ReferenceFrame.IDENTITY, RENDER_SCALE);

    const rootLink = this.links_[this.rootId_];

    const rootTransformNode = new BabylonTransformNode('root-transform-node', this.bScene_);
    rootTransformNode.position = rootLink.absolutePosition;
    rootTransformNode.rotationQuaternion = rootLink.absoluteRotationQuaternion;

    for (const link of Object.values(this.links_)) {
      link.setParent(rootTransformNode);
      link.physicsImpostor.setAngularVelocity(BabylonVector3.Zero());
      link.physicsImpostor.setLinearVelocity(BabylonVector3.Zero());
    }

    for (const weight of Object.values(this.weights_)) {
      weight.setParent(rootTransformNode);
      weight.physicsImpostor.setAngularVelocity(BabylonVector3.Zero());
      weight.physicsImpostor.setLinearVelocity(BabylonVector3.Zero());
    }

    rootTransformNode.position = RawVector3.toBabylon(rawOrigin.position || RawVector3.ZERO)
      .add(RawVector3.toBabylon(rawInternalOrigin.position || RawVector3.ZERO));
    rootTransformNode.rotationQuaternion = Quaternion.toBabylon(rawInternalOrigin.orientation || Quaternion.IDENTITY)
      .multiply(Quaternion.toBabylon(rawOrigin.orientation || Quaternion.IDENTITY));


    for (const link of Object.values(this.links_)) {
      link.setParent(null);
    }

    for (const weight of Object.values(this.weights_)) {
      weight.setParent(null);
    }

    rootTransformNode.dispose();
  }

  get visible(): boolean {
    return this.links_[this.rootId_].visibility === 1;
  }

  set visible(visible: boolean) {
    const visibility = visible ? 1 : 0;
    for (const link of Object.values(this.links_)) {
      link.visibility = visibility;
    }
    for (const analogSensor of Object.values(this.analogSensors_)) {
      analogSensor.visible = visible;
    }
    for (const digitalSensor of Object.values(this.digitalSensors_)) {
      digitalSensor.visible = visible;
    }
  }

  async setRobot(sceneRobot: SceneNode.Robot, robot: Robot, robotSceneId: string) {
    if (this.robot_) throw new Error('Robot already set');
    this.robotSceneId_ = robotSceneId;
    this.robot_ = robot;

    const rootIds = Robot.rootNodeIds(robot);
    if (rootIds.length !== 1) throw new Error('Only one root node is supported');
    
    this.rootId_ = rootIds[0];

    const nodeIds = Robot.breadthFirstNodeIds(robot);
    this.childrenNodeIds_ = Robot.childrenNodeIds(robot);

    if (robot.nodes[this.rootId_].type !== Node.Type.Link) throw new Error('Root node must be a link');

    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type !== Node.Type.Link) continue;
      const bNode = await this.createLink_(nodeId, node);
      bNode.metadata = { id: this.robotSceneId_, selected: false } as SceneMeshMetadata;
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
          break;
        }
        case Node.Type.Servo: {
          const bJoint = this.createHinge_(nodeId, node);
          this.servos_[nodeId] = bJoint;
          this.servoPorts_[node.servoPort] = nodeId;
          break;
        }
        case Node.Type.TouchSensor: {
          const sensorObject = this.createTouchSensor_(nodeId, node);
          this.digitalSensors_[nodeId] = sensorObject;
          this.digitalPorts_[node.digitalPort] = nodeId;
          break;
        }
        case Node.Type.EtSensor: {
          const sensorObject = this.createEtSensor_(nodeId, node);
          this.analogSensors_[nodeId] = sensorObject;
          this.analogPorts_[node.analogPort] = nodeId;
          break;
        }
        case Node.Type.LightSensor: {
          const sensorObject = this.createLightSensor_(nodeId, node);
          this.analogSensors_[nodeId] = sensorObject;
          this.analogPorts_[node.analogPort] = nodeId;
          break;
        }
        case Node.Type.ReflectanceSensor: {
          const sensorObject = this.createReflectanceSensor_(nodeId, node);
          this.analogSensors_[nodeId] = sensorObject;
          this.analogPorts_[node.analogPort] = nodeId;
          break;
        }
        case Node.Type.IRobotCreate: {
          await this.createIRobotCreate_(nodeId, node);
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

    for (const digitalSensor of Object.values(this.digitalSensors_)) digitalSensor.dispose();
    this.digitalSensors_ = {};

    for (const analogSensor of Object.values(this.analogSensors_)) analogSensor.dispose();
    this.analogSensors_ = {};

    this.robot_ = null;
  }

  set realisticSensors(realisticSensors: boolean) {
    for (const digitalSensor of Object.values(this.digitalSensors_)) {
      digitalSensor.realistic = realisticSensors;
    }
    for (const analogSensor of Object.values(this.analogSensors_)) {
      analogSensor.realistic = realisticSensors;
    }
  }

  set noisySensors(noisySensors: boolean) {
    for (const digitalSensor of Object.values(this.digitalSensors_)) {
      digitalSensor.noisy = noisySensors;
    }
    for (const analogSensor of Object.values(this.analogSensors_)) {
      analogSensor.noisy = noisySensors;
    }
  }
}

namespace RobotBinding {
  export interface TickOut {
    /**
     * The new origin of the robot
     */
    origin: ReferenceFrame;

    writeCommands: WriteCommand[];
  }

  export namespace TickOut {
    export const NIL: TickOut = {
      origin: ReferenceFrame.IDENTITY,
      writeCommands: [],
    };
  }

  export interface OutstandingPromise<T> {
    // Done needs to be wrapped in an object so we can access by reference.
    doneObj: { done: boolean; };
    valueObj: { value: T };
  }

  export namespace OutstandingPromise {
    export const create = <T>(promise: Promise<T>): OutstandingPromise<T> => {
      const doneObj = { done: false };
      const valueObj = { value: undefined };
      void promise.then(v => {
        valueObj.value = v;
        doneObj.done = true;
      });
      return { doneObj, valueObj };
    };

    export const isDone = <T>(promise: OutstandingPromise<T>): boolean => promise.doneObj.done;
    export const value = <T>(promise: OutstandingPromise<T>): T => promise.valueObj.value;
  }

  

  export const SERVO_LOGICAL_MIN_ANGLE = Angle.degrees(-90.0);
  export const SERVO_LOGICAL_MAX_ANGLE = Angle.degrees(90.0);

  export const SERVO_LOGICAL_MIN_ANGLE_RADS = Angle.toRadiansValue(SERVO_LOGICAL_MIN_ANGLE);
  export const SERVO_LOGICAL_MAX_ANGLE_RADS = Angle.toRadiansValue(SERVO_LOGICAL_MAX_ANGLE);

  export const SERVO_LOGICAL_RANGE_RADS = SERVO_LOGICAL_MAX_ANGLE_RADS - SERVO_LOGICAL_MIN_ANGLE_RADS;
}

export default RobotBinding;