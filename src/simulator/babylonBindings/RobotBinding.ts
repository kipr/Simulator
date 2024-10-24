
import { Scene as babylonScene, TransformNode, PhysicsViewer, Vector3, IPhysicsEnabledObject, 
  Mesh, PhysicsJoint, IPhysicsEnginePluginV2, PhysicsConstraintAxis, Physics6DoFConstraint, 
  PhysicsConstraintMotorType, PhysicsConstraintAxisLimitMode, 
} from '@babylonjs/core';

import '@babylonjs/core/Physics/physicsEngineComponent';

import SceneNode from '../../state/State/Scene/Node';
import Robot from '../../state/State/Robot';
import Node from '../../state/State/Robot/Node';
import { RawQuaternion, RawVector3, clamp, RawEuler } from '../../util/math/math';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../util/math/unitMath';
import { Angle } from '../../util/math/Value';
import { SceneMeshMetadata } from './SceneBinding';
import Dict from '../../util/objectOps/Dict';
import { RENDER_SCALE, RENDER_SCALE_METERS_MULTIPLIER } from '../../components/constants/renderConstants';
import WriteCommand from '../../programming/AbstractRobot/WriteCommand';
import AbstractRobot from '../../programming/AbstractRobot';
import Motor from '../../programming/AbstractRobot/Motor';
import { createLink } from './createRobotObjects/createLink';
import { createHinge } from './createRobotObjects/createMotor';
import { createWeight } from './createRobotObjects/createWeight';
import CreateBinding from './CreateBinding';
import workerInstance from '../../programming/WorkerInstance';
import Sensor from './sensors/Sensor';
import EtSensor from './sensors/EtSensor';
import TouchSensor from './sensors/TouchSensor';
import ReflectanceSensor from './sensors/ReflectanceSensor';
import SensorObject from './sensors/SensorObject';
import SensorParameters from './sensors/SensorParameters';
import LightSensor from './sensors/LightSensor';

class RobotBinding {
  /**  Type 'RobotBinding' is missing the following properties from type 
   * 'RobotBindingLike': scene, colliders, physicsViewer,  */
  private bScene_: babylonScene;

  private robot_: Robot;
  get robot() { return this.robot_; }

  private childrenNodeIds_: Dict<string[]>;

  private rootId_: string;
  private robotSceneId_: string;

  private links_: Dict<Mesh> = {};

  get links() { return this.links_; }

  private weights_: Dict<Mesh> = {};
  private fixed_: Dict<PhysicsJoint> = {};
  private motors_: Dict<Physics6DoFConstraint> = {};
  private servos_: Dict<Physics6DoFConstraint> = {};
  private motorPorts_ = new Array<string>(4);
  private servoPorts_ = new Array<string>(4);

  private digitalSensors_: Dict<Sensor<boolean>> = {};
  private digitalPorts_ = new Array<string>(6);

  private analogSensors_: Dict<Sensor<number>> = {};
  private analogPorts_ = new Array<string>(6);

  private colliders_: Set<Mesh> = new Set();

  private physicsViewer_: PhysicsViewer;
  private _physicsPlugin: IPhysicsEnginePluginV2;

  private createBinding_: CreateBinding;
  private createMotors_: Dict<Physics6DoFConstraint> = {};
  private createAnalogSensors_: Dict<Sensor<number>> = {};
  private createDigitalSensors_: Dict<Sensor<boolean>> = {};


  get createBinding() { return this.createBinding_; }

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

  constructor(bScene: babylonScene, physicsViewer?: PhysicsViewer) {
    this.bScene_ = bScene;
    this.physicsViewer_ = physicsViewer;
    this._physicsPlugin = bScene.getPhysicsEngine()?.getPhysicsPlugin() as IPhysicsEnginePluginV2;
  }


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

  // These return functions are used to create sensors of a specific type.
  private createTouchSensor_ = this.createSensor_(TouchSensor);
  private createEtSensor_ = this.createSensor_(EtSensor);
  private createLightSensor_ = this.createSensor_(LightSensor);
  private createReflectanceSensor_ = this.createSensor_(ReflectanceSensor);

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

  private bParentChild_ = (id: string, parentId: string): { bParent: Mesh; bChild: Mesh; childId: string; } => {
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

  /**
   * Gets the angle between the parent and child links. 
   * Currently only supports angles between -90 and 90 degrees.
   * TODO: Fix this to support angles between -180 and 180 degrees.
   * @param id 
   * @param parentId 
   * @returns 
   */
  private hingeAngle_ = (id: string, parentId: string): number => {
    const { bParent, bChild } = this.bParentChild_(id, parentId);
    const parentZ = bParent.rotationQuaternion.toEulerAngles().x;
    const childZ = bChild.rotationQuaternion.toEulerAngles().x;
    const diff = childZ - parentZ; // Between -90 and 90 degrees
    return diff;
  };


  /**
   * Sets the motor to the desired velocity. 
   * @param bMotor 
   * @param velocity 
   */
  private setMotorVelocity_ = (bMotor: Physics6DoFConstraint, velocity: number) => {

    const maxForce = 50000;

    bMotor.setAxisFriction(PhysicsConstraintAxis.ANGULAR_Z, 0);
    bMotor.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_Z, maxForce); 
    bMotor.setAxisMode(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintAxisLimitMode.FREE);
    bMotor.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, velocity);

  };

  tick(readable: AbstractRobot.Readable): RobotBinding.TickOut {
    // TODO: Motor Bindings need to be cleaned up to handle motor position explicitly.
    const motorPositionDeltas: [number, number, number, number] = [0, 0, 0, 0];

    const writeCommands: WriteCommand[] = [];

    // Get how much time has passed since the last tick. (delta)
    const now = performance.now();
    const delta = (now - this.lastTick_) / 1000;
    this.lastTick_ = now;

    if (this.createBinding_) {
      this.createBinding_.tick(delta);
    }

    // Read motor registers
    const abstractMotors: [Motor, Motor, Motor, Motor] = [
      readable.getMotor(0),
      readable.getMotor(1),
      readable.getMotor(2),
      readable.getMotor(3)
    ];

    // Work around for stopping movement after the Stop button is pressed.
    if (abstractMotors[0].direction === Motor.Direction.Brake && this.createBinding_) {
      this.createBinding_.leftVelocity_ = 0;
      this.createBinding_.rightVelocity_ = 0;
      // console.log("brake");
    }

    // Update motor position deltas
    const nextPositions: [number, number, number, number] = [0, 0, 0, 0];
    /** At some point this should be done with limits the way the servos are
     * where the motor limits are set each tick to where the motor should end up.
     */
    for (let port = 0; port < 4; ++port) {
      const motorId = this.motorPorts_[port];
      
      // If no motor is bound to the port, skip it.
      if (!motorId) continue;

      const abstractMotor = abstractMotors[port]; // Contains the instructions for what to do.
      const { position, kP, kD, kI, direction } = abstractMotor;
      // eslint-disable-next-line prefer-const
      let { pwm, mode, positionGoal, speedGoal, done } = abstractMotor;

      const motorNode = this.robot_.nodes[motorId] as Node.Motor; // Contains the physical properties of the motor.
      const bMotor = this.motors_[motorId]; // The actual motor object. (Physics6DoFConstraint)
      const ticksPerRevolution = motorNode.ticksPerRevolution ?? 2048;

      // TODO: Fix wheel orientation in MotorBindings so plug is needed.
      // const plug = (motorNode.plug === undefined || motorNode.plug === 'normal') ? 1 : -1;
      const plug = 1;

      const currentAngle = this.hingeAngle_(motorId, motorNode.parentId);
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

      // if speedgoal is positive make deltaAngle positive
      if (speedGoal > 0) {
        deltaAngle = Math.abs(deltaAngle);
      } else if (speedGoal < 0) {
        deltaAngle = -1 * Math.abs(deltaAngle);
      }

      // Convert to ticks
      const positionDeltaRaw = plug * deltaAngle / (2 * Math.PI) * ticksPerRevolution + this.positionDeltaFracs_[port];

      const positionDelta = Math.trunc(positionDeltaRaw);
      this.positionDeltaFracs_[port] = positionDeltaRaw - positionDelta;


      const velocity = plug * angularVelocity / (2 * Math.PI) * ticksPerRevolution;

      nextPositions[port] = position + positionDelta;

      writeCommands.push(WriteCommand.addMotorPosition({ port, positionDelta }));

      const writePwm = true;

      const velocityMax = motorNode.velocityMax || 1500;

      // If the motor is in pwm mode and the direction is idle, set the motor target to 0.
      if (mode === Motor.Mode.Pwm && (direction === Motor.Direction.Idle || direction === Motor.Direction.Brake)) {
        this.setMotorVelocity_(bMotor, 0);
        if (Math.abs(velocity) < 10) {
          bMotor.setAxisMode(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintAxisLimitMode.LOCKED);
        }
        continue;
      }

      // If the motor is in pwm mode and the direction is brake
      //   1. Check if we know the brake target, if not set it for the current position
      //   2. If the motor is at the brake target, set the motor target to 0.
      //   3. If the motor is not at the brake target, set the speed towards the brake target.
      // if (mode === Motor.Mode.Pwm && direction === Motor.Direction.Brake) {
      //   if (this.brakeAt_[port] === undefined) {
      //     this.brakeAt_[port] = positionDeltaRaw;
      //     this.lastPErrs_[port] = 0;
      //     this.iErrs_[port] = 0;
      //   }

      //   if (this.brakeAt_[port] === position) {
      //     mode = Motor.Mode.Pwm;
      //     pwm = 0;
      //   } else {
      //     mode = Motor.Mode.SpeedPosition;
      //     positionGoal = this.brakeAt_[port];
      //     speedGoal = position > positionGoal ? -2 : 2;
      //   }
      //   done = false;
      //   // speedGoal = 0;
      //   writePwm = false;

      // } else {
      //   this.brakeAt_[port] = undefined;
      // }

      
      let pwm_adj = 0;
      // If the motor is not in pwm mode, and we are not done, calculate the pwm value.
      if (mode !== Motor.Mode.Pwm && !done) {
        
        // This code is taken from Wombat-Firmware for parity.
        const pErr = speedGoal - velocity;
        const dErr = pErr - this.lastPErrs_[port];
        this.lastPErrs_[port] = pErr;

        const iErr = clamp(-10000, this.iErrs_[port] + pErr, 10000);
        this.iErrs_[port] = iErr;

        pwm = speedGoal / velocityMax * 400;
        pwm_adj = kP * pErr + kI * iErr + kD * dErr;
        pwm = pwm + pwm_adj;

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
      console.log("nextAngularVelocity", nextAngularVelocity);
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

        // TODO: Fix so claw is handled correctly
        if (servoId.includes("claw")) {
          this.lastServoEnabledAngle_[i] = -desiredAngle + twist;
        } else {
          this.lastServoEnabledAngle_[i] = -1 * (-desiredAngle + twist);

        }
      }

      const currentAngle = this.hingeAngle_(servoId, servo.parentId);   
      const targetAangle = this.lastServoEnabledAngle_[i];

      let cur_angle = 0;
      const cur_direction = bServo.getAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z) > 0;
      if (cur_direction) {
        cur_angle = bServo.getAxisMaxLimit(PhysicsConstraintAxis.ANGULAR_Z);
      } else {
        cur_angle = bServo.getAxisMinLimit(PhysicsConstraintAxis.ANGULAR_Z);
      }

      if (cur_angle.toFixed(5) !== targetAangle.toFixed(5)) {
        if (cur_angle < targetAangle) {
          bServo.setAxisMaxLimit(PhysicsConstraintAxis.ANGULAR_Z, targetAangle); 
          bServo.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, Math.PI * .4);
        }
        if (cur_angle > targetAangle) {
          bServo.setAxisMinLimit(PhysicsConstraintAxis.ANGULAR_Z, targetAangle);
          bServo.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, Math.PI * -.4);
        }
      }
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

    // Analog Sensors
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

  get linkOrigins(): Dict<ReferenceFramewUnits> {
    const linkOrigins: Dict<ReferenceFramewUnits> = {};
    for (const [linkId, link] of Object.entries(this.links_)) {
      const rawLinkPosition = RawVector3.fromBabylon(link.position);
      const rawLinkOrientation = RawQuaternion.fromBabylon(link.rotationQuaternion);
      const rawLinkScale = RawVector3.fromBabylon(link.scaling);

      linkOrigins[linkId] = {
        position: Vector3wUnits.fromRaw(rawLinkPosition, RENDER_SCALE),
        orientation: RotationwUnits.EulerwUnits.fromRaw(RawEuler.fromQuaternion(rawLinkOrientation)),
        scale: rawLinkScale
      };
    }
    return linkOrigins;
  }

  set linkOrigins(newLinkOrigins: Dict<ReferenceFramewUnits>) {
    for (const [linkId, link] of Object.entries(this.links_)) {
      if (!(linkId in newLinkOrigins)) continue;
      const rawLinkPosition = ReferenceFramewUnits.toRaw(newLinkOrigins[linkId], RENDER_SCALE);
      link.position = RawVector3.toBabylon(rawLinkPosition.position);
      link.rotationQuaternion = RawQuaternion.toBabylon(rawLinkPosition.orientation);
      link.scaling = RawVector3.toBabylon(rawLinkPosition.scale);
    }
  }

  get origin(): ReferenceFramewUnits {
    const rootLink = this.links_[this.rootId_];
    const rawOrientation = rootLink.rotationQuaternion;
    const rawInternalOrigin = ReferenceFramewUnits.toRaw(this.robot_.origin || ReferenceFramewUnits.IDENTITY, RENDER_SCALE);

    const orientation = RawQuaternion.toBabylon(rawOrientation || RawQuaternion.IDENTITY).multiply(
      RawQuaternion.toBabylon(rawInternalOrigin.orientation || RawQuaternion.IDENTITY).invert()
    );

    return {
      position: Vector3wUnits.fromRaw(RawVector3.fromBabylon(rootLink.position), RENDER_SCALE),
      orientation: RotationwUnits.EulerwUnits.fromRaw(RawEuler.fromQuaternion(orientation)),
      scale: RawVector3.divideScalar(RawVector3.fromBabylon(rootLink.scaling), RENDER_SCALE_METERS_MULTIPLIER),
    };
  }

  // To set the origin, a root node is set, the robot is parented to the node, and then the node is moved.
  set origin(newOrigin: ReferenceFramewUnits) {

    this.lastPErrs_ = [0, 0, 0, 0];
    this.iErrs_ = [0, 0, 0, 0];
    this.brakeAt_ = [undefined, undefined, undefined, undefined];

    const rawOrigin = ReferenceFramewUnits.toRaw(newOrigin, RENDER_SCALE);
    const rawInternalOrigin = ReferenceFramewUnits.toRaw(this.robot_.origin || ReferenceFramewUnits.IDENTITY, RENDER_SCALE);

    const newOriginE = RawEuler.fromQuaternion(rawOrigin.orientation);
    const Robot_OriginE = RawEuler.fromQuaternion(rawInternalOrigin.orientation);

    const default_offset = 0; // -1 * Math.PI / 2;


    const UpdatedEulerOrigin = RawEuler.create(
      newOriginE.x + Robot_OriginE.x,
      newOriginE.y + Robot_OriginE.y + default_offset,
      newOriginE.z + Robot_OriginE.z,
      "xyz"
    );

    const rootLink = this.links_[this.rootId_];

    const rootTransformNode = new TransformNode('root-transform-node', this.bScene_);
    rootTransformNode.position = rootLink.absolutePosition;
    rootTransformNode.rotationQuaternion = rootLink.absoluteRotationQuaternion;

    for (const link of Object.values(this.links_)) {
      link.physicsBody.disablePreStep = false;
      link.setParent(rootTransformNode);
      link.physicsBody.setAngularVelocity(Vector3.Zero());
      link.physicsBody.setLinearVelocity(Vector3.Zero());
    }

    for (const weight of Object.values(this.weights_)) {
      weight.physicsBody.disablePreStep = false;
      weight.setParent(rootTransformNode);
      weight.physicsBody.setAngularVelocity(Vector3.Zero());
      weight.physicsBody.setLinearVelocity(Vector3.Zero());
    }
    
    rootTransformNode.position = RawVector3.toBabylon(rawOrigin.position || RawVector3.ZERO)
      .add(RawVector3.toBabylon(rawInternalOrigin.position || RawVector3.ZERO));
    
    rootTransformNode.rotationQuaternion = RawQuaternion.toBabylon(RawEuler.toQuaternion(UpdatedEulerOrigin));

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

  // Entry point for actually setting up a robot
  async setRobot(sceneRobot: SceneNode.Robot, robot: Robot, robotSceneId: string) {
    if (this.robot_) throw new Error('Robot already set');
    this.robotSceneId_ = robotSceneId;
    robot.origin = sceneRobot.origin;

    this.robot_ = robot;

    // Set Root
    const rootIds = Robot.rootNodeIds(robot);
    if (rootIds.length !== 1) throw new Error('Only one root node is supported');
    this.rootId_ = rootIds[0];
    const rootNode = robot.nodes[this.rootId_];
    if (robot.nodes[this.rootId_].type !== Node.Type.Link) throw new Error('Root node must be a link');

    const nodeIds = Robot.breadthFirstNodeIds(robot);
    this.childrenNodeIds_ = Robot.childrenNodeIds(robot);

    // Links are the physical objects and need to be set up before the 
    // rest of the nodes
    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type !== Node.Type.Link) continue;

      const bNode = await createLink(nodeId, node, this.bScene_, this.robot_, this.colliders_);
      if (this.physicsViewer_ && bNode.physicsBody) this.physicsViewer_.showBody(bNode.physicsBody);    

      bNode.metadata = { id: this.robotSceneId_, selected: false } as SceneMeshMetadata;
      this.links_[nodeId] = bNode;
    }

    // Next we set up all the objects that are attached to the links
    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type === Node.Type.Link || node.type === Node.Type.IRobotCreate) continue;
    
      switch (node.type) {
        case Node.Type.Weight: {
          const bNode = createWeight(nodeId, node, this.bScene_, this.robot_, this.links_);
          this.weights_[nodeId] = bNode;
          break;
        }
        case Node.Type.Motor: {
          const { bParent, bChild } = this.bParentChild_(nodeId, node.parentId);
          const bJoint = createHinge(nodeId, node, this.bScene_, bParent, bChild);

          bJoint.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_Z, 1000000000); 
          bJoint.setAxisMotorType(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintMotorType.VELOCITY);
          // Start motor in locked position so the wheels don't slide
          bJoint.setAxisMode(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintAxisLimitMode.LOCKED);

          if (node.parentId === 'create') {
            this.createMotors_[nodeId] = bJoint;
          } else {
            this.motors_[nodeId] = bJoint;
            this.motorPorts_[node.motorPort] = nodeId;
          }
          break;
        }
        case Node.Type.Servo: {
          // minLimit: -30 * Math.PI / 180, maxLimit: -30 * Math.PI / 180,
          // -90 is upright and closed; 0 is forward and open
          const { bParent, bChild } = this.bParentChild_(nodeId, node.parentId);
          const bJoint = createHinge(nodeId, node, this.bScene_, bParent, bChild);
          bJoint.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_Z, 10000000); 
          bJoint.setAxisMotorType(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintMotorType.VELOCITY); 
          // Start the servos at 0
          bJoint.setAxisMaxLimit(PhysicsConstraintAxis.ANGULAR_Z, Angle.toRadiansValue(Angle.degrees(0))); 
          bJoint.setAxisMinLimit(PhysicsConstraintAxis.ANGULAR_Z, Angle.toRadiansValue(Angle.degrees(-1)));

          this.servos_[nodeId] = bJoint;
          this.servoPorts_[node.servoPort] = nodeId;
          this.lastServoEnabledAngle_[node.servoPort] = Angle.toRadiansValue(Angle.degrees(-1));
          break;
        }
        case Node.Type.TouchSensor: {
          const sensorObject = this.createTouchSensor_(nodeId, node);
          if (node.parentId === 'create') {
            this.createDigitalSensors_[nodeId] = sensorObject;
          } else {
            this.digitalSensors_[nodeId] = sensorObject;
            this.digitalPorts_[node.digitalPort] = nodeId;
          }
          break;
        }
        case Node.Type.EtSensor: {
          const sensorObject = this.createEtSensor_(nodeId, node);
          if (node.parentId === 'create') {
            this.createAnalogSensors_[nodeId] = sensorObject;
          } else {
            this.analogSensors_[nodeId] = sensorObject;
            this.analogPorts_[node.analogPort] = nodeId;
          }
          break;
        }
        case Node.Type.LightSensor: {
          const sensorObject = this.createLightSensor_(nodeId, node);
          if (node.parentId === 'create') {
            this.createAnalogSensors_[nodeId] = sensorObject;
          } else {
            this.analogSensors_[nodeId] = sensorObject;
            this.analogPorts_[node.analogPort] = nodeId;
          }
          break;
        }
        case Node.Type.ReflectanceSensor: {
          const sensorObject = this.createReflectanceSensor_(nodeId, node);
          if (node.parentId === 'create') {
            this.createAnalogSensors_[nodeId] = sensorObject;
          } else {
            this.analogSensors_[nodeId] = sensorObject;
            this.analogPorts_[node.analogPort] = nodeId;
          }
          break;
        }
      }
    }
    // If any nodes are connected to the create we add them to it here.
    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type !== Node.Type.IRobotCreate) continue;
      this.createBinding_ = new CreateBinding(
        workerInstance.createSerial, 
        this.createMotors_, 
        this.createAnalogSensors_, 
        this.createDigitalSensors_
      );
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
}




namespace RobotBinding {
  export interface TickOut {
    /**
     * The new origin of the robot
     */
    origin: ReferenceFramewUnits;

    writeCommands: WriteCommand[];
  }

  export namespace TickOut {
    export const NIL: TickOut = {
      origin: ReferenceFramewUnits.IDENTITY,
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