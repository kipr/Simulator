
import { Scene as babylScene, TransformNode, AbstractMesh, LinesMesh, PhysicsViewer, CreateBox, CreateSphere, 
  IcoSphereBuilder, CreateLines, Quaternion, Vector3, StandardMaterial, IPhysicsEnabledObject, 
  SpotLight, DirectionalLight, HemisphericLight, Mesh, SceneLoader, PhysicsJoint, Ray,
  PhysicsBody, PhysicsConstraintAxis, Physics6DoFConstraint, PhysicsMotionType, PhysicsShape, 
  PhysicsAggregate,   PhysicsShapeType, PhysicsConstraintMotorType, PhysicShapeOptions, 
  PhysicsShapeParameters, LockConstraint, PhysicsShapeContainer, HingeConstraint, PhysicsConstraintAxisLimitMode 
} from '@babylonjs/core';

import '@babylonjs/core/Physics/physicsEngineComponent';

import SceneNode from '../state/State/Scene/Node';
import Robot from '../state/State/Robot';
import Node from '../state/State/Robot/Node';
import { RawQuaternion, RawVector3, clamp, RawEuler } from '../util/math/math';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../util/math/UnitMath';
import { Angle, Distance, Mass } from '../util/math/Value';
import { SceneMeshMetadata } from './SceneBinding';
import Dict from '../util/objectOps/Dict';
import { RENDER_SCALE, RENDER_SCALE_METERS_MULTIPLIER } from '../components/Constants/renderConstants';
import WriteCommand from '../AbstractRobot/WriteCommand';
import AbstractRobot from '../AbstractRobot';
import Motor from '../AbstractRobot/Motor';
import { createLink_ } from './RobotLink';
import { createHinge_ } from './MotorBindings';
import { createWeight_ } from './WeightBinding';

class RobotBinding {
  private bScene_: babylScene;

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

  private digitalSensors_: Dict<RobotBinding.Sensor<boolean>> = {};
  private digitalPorts_ = new Array<string>(6);

  private analogSensors_: Dict<RobotBinding.Sensor<number>> = {};
  private analogPorts_ = new Array<string>(6);

  private colliders_: Set<Mesh> = new Set();

  private physicsViewer_: PhysicsViewer;


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

  constructor(bScene: babylScene, physicsViewer?: PhysicsViewer) {
    this.bScene_ = bScene;
    this.physicsViewer_ = physicsViewer;
  }


  private createSensor_ = <T extends Node.FrameLike, O, S extends RobotBinding.SensorObject<T, O>>(s: { new(parameters: RobotBinding.SensorParameters<T>): S }) => (id: string, definition: T): S => {
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
  private createTouchSensor_ = this.createSensor_(RobotBinding.TouchSensor);
  private createEtSensor_ = this.createSensor_(RobotBinding.EtSensor);
  private createLightSensor_ = this.createSensor_(RobotBinding.LightSensor);
  private createReflectanceSensor_ = this.createSensor_(RobotBinding.ReflectanceSensor);

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

  // Transform a vector using the child frame's orientation. This operation is invariant on a single
  // axis, so we return a new quaternion with the leftover rotation.
  // private static connectedAxisAngle_ = (rotationAxis: Vector3, childOrientation: Quaternion): { axis: Vector3, twist: Quaternion } => {
  //   const childOrientationInv = childOrientation.invert();
  //   const axis = rotationAxis.applyRotationQuaternion(childOrientationInv);
  //   const v = new Vector3(childOrientationInv.x, childOrientationInv.y, childOrientationInv.z);
  //   const s = childOrientationInv.w;
  //   v.multiplyInPlace(axis);
  //   const twist = new Quaternion(v.x, v.y, v.z, s);
  //   twist.normalize();
   
  //   return {
  //     axis,
  //     twist,
  //   };
  // };

  tick(readable: AbstractRobot.Readable): RobotBinding.TickOut {
    // TODO: Motor Bindings need to be cleaned up to handle motor position explicitly.
    const motorPositionDeltas: [number, number, number, number] = [0, 0, 0, 0];

    const writeCommands: WriteCommand[] = [];

    const now = performance.now();
    const delta = (now - this.lastTick_) / 1000;
    this.lastTick_ = now;

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
      // Assumes the current hinge angle is the last target of the axis motor.
      // TODO: implement a method using relative poses to get the actual angle.
      const currentAngle: number = bMotor.getAxisMotorTarget(0);
      // const currentAngle = this.hingeAngle_(bMotor);
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
        bMotor.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, 0);
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
      let direction_mult = 2;
      if (motorId.includes("left")) {
        direction_mult *= -1;
      }
      const nextAngularVelocity = direction_mult * normalizedPwm * velocityMax * 1 * Math.PI / ticksPerRevolution;
      const currentAngularVelocity = bMotor.getAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z);

      if (currentAngularVelocity.toFixed(6) !== nextAngularVelocity.toFixed(6)) { // comparison is aproximately unequal to 5 decimals
        const pid_aproximator = 20;
        const intermediate_target = (nextAngularVelocity + pid_aproximator * currentAngularVelocity) / (pid_aproximator + 1);
        // console.log(`Setting motor ${motorId} to ${intermediate_target} from (${currentAngularVelocity})`);
        const zero = 0.0;
        if (intermediate_target.toFixed(6) === zero.toFixed(6)) {
          bMotor.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, 0);
          bMotor.setAxisFriction(PhysicsConstraintAxis.ANGULAR_Z, 10000000);
          // bMotor.setAxisMode(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintAxisLimitMode.LOCKED);
        } else {
          bMotor.setAxisMode(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintAxisLimitMode.FREE);
        }
        bMotor.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, intermediate_target);
      }
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
        if (servoId.includes("claw")) {
          this.lastServoEnabledAngle_[i] = -desiredAngle + twist;

        } else {
          this.lastServoEnabledAngle_[i] = -1 * (-desiredAngle + twist);

        }
      }

   
      const angle = this.lastServoEnabledAngle_[i];

      let cur_angle = 0;
      const cur_direction = bServo.getAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z) > 0;
      if (cur_direction) {
        cur_angle = bServo.getAxisMaxLimit(PhysicsConstraintAxis.ANGULAR_Z);
      } else {
        cur_angle = bServo.getAxisMinLimit(PhysicsConstraintAxis.ANGULAR_Z);
      }

      if (cur_angle.toFixed(5) !== angle.toFixed(5)) {
        // console.log(`Setting servo ${servoId} to ${angle * 180 / Math.PI} from (${cur_angle * 180 / Math.PI})`);
        if (cur_angle < angle) {
          bServo.setAxisMaxLimit(PhysicsConstraintAxis.ANGULAR_Z, angle); 
          bServo.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, Math.PI * .4);
        }
        if (cur_angle > angle) {
          bServo.setAxisMinLimit(PhysicsConstraintAxis.ANGULAR_Z, angle);
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

    const default_offset = -1 * Math.PI / 2;


    const UpdatedEulerOrigin = RawEuler.create(
      newOriginE.x + Robot_OriginE.x,
      newOriginE.y + Robot_OriginE.y + default_offset,
      newOriginE.z + Robot_OriginE.z,
      "xyz"
    );

    console.log("Set origin orientation to:", UpdatedEulerOrigin);


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

    // Links need to be set up before the rest of the nodes
    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type !== Node.Type.Link) continue;

      const bNode = await createLink_(nodeId, node, this.bScene_, this.robot_, this.colliders_);
      if (this.physicsViewer_ && bNode.physicsBody) this.physicsViewer_.showBody(bNode.physicsBody);    

      bNode.metadata = { id: this.robotSceneId_, selected: false } as SceneMeshMetadata;
      this.links_[nodeId] = bNode;
    }

    // Set up all other types of nodes
    for (const nodeId of nodeIds) {
      const node = robot.nodes[nodeId];
      if (node.type === Node.Type.Link) continue;
    
      switch (node.type) {
        case Node.Type.Weight: {
          const bNode = createWeight_(nodeId, node, this.bScene_, this.robot_, this.links_);
          this.weights_[nodeId] = bNode;
          break;
        }
        case Node.Type.Motor: {
          const { bParent, bChild } = this.bParentChild_(nodeId, node.parentId);
          const bJoint = createHinge_(nodeId, node, this.bScene_, bParent, bChild);

          bJoint.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_Z, 1000000000); 
          bJoint.setAxisMotorType(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintMotorType.VELOCITY);
          // Start motor in locked position so the wheels don't slide
          bJoint.setAxisMode(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintAxisLimitMode.LOCKED);

          this.motors_[nodeId] = bJoint;
          this.motorPorts_[node.motorPort] = nodeId;
          break;
        }
        case Node.Type.Servo: {
          // minLimit: -30 * Math.PI / 180, maxLimit: -30 * Math.PI / 180,
          // -90 is upright and closed; 0 is forward and open
          const { bParent, bChild } = this.bParentChild_(nodeId, node.parentId);
          const bJoint = createHinge_(nodeId, node, this.bScene_, bParent, bChild);
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

  export interface Sensor<T> {
    getValue(): Promise<T>;
    dispose(): void;

    realistic: boolean;
    noisy: boolean;
    visible: boolean;
  }

  export interface SensorParameters<T> {
    id: string;
    definition: T;
    parent: Mesh;
    scene: babylScene;
    links: Set<Mesh>;
    colliders: Set<IPhysicsEnabledObject>;
  }

  export abstract class SensorObject<T, O> implements Sensor<O> {
    private parameters_: SensorParameters<T>;
    get parameters() { return this.parameters_; }

    private realistic_ = false;
    get realistic() { return this.realistic_; }
    set realistic(realistic: boolean) { this.realistic_ = realistic; }

    private visible_ = false;
    get visible() { return this.visible_; }
    set visible(visible: boolean) { this.visible_ = visible; }

    private noisy_ = false;
    get noisy() { return this.noisy_; }
    set noisy(noisy: boolean) { this.noisy_ = noisy; }

    constructor(parameters: SensorParameters<T>) {
      this.parameters_ = parameters;
    }

    abstract getValue(): Promise<O>;

    abstract dispose(): void;
  }

  export class TouchSensor extends SensorObject<Node.TouchSensor, boolean> {
    private intersector_: Mesh;
    
    constructor(parameters: SensorParameters<Node.TouchSensor>) {
      super(parameters);

      const { id, definition, parent, scene } = parameters;
      const { collisionBox, origin } = definition;

      // The parent already has RENDER_SCALE applied, so we don't need to apply it again.
      const rawCollisionBox = Vector3wUnits.toRaw(collisionBox, 'meters');

      this.intersector_ = CreateBox(id, {
        depth: rawCollisionBox.z,
        height: rawCollisionBox.y,
        width: rawCollisionBox.x,
      }, scene);

      this.intersector_.parent = parent;
      this.intersector_.material = new StandardMaterial('touch-sensor-material', scene);
      this.intersector_.material.wireframe = true;
      this.intersector_.visibility = 0;

      ReferenceFramewUnits.syncBabylon(origin, this.intersector_, 'meters');
    }

    override getValue(): Promise<boolean> {
      const { scene, links } = this.parameters;

      const meshes = scene.getActiveMeshes();

      let hit = false;
      meshes.forEach(mesh => {
        if (hit || mesh === this.intersector_ || links.has(mesh as Mesh)) return;
        if (!mesh.physicsBody) return;
        hit = this.intersector_.intersectsMesh(mesh, true);
      });

      return Promise.resolve(hit);
    }

    override dispose(): void {
      this.intersector_.dispose();
    }
  }

  export class EtSensor extends SensorObject<Node.EtSensor, number> {
    private trace_: LinesMesh;

    private static readonly DEFAULT_MAX_DISTANCE = Distance.centimeters(100);
    private static readonly DEFAULT_NOISE_RADIUS = Distance.centimeters(160);
    private static readonly FORWARD: Vector3 = new Vector3(0, 0, 1);

    constructor(parameters: SensorParameters<Node.EtSensor>) {
      super(parameters);

      const { id, scene, definition, parent } = parameters;
      const { origin, maxDistance } = definition;

      // The trace will be parented to a link that is already scaled, so we don't need to apply
      // RENDER_SCALE again.

      const rawMaxDistance = Distance.toMetersValue(maxDistance ?? EtSensor.DEFAULT_MAX_DISTANCE);
      
      this.trace_ = CreateLines(id, {
        points: [
          Vector3.Zero(),
          EtSensor.FORWARD.multiplyByFloats(rawMaxDistance, rawMaxDistance, rawMaxDistance)
        ],
      }, scene);
      this.trace_.visibility = 0;

      ReferenceFramewUnits.syncBabylon(origin, this.trace_, 'meters');
      this.trace_.parent = parent;
    }

    override getValue(): Promise<number> {
      const { scene, definition, links, colliders } = this.parameters;
      const { maxDistance, noiseRadius } = definition;

      const rawMaxDistance = Distance.toValue(maxDistance || EtSensor.DEFAULT_MAX_DISTANCE, RENDER_SCALE);
      this.trace_.visibility = this.visible ? 1 : 0;

      const ray = new Ray(
        this.trace_.absolutePosition,
        EtSensor.FORWARD.applyRotationQuaternion(this.trace_.absoluteRotationQuaternion),
        rawMaxDistance
      );

      const hit = scene.pickWithRay(ray, mesh => {
        const metadata = mesh.metadata as SceneMeshMetadata;
        return (
          metadata &&
          mesh !== this.trace_ &&
          !links.has(mesh as Mesh) &&
          !colliders.has(mesh as Mesh) &&
          (!!mesh.physicsBody || metadata.selected)
        );
      });

      const distance = hit.pickedMesh ? hit.distance : Number.POSITIVE_INFINITY;

      let value: number;
      if (!this.realistic) {
        // ideal
        if (distance >= rawMaxDistance) value = 0;
        else value = 4095 - Math.floor((distance / rawMaxDistance) * 4095);
      } else {
        // realistic
        if (distance >= rawMaxDistance) value = 1100;
        // Farther than 80 cm
        else if (distance >= 80) value = 345;
        // Closer than 3 cm (linear from 2910 to 0)
        else if (distance <= 3) value = Math.floor(distance * (2910 / 3));
        // 3 - 11.2 cm
        else if (distance <= 11.2) value = 2910;
        // 11.2 - 80 cm (the useful range)
        // Derived by fitting the real-world data to a power model
        else value = Math.floor(3240.7 * Math.pow(distance - 10, -0.776));
      }

      if (this.noisy) {
        const noise = Distance.toValue(noiseRadius || EtSensor.DEFAULT_NOISE_RADIUS, RENDER_SCALE);
        const offset = Math.floor(noise * Math.random() * 2) - noise;
        value -= offset;
      }

      return Promise.resolve(clamp(0, value, 4095));
    }

    override dispose(): void {
      this.trace_.dispose();
    }
  }

  /**
   * A light sensor that detects the amount of light at a given point in space.
   * 
   * This assumes the sensor can receive light from all directions. A ray is cast
   * to every light in the scene. If it collides with a mesh, it is considered
   * blocked. Otherwise, the light is considered to be received.
   * 
   * The sensor value is the sum of the light intensities of all lights that are
   * not blocked, normalized to a calibrated value from measurements on a Wombat.
   */
  export class LightSensor extends SensorObject<Node.LightSensor, number> {
    private trace_: AbstractMesh;
    private rayTrace_: LinesMesh;

    // Calibrated value from real sensor with overhead light on
    private static AMBIENT_LIGHT_VALUE = 4095 - 3645;

    private static DEFAULT_NOISE_RADIUS = 10;

    private static lightValue_ = (distance: Distance) => {
      const cm = Distance.toCentimetersValue(distance);
      if (cm < 0) return 0;
      return 4095 - 19.4 + -0.678 * cm + 0.058 * cm * cm + -5.89e-04 * cm * cm * cm;
    };

    constructor(parameters: SensorParameters<Node.LightSensor>) {
      super(parameters);

      const { id, scene, definition, parent } = parameters;
      const { origin } = definition;
      

      this.trace_ = IcoSphereBuilder.CreateIcoSphere(`${id}-light-sensor-trace`, {
        radius: 0.01,
        subdivisions: 1,
      });

      this.trace_.material = new StandardMaterial(`${id}-light-sensor-trace-material`, scene);
      this.trace_.material.wireframe = true;


      ReferenceFramewUnits.syncBabylon(origin, this.trace_, 'meters');
      this.trace_.parent = parameters.parent;

      this.trace_.visibility = 0;
    }

    intersects(ray: Ray) {
      const { scene } = this.parameters;
      const meshes = scene.getActiveMeshes();

      let hit = false;
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes.data[i];
        if (mesh === this.trace_) continue;
        if (!mesh.physicsBody) continue;
        hit = ray.intersectsBox(mesh.getBoundingInfo().boundingBox);
        if (hit) break;
      }

      return hit;
    }

    override getValue(): Promise<number> {
      const { scene } = this.parameters;
      this.trace_.visibility = this.visible ? 1 : 0;

      const position = Vector3wUnits.fromRaw(RawVector3.fromBabylon(this.trace_.getAbsolutePosition()), RENDER_SCALE);

      let valueSum = 0;
      for (const light of scene.lights) {
        if (!light.isEnabled(false)) continue;
        if (light instanceof HemisphericLight) {
          valueSum += light.intensity * LightSensor.AMBIENT_LIGHT_VALUE;
          continue;
        }

        const intensity = light.getScaledIntensity();
        const lightPosition = Vector3wUnits.fromRaw(RawVector3.fromBabylon(light.getAbsolutePosition()), RENDER_SCALE);
        const offset = Vector3wUnits.subtract(position, lightPosition);
        const distance = Vector3wUnits.length(offset);
        const ray = new Ray(
          Vector3wUnits.toBabylon(position, RENDER_SCALE),
          Vector3wUnits.toBabylon(offset, RENDER_SCALE),
          Distance.toValue(distance, RENDER_SCALE)
        );

        if (this.intersects(ray)) continue;

        // If the light is directional, determine if it is pointing towards the
        // sensor. If not, it is not received.
        if (light instanceof DirectionalLight) {
          const direction = Vector3.Forward(true)
            .applyRotationQuaternion(Quaternion.FromEulerVector(light.getRotation()));
          
          const dot = Vector3.Dot(direction, Vector3wUnits.toBabylon(offset, RENDER_SCALE));
          const angle = Math.acos(dot / Distance.toValue(Vector3wUnits.length(offset), RENDER_SCALE));

          if (angle > Math.PI / 2) continue;
        }

        // Similar for spot light
        if (light instanceof SpotLight) {
          const direction = Vector3.Forward(true)
            .applyRotationQuaternion(Quaternion.FromEulerVector(light.getRotation()));
          
          const dot = Vector3.Dot(direction, Vector3wUnits.toBabylon(offset, RENDER_SCALE));
          const angle = Math.acos(dot / Distance.toValue(Vector3wUnits.length(offset), RENDER_SCALE));

          if (angle > light.angle / 2) continue;
        }

        valueSum += intensity * LightSensor.lightValue_(distance);
      }

      if (this.noisy) {
        const offset = Math.floor(LightSensor.DEFAULT_NOISE_RADIUS * Math.random() * 2) - LightSensor.DEFAULT_NOISE_RADIUS;
        valueSum -= offset;
      }

      return Promise.resolve(4095 - clamp(0, valueSum, 4095));
    }

    override dispose(): void {
      this.trace_.dispose();
    }
  }

  export class ReflectanceSensor extends SensorObject<Node.ReflectanceSensor, number> {
    private trace_: LinesMesh;

    private lastHitTextureId_: string | null = null;
    private lastHitPixels_: ArrayBufferView | null = null;

    private static readonly DEFAULT_MAX_DISTANCE = Distance.centimeters(1.5);
    private static readonly DEFAULT_NOISE_RADIUS = Distance.centimeters(10);
    private static readonly FORWARD: Vector3 = new Vector3(0, 0, 1);

    constructor(parameters: SensorParameters<Node.ReflectanceSensor>) {
      super(parameters);

      const { id, scene, definition, parent } = parameters;
      const { origin, maxDistance } = definition;

      // The trace will be parented to a link that is already scaled, so we don't need to apply
      // RENDER_SCALE again.

      const rawMaxDistance = Distance.toMetersValue(maxDistance ?? ReflectanceSensor.DEFAULT_MAX_DISTANCE);
      this.trace_ = CreateLines(id, {
        points: [
          Vector3.Zero(),
          ReflectanceSensor.FORWARD.multiplyByFloats(rawMaxDistance, rawMaxDistance, rawMaxDistance)
        ],
      }, scene);
      this.trace_.visibility = 0;

      ReferenceFramewUnits.syncBabylon(origin, this.trace_, 'meters');
      this.trace_.parent = parent;
    }

    override async getValue(): Promise<number> {
      const { scene, definition, links, colliders } = this.parameters;
      const { maxDistance, noiseRadius } = definition;

      const rawMaxDistance = Distance.toValue(maxDistance || ReflectanceSensor.DEFAULT_MAX_DISTANCE, RENDER_SCALE);
      this.trace_.visibility = this.visible ? 1 : 0;

      const ray = new Ray(
        this.trace_.absolutePosition,
        ReflectanceSensor.FORWARD.applyRotationQuaternion(this.trace_.absoluteRotationQuaternion),
        rawMaxDistance
      );

      const hit = scene.pickWithRay(ray, mesh => {
        return mesh !== this.trace_ && !links.has(mesh as Mesh) && !colliders.has(mesh as Mesh);
      });

      if (!hit.pickedMesh || !hit.pickedMesh.material || hit.pickedMesh.material.getActiveTextures().length === 0) return 0;
      
      let sensorValue = 0;
      
      const hitTexture = hit.pickedMesh.material.getActiveTextures()[0];

      // Only reprocess the texture if we hit a different texture than before
      if (this.lastHitTextureId_ === null || this.lastHitTextureId_ !== hitTexture.uid) {
        if (hitTexture.isReady()) {
          this.lastHitTextureId_ = hitTexture.uid;
          this.lastHitPixels_ = await hitTexture.readPixels();
        } else {
          // Texture isn't ready yet, so nothing we can do
          this.lastHitTextureId_ = null;
          this.lastHitPixels_ = null;
        }
      }

      if (this.lastHitPixels_ !== null) {
        const hitTextureCoordinates = hit.getTextureCoordinates();
        const arrayIndex = Math.floor(hitTextureCoordinates.x * (hitTexture.getSize().width - 1)) * 4 + Math.floor(hitTextureCoordinates.y * (hitTexture.getSize().height - 1)) * hitTexture.getSize().width * 4;

        const r = this.lastHitPixels_[arrayIndex] as number;
        const g = this.lastHitPixels_[arrayIndex + 1] as number;
        const b = this.lastHitPixels_[arrayIndex + 2] as number;

        // Crude conversion from RGB to grayscale
        const colorAverage = (r + g + b) / 3;

        // Value is a grayscale percentage of 4095
        sensorValue = Math.floor(4095 * (1 - (colorAverage / 255)));
      }

      if (this.noisy) {
        const noise = Distance.toValue(noiseRadius || ReflectanceSensor.DEFAULT_NOISE_RADIUS, RENDER_SCALE);
        const offset = Math.floor(noise * Math.random() * 2) - noise;
        sensorValue -= offset;
      }

      return clamp(0, sensorValue, 4095);
    }

    override dispose(): void {
      this.trace_.dispose();
    }
  }

  export const SERVO_LOGICAL_MIN_ANGLE = Angle.degrees(-90.0);
  export const SERVO_LOGICAL_MAX_ANGLE = Angle.degrees(90.0);

  export const SERVO_LOGICAL_MIN_ANGLE_RADS = Angle.toRadiansValue(SERVO_LOGICAL_MIN_ANGLE);
  export const SERVO_LOGICAL_MAX_ANGLE_RADS = Angle.toRadiansValue(SERVO_LOGICAL_MAX_ANGLE);

  export const SERVO_LOGICAL_RANGE_RADS = SERVO_LOGICAL_MAX_ANGLE_RADS - SERVO_LOGICAL_MIN_ANGLE_RADS;
}

export default RobotBinding;