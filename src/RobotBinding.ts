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

  private digitalSensors_: Dict<RobotBinding.Sensor<boolean>> = {};
  private digitalPorts_ = new Array<string>(6);

  private analogSensors_: Dict<RobotBinding.Sensor<number>> = {};
  private analogPorts_ = new Array<string>(6);

  private colliders_: Set<Babylon.Mesh> = new Set();

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

  private createTouchSensor_ = this.createSensor_(RobotBinding.TouchSensor);
  private createEtSensor_ = this.createSensor_(RobotBinding.EtSensor);
  private createReflectanceSensor_ = this.createSensor_(RobotBinding.ReflectanceSensor);

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

  private accumulatedMotorPositions_: [number, number, number, number] = [0, 0, 0, 0];
  private lastMotorAngles_: [number, number, number, number] = [0, 0, 0, 0];

  // Getting sensor values is async. We store the pending promises in these dictionaries.
  private outstandingDigitalGetValues_: Dict<RobotBinding.OutstandingPromise<boolean>> = {};
  private outstandingAnalogGetValues_: Dict<RobotBinding.OutstandingPromise<number>> = {};

  private latestDigitalValues_: RobotState.DigitalValues = [false, false, false, false, false, false];
  private latestAnalogValues_: RobotState.AnalogValues = [0, 0, 0, 0, 0, 0];

  tick(input: RobotBinding.TickIn): RobotBinding.TickOut {
    this.damp_ = this.damp_ * 0.75 + 0.25;

    const motorPositionDeltas: [number, number, number, number] = [0, 0, 0, 0];
    

    // Motors
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

      motorPositionDeltas[i] = ((motor.plug && motor.plug === Node.Motor.Plug.Inverted) ? -1 : 1) * Math.round(deltaAngle / (2 * Math.PI) * ticksPerRevolution);

      bMotor.setMotor(velocity);
    }

    // Servos
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

    // Digital Sensors
    const digitalValues: RobotState.DigitalValues = [false, false, false, false, false, false];
    for (let i = 0; i < 6; ++i) {
      const digitalId = this.digitalPorts_[i];
      if (!digitalId) continue;

      const digital = this.digitalSensors_[digitalId];
      if (!digital) throw new Error(`Missing digital sensor: ${digitalId}`);

      const outstanding = this.outstandingDigitalGetValues_[digitalId];
      if (!outstanding) {
        this.outstandingDigitalGetValues_[digitalId] = RobotBinding.OutstandingPromise.create(digital.getValue());
      } else {
        // console.log(digitalId, 'done', outstanding.done);

        if (RobotBinding.OutstandingPromise.isDone(outstanding)) {
          this.latestDigitalValues_[i] = RobotBinding.OutstandingPromise.value(outstanding);
          this.outstandingDigitalGetValues_[digitalId] = RobotBinding.OutstandingPromise.create(digital.getValue());
        }
      }

      digitalValues[i] = this.latestDigitalValues_[i];
    }

    const analogValues: RobotState.AnalogValues = [0, 0, 0, 0, 0, 0];
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
    }

    return {
      origin: this.origin,
      motorPositionDeltas,
      digitalValues,
      analogValues,
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
    if (rootIds.length !== 1) throw new Error('Only one root node is supported');
    
    this.rootId_ = rootIds[0];

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
  export interface TickIn {
    /**
     * Velocities in ticks/second
     */
    motorControls: [
      RobotState.MotorControl,
      RobotState.MotorControl,
      RobotState.MotorControl,
      RobotState.MotorControl
    ];

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
     * Delta of motor positions in ticks since last `tick`
     */
    motorPositionDeltas: [number, number, number, number];
  
    /**
     * Updated digital values
     */
    digitalValues: RobotState.DigitalValues;

    /**
     * Updated analog values
     */
    analogValues: RobotState.AnalogValues;
  }

  export namespace TickOut {
    export const NIL: TickOut = {
      origin: ReferenceFrame.IDENTITY,
      motorPositionDeltas: [0, 0, 0, 0],
      digitalValues: [false, false, false, false, false, false],
      analogValues: [0, 0, 0, 0, 0, 0],
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
  }

  export interface SensorParameters<T> {
    id: string;
    definition: T;
    parent: Babylon.Mesh;
    scene: Babylon.Scene;
    links: Set<Babylon.Mesh>;
    colliders: Set<Babylon.IPhysicsEnabledObject>;
  }

  export abstract class SensorObject<T, O> implements Sensor<O> {
    private parameters_: SensorParameters<T>;
    get parameters() { return this.parameters_; }

    private realistic_ = false;
    get realistic() { return this.realistic_; }
    set realistic(realistic: boolean) { this.realistic_ = realistic; }

    private noisy_ = false;
    get noisy() { return this.noisy_; }
    set noisy(noisy: boolean) { this.noisy_ = noisy; console.log('set noisy', noisy); }

    constructor(parameters: SensorParameters<T>) {
      this.parameters_ = parameters;
    }

    abstract getValue(): Promise<O>;

    abstract dispose(): void;
  }

  export class TouchSensor extends SensorObject<Node.TouchSensor, boolean> {
    private intersector_: Babylon.Mesh;
    
    constructor(parameters: SensorParameters<Node.TouchSensor>) {
      super(parameters);

      const { id, definition, parent, scene } = parameters;
      const { collisionBox, origin } = definition;

      // The parent already has RENDER_SCALE applied, so we don't need to apply it again.
      const rawCollisionBox = Vector3.toRaw(collisionBox, 'meters');

      this.intersector_ = Babylon.MeshBuilder.CreateBox(id, {
        depth: rawCollisionBox.z,
        height: rawCollisionBox.y,
        width: rawCollisionBox.x,
      }, scene);

      this.intersector_.parent = parent;
      this.intersector_.material = new Babylon.StandardMaterial('touch-sensor-material', scene);
      this.intersector_.material.wireframe = true;

      ReferenceFrame.syncBabylon(origin, this.intersector_, 'meters');
    }

    override getValue(): Promise<boolean> {
      const { scene, links } = this.parameters;

      const meshes = scene.getActiveMeshes();

      let hit = false;
      meshes.forEach(mesh => {
        if (hit || mesh === this.intersector_ || links.has(mesh as Babylon.Mesh)) return;
        if (!mesh.physicsImpostor) return;
        hit = this.intersector_.intersectsMesh(mesh, true);
      });

      return Promise.resolve(hit);
    }

    override dispose(): void {
      this.intersector_.dispose();
    }
  }

  export class EtSensor extends SensorObject<Node.EtSensor, number> {
    private trace_: Babylon.LinesMesh;

    private static readonly DEFAULT_MAX_DISTANCE = Distance.centimeters(100);
    private static readonly DEFAULT_NOISE_RADIUS = Distance.centimeters(160);
    private static readonly FORWARD: Babylon.Vector3 = new Babylon.Vector3(0, 0, 1);

    constructor(parameters: SensorParameters<Node.EtSensor>) {
      super(parameters);

      const { id, scene, definition, parent } = parameters;
      const { origin, maxDistance } = definition;

      // The trace will be parented to a link that is already scaled, so we don't need to apply
      // RENDER_SCALE again.

      const rawMaxDistance = Distance.toMetersValue(maxDistance ?? EtSensor.DEFAULT_MAX_DISTANCE);
      
      this.trace_ = Babylon.MeshBuilder.CreateLines(id, {
        points: [
          Babylon.Vector3.Zero(),
          EtSensor.FORWARD.multiplyByFloats(rawMaxDistance, rawMaxDistance, rawMaxDistance)
        ],
      }, scene);

      ReferenceFrame.syncBabylon(origin, this.trace_, 'meters');
      this.trace_.parent = parent;
    }

    override getValue(): Promise<number> {
      const { scene, definition, links, colliders } = this.parameters;
      const { maxDistance, noiseRadius } = definition;

      const rawMaxDistance = Distance.toValue(maxDistance || EtSensor.DEFAULT_MAX_DISTANCE, RENDER_SCALE);


      const ray = new Babylon.Ray(
        this.trace_.absolutePosition,
        EtSensor.FORWARD.applyRotationQuaternion(this.trace_.absoluteRotationQuaternion),
        rawMaxDistance
      );

      const hit = scene.pickWithRay(ray, mesh => {
        return mesh !== this.trace_ && !links.has(mesh as Babylon.Mesh) && !colliders.has(mesh as Babylon.Mesh);
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

  export class ReflectanceSensor extends SensorObject<Node.ReflectanceSensor, number> {
    private trace_: Babylon.LinesMesh;

    private lastHitTextureId_: string | null = null;
    private lastHitPixels_: ArrayBufferView | null = null;

    private static readonly DEFAULT_MAX_DISTANCE = Distance.centimeters(1.5);
    private static readonly DEFAULT_NOISE_RADIUS = Distance.centimeters(10);
    private static readonly FORWARD: Babylon.Vector3 = new Babylon.Vector3(0, 0, 1);

    constructor(parameters: SensorParameters<Node.ReflectanceSensor>) {
      super(parameters);

      const { id, scene, definition, parent } = parameters;
      const { origin, maxDistance } = definition;

      // The trace will be parented to a link that is already scaled, so we don't need to apply
      // RENDER_SCALE again.

      const rawMaxDistance = Distance.toMetersValue(maxDistance ?? ReflectanceSensor.DEFAULT_MAX_DISTANCE);
      this.trace_ = Babylon.MeshBuilder.CreateLines(id, {
        points: [
          Babylon.Vector3.Zero(),
          ReflectanceSensor.FORWARD.multiplyByFloats(rawMaxDistance, rawMaxDistance, rawMaxDistance)
        ],
      }, scene);

      ReferenceFrame.syncBabylon(origin, this.trace_, 'meters');
      this.trace_.parent = parent;
    }

    override async getValue(): Promise<number> {
      const { scene, definition, links, colliders } = this.parameters;
      const { maxDistance, noiseRadius } = definition;

      const rawMaxDistance = Distance.toValue(maxDistance || ReflectanceSensor.DEFAULT_MAX_DISTANCE, RENDER_SCALE);


      const ray = new Babylon.Ray(
        this.trace_.absolutePosition,
        ReflectanceSensor.FORWARD.applyRotationQuaternion(this.trace_.absoluteRotationQuaternion),
        rawMaxDistance
      );

      const hit = scene.pickWithRay(ray, mesh => {
        return mesh !== this.trace_ && !links.has(mesh as Babylon.Mesh) && !colliders.has(mesh as Babylon.Mesh);
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