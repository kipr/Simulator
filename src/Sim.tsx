import { Vector3 as BabylonVector3, Quaternion as BabylonQuaternion, Matrix as BabylonMatrix } from '@babylonjs/core/Maths/math.vector';
import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Mesh as BabylonMesh } from '@babylonjs/core/Meshes/mesh';
import { Engine as BabylonEngine } from '@babylonjs/core/Engines/engine';
import { EngineView as BabylonEngineView } from '@babylonjs/core/Engines/Extensions/engine.views';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { AmmoJSPlugin as BabylonAmmoJSPlugin } from '@babylonjs/core/Physics/Plugins/ammoJSPlugin';
import { MotorEnabledJoint as BabylonMotorEnabledJoint, PhysicsJoint as BabylonPhysicsJoint, PhysicsJointData as BabylonPhysicsJointData } from '@babylonjs/core/Physics/physicsJoint';
import { TransformNode as BabylonTransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PointerEventTypes as BabylonPointerEventTypes, PointerInfo as BabylonPointerInfo } from '@babylonjs/core/Events/pointerEvents';
import { EventState as BabylonEventState } from '@babylonjs/core/Misc/observable';
import { DracoCompression as BabylonDracoCompression } from '@babylonjs/core/Meshes/Compression/dracoCompression';
import { HemisphericLight as BabylonHemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Color3 as BabylonColor3 } from '@babylonjs/core/Maths/math.color';
import { PhysicsImpostor as BabylonPhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import { SceneLoader as BabylonSceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { ShadowLight as BabylonShadowLight } from '@babylonjs/core/Lights/shadowLight';
import { Node as BabylonNode } from '@babylonjs/core/node';

import '@babylonjs/loaders/glTF';

import {
  SensorObject,
  Sensor,
  instantiate as instantiateSensor,
  MAPPINGS as SENSOR_MAPPINGS,
} from './sensors';

import { RobotState } from './RobotState';

import Dict from './Dict';

import { Quaternion, ReferenceFrame, Vector2, Vector3 } from './math';
import { ReferenceFrame as UnitReferenceFrame, Rotation, Vector3 as UnitVector3 } from './unit-math';
import { RobotPosition } from './RobotPosition';
import { Angle, Distance, Mass } from './util';

import store, { State } from './state';
import { Unsubscribe } from 'redux';
import deepNeq from './deepNeq';
import { RobotStateAction, SceneAction } from './state/reducer';
import SceneBinding from './SceneBinding';
import Scene from './state/State/Scene';
import Node from './state/State/Scene/Node';
import Robotable from './Robotable';

export let ACTIVE_SPACE: Space;



export class Space implements Robotable {
  private static instance: Space;

  private initializationPromise: Promise<void>;

  private engine: BabylonEngine;
  private workingCanvas: HTMLCanvasElement;
  private scene: BabylonScene;

  private currentEngineView: BabylonEngineView;

  private ammo_: BabylonAmmoJSPlugin;

  private ground: BabylonMesh;
  private mat: BabylonMesh;

  private storeSubscription_: Unsubscribe;

  // List for keeping track of current item meshes in scene
  private itemMap_ = new Map<string, string>();


  private bodyCompoundRootMesh: BabylonAbstractMesh;
  private armCompoundRootMesh: BabylonAbstractMesh;
  private clawCompoundRootMesh: BabylonAbstractMesh;

  private colliderLeftWheelMesh: BabylonAbstractMesh;
  private colliderRightWheelMesh: BabylonAbstractMesh;

  private leftWheelJoint: BabylonMotorEnabledJoint;
  private rightWheelJoint: BabylonMotorEnabledJoint;
  private armJoint: BabylonMotorEnabledJoint;
  private clawJoint: BabylonMotorEnabledJoint;
  

  // Last recorded rotations of wheels and servos
  private leftWheelRotationPrev: BabylonQuaternion;
  private rightWheelRotationPrev: BabylonQuaternion;
  private armRotationDefault: BabylonQuaternion;
  private clawRotationDefault: BabylonQuaternion;

  // Fractional motor position accumulation
  private leftWheelPositionAccumulation_ = 0;
  private rightWheelPositionAccumulation_ = 0;

  private sensorObjects_: SensorObject[] = [];

  private canCoordinates: Array<[number, number]>;
  private sceneBinding_: SceneBinding;

  private collidersVisible = false;

  private readonly TICKS_BETWEEN_ET_SENSOR_UPDATES = 15;
  private readonly WHEEL_TICKS_PER_RADIAN = 2048 / (2 * Math.PI);

  // Servos on robot normally only have 175 degrees of range
  private readonly SERVO_DEFUALT_RADIANS = 87.5 * Math.PI / 180;
  private readonly SERVO_TICKS_PER_RADIAN = 2048 / (2 * this.SERVO_DEFUALT_RADIANS);

  private readonly ARM_DEFAULT_ROTATION = this.SERVO_DEFUALT_RADIANS;
  private readonly CLAW_DEFAULT_ROTATION = 175 * Math.PI / 180;
  
  private readonly MAX_MOTOR_VELOCITY = 1500;

  // The axes along which to calculate joint rotations
  // This is the y axis instead of the x axis because the wheels in the loaded model are rotated
  private static readonly wheelRotationVector: BabylonVector3 = new BabylonVector3(0, -1, 0);
  private static readonly armRotationVector: BabylonVector3 = new BabylonVector3(1, 0, 0);
  private static readonly clawRotationVector: BabylonVector3 = new BabylonVector3(0, 0, -1);

  private initStoreSubscription_ = () => {
    if (this.storeSubscription_) return;
    this.storeSubscription_ = store.subscribe(() => {
      this.onStoreChange_(store.getState());
    });
  };

  private debounceUpdate_ = false;

  private sceneSetting_: boolean;
  private latestUnfulfilledScene_: Scene;

  private onStoreChange_ = (state: State) => {
    if (this.debounceUpdate_) {
      this.sceneBinding_.scene = state.scene.workingScene;
      return;
    }

    if (!this.sceneSetting_) {
      this.sceneSetting_ = true;
      this.latestUnfulfilledScene_ = state.scene.workingScene;
      (async () => {
        // Disable physics during scene changes to avoid objects moving before the scene is fully loaded
        this.scene.physicsEnabled = false;
        await this.sceneBinding_.setScene(state.scene.workingScene);
        if (this.latestUnfulfilledScene_ !== state.scene.workingScene) {
          await this.sceneBinding_.setScene(this.latestUnfulfilledScene_);
        }
        this.scene.physicsEnabled = true;
      })().finally(() => {
        this.sceneSetting_ = false;
      });
        
    } else {
      this.latestUnfulfilledScene_ = state.scene.workingScene;
    }
  };

  setOrigin(origin: UnitReferenceFrame): void {

    const rootMeshes = [
      this.bodyCompoundRootMesh,
      this.colliderLeftWheelMesh,
      this.colliderRightWheelMesh,
      this.armCompoundRootMesh,
      this.clawCompoundRootMesh
    ];

    if (rootMeshes.reduce((acc, mesh) => acc || !mesh, false)) {
      setTimeout(() => this.setOrigin(origin), 100);
      return;
    }

    // Create a transform node, positioned and rotated to match the body root
    const resetTransformNode: BabylonTransformNode = new BabylonTransformNode("resetTransformNode", this.scene);
    resetTransformNode.setAbsolutePosition(this.bodyCompoundRootMesh.absolutePosition);
    resetTransformNode.rotationQuaternion = this.bodyCompoundRootMesh.absoluteRotationQuaternion;

    for (const rootMesh of rootMeshes) {
      // Stop the robot's motion in case it was falling or otherwise moving
      rootMesh.physicsImpostor.setLinearVelocity(BabylonVector3.Zero());
      rootMesh.physicsImpostor.setAngularVelocity(BabylonVector3.Zero());

      rootMesh.setParent(resetTransformNode);
    }

    // Set the position and rotation
    // Assuming that position is already in cm/radians. Eventually we'll need to convert depending on the incoming units
    resetTransformNode.setAbsolutePosition(Vector3.toBabylon(UnitVector3.toRaw(origin.position || UnitVector3.zero('centimeters'), 'centimeters')));
    
    const quat = Rotation.toRawQuaternion(origin.orientation || Rotation.Euler.identity());
    resetTransformNode.rotationQuaternion = Quaternion.toBabylon(quat);

    // Destroy the transform node
    for (const rootMesh of rootMeshes) {
      rootMesh.setParent(null);
    }
    resetTransformNode.dispose();
  }

  objectScreenPosition(id: string): Vector2 {
    const mesh = this.scene.getMeshByID(id) || this.scene.getMeshByName(id);
    if (!mesh) return undefined;

    if (this.engine.views.length <= 0) return undefined;

    const position = mesh.getBoundingInfo().boundingBox.centerWorld;

    const coordinates = BabylonVector3.Project(
      position,
      BabylonMatrix.Identity(),
      this.scene.getTransformMatrix(),
      this.sceneBinding_.camera.viewport.toGlobal(
        this.engine.getRenderWidth(),
        this.engine.getRenderHeight(),
      ));
    
    // Assuming the first view is the view of interest
    // If we ever use multiple views, this may break
    const { top, left } = this.engine.views[0].target.getBoundingClientRect();

    return {
      x: coordinates.x + left,
      y: coordinates.y + top
    };
  }

  public static getInstance(): Space {
    if (!Space.instance) {
      Space.instance = new Space();
    }

    return Space.instance;
  }

  // TODO: Find a better way to communicate robot state instead of these callbacks
  private constructor() {
    this.workingCanvas = document.createElement('canvas');

    this.engine = new BabylonEngine(this.workingCanvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new BabylonScene(this.engine);
    this.sceneBinding_ = new SceneBinding(this.scene, this);

    this.currentEngineView = null;

    ACTIVE_SPACE = this;

    // tell Babylon to load a local Draco decoder
    BabylonDracoCompression.Configuration = {
      decoder: {
        wasmUrl:        '/static/draco_wasm_wrapper_gltf.js',
        wasmBinaryUrl:  '/static/draco_decoder_gltf.wasm',
        fallbackUrl:    '/static/draco_decoder_gltf.js'
      }
    };
  }

  // Returns a promise that will resolve after the scene is fully initialized and the render loop is running
  public ensureInitialized(): Promise<void> {
    if (this.initializationPromise === undefined) {
      this.initializationPromise = new Promise((resolve, reject) => {
        this.createScene()
          .then(() => this.loadMeshes())
          .then(() => {
            this.startRenderLoop();
            resolve();
          })
          .catch((e) => {
            console.error('The simulator meshes failed to load', e);
            reject(e);
          });       
      });
    }

    return this.initializationPromise;
  }

  public switchContext(canvas: HTMLCanvasElement): void {
    this.sceneBinding_.canvas = canvas;
  }

  private onPointerTap_ = (eventData: BabylonPointerInfo, eventState: BabylonEventState) => {
    if (!eventData.pickInfo.hit) {
      store.dispatch(SceneAction.UNSELECT_ALL);
      return;
    }


    const mesh = eventData.pickInfo.pickedMesh;
    const id = mesh.metadata as string;
    const prevId = store.getState().scene.workingScene.selectedNodeId;
    if (id !== prevId && store.getState().scene.workingScene.nodes[id]?.editable) {
      store.dispatch(SceneAction.selectNode({ id }));
    } else {
      store.dispatch(SceneAction.UNSELECT_ALL);
    }
  };

  private async createScene(): Promise<void> {
    this.scene.onPointerObservable.add(this.onPointerTap_, BabylonPointerEventTypes.POINTERTAP);

    const light = new BabylonHemisphericLight("light1", new BabylonVector3(0, 1, 0), this.scene);
    light.intensity = 0.5;
    light.diffuse = new BabylonColor3(1.0, 1.0, 1.0);

    // At 100x scale, gravity should be -9.8 * 100, but this causes weird jitter behavior
    // Full gravity will be -9.8 * 10
    const gravityVector = new BabylonVector3(0, -9.8 * 50, 0);
    
    this.scene.enablePhysics(gravityVector, this.ammo_);
    this.scene.getPhysicsEngine().setSubTimeStep(5);

    await this.sceneBinding_.setScene(store.getState().scene.workingScene);

    // (x, z) coordinates of cans around the board
    this.canCoordinates = [[-22, -14.3], [0, -20.6], [15.5, -23.7], [0, -6.9], [-13.7, 6.8], [0, 6.8], [13.5, 6.8], [25.1, 14.8], [0, 34], [-18.8, 45.4], [0, 54.9], [18.7, 45.4]];

    // Logic that happens before every frame
    this.scene.registerBeforeRender(() => {
      let anyUpdated = false;
      
      const updated = new Array<boolean>(this.sensorObjects_.length);
      for (let i = 0; i < this.sensorObjects_.length; ++i) {
        const sensorObject = this.sensorObjects_[i];
        updated[i] = sensorObject.update();
        anyUpdated = anyUpdated || updated[i];
      }

      if (!anyUpdated) return;

      const robotState = store.getState().robotState;

      const nextRobotState: Partial<RobotState> = {
        analogValues: [...robotState.analogValues],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        digitalValues: [...robotState.digitalValues]
      };
    
      for (let i = 0; i < this.sensorObjects_.length; ++i) {
        if (!updated[i]) continue;
        const sensorObject = this.sensorObjects_[i];
        sensorObject.updateVisual();
        SensorObject.applyMut(sensorObject, nextRobotState);
      }

      store.dispatch(RobotStateAction.setRobotSensorValues({
        analogValues: nextRobotState.analogValues,
        digitalValues: nextRobotState.digitalValues,
      }));
    });

    this.scene.registerAfterRender(() => {
      const currRobotState = store.getState().robotState;

      // Set simulator motor speeds based on robot state
      this.setDriveMotors(currRobotState.motorSpeeds[3], currRobotState.motorSpeeds[0]);

      // Set simulator servo positions based on robot state
      this.setServoPositions(currRobotState.servoPositions);

      // Get current wheel rotations
      const leftWheelRotationCurr = BabylonQuaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderLeftWheelMesh.rotationQuaternion);
      const rightWheelRotationCurr = BabylonQuaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderRightWheelMesh.rotationQuaternion);

      let leftRotation = this.getDeltaRotationOnAxis(this.leftWheelRotationPrev, leftWheelRotationCurr, Space.wheelRotationVector);
      let rightRotation = this.getDeltaRotationOnAxis(this.rightWheelRotationPrev, rightWheelRotationCurr, Space.wheelRotationVector);

      // If rotation is in (pi, 2pi) range, convert to the equivalent negative rotation in (-pi, 0) range
      if (leftRotation > Math.PI) {
        leftRotation = leftRotation - 2 * Math.PI;
      }
      if (rightRotation > Math.PI) {
        rightRotation = rightRotation - 2 * Math.PI;
      }

      // Update motor positions based on wheel rotation
      this.leftWheelPositionAccumulation_ += leftRotation * this.WHEEL_TICKS_PER_RADIAN;
      this.rightWheelPositionAccumulation_ += rightRotation * this.WHEEL_TICKS_PER_RADIAN;

      const leftWheelDelta = Math.trunc(this.leftWheelPositionAccumulation_);
      const rightWheelDelta = Math.trunc(this.rightWheelPositionAccumulation_);
      if (leftWheelDelta !== 0 || rightWheelDelta !== 0) {
        this.leftWheelPositionAccumulation_ -= leftWheelDelta;
        this.rightWheelPositionAccumulation_ -= rightWheelDelta;
      
        store.dispatch(RobotStateAction.incrementRobotMotorPositions({
          motorPositions: [rightWheelDelta, 0, 0, leftWheelDelta],
        }));
      }

      this.leftWheelRotationPrev = leftWheelRotationCurr;
      this.rightWheelRotationPrev = rightWheelRotationCurr;
    });
  }

  private async loadMeshes(): Promise<void> {
    // Load model into scene
    const importMeshResult = await BabylonSceneLoader.ImportMeshAsync("",'static/', 'demobot_v6.glb', this.scene);
    // TEMP FIX: Scale everything up by 100 to avoid Ammo issues at small scale
    const rootMesh = importMeshResult.meshes.find(mesh => mesh.name === '__root__');
    rootMesh.scaling.scaleInPlace(100);

    // Also have to apply transformations to 'Root' node b/c when visual transform nodes are unparented, they lose their transformations
    // (seems to be fixed in Babylon 5 alpha versions)

    this.scene.getTransformNodeByName('Root').setAbsolutePosition(new BabylonVector3(0, 5.7, 0));
    this.scene.getTransformNodeByName('Root').scaling.scaleInPlace(100);
    
    // Hide collider meshes (unless enabled for debugging)
    importMeshResult.meshes.forEach(mesh => {
      if (mesh.name.startsWith('collider')) {
        mesh.visibility = 0.6;
        mesh.isVisible = this.collidersVisible;
        mesh.isPickable = false;
      }
    });

    // Create the root mesh for the body compound
    // We need this so that we can set a specific center of mass for the whole body
    // For now, use the wallaby collider location as the center of mass
    const wallabyColliderMesh = this.scene.getMeshByName('collider_wallaby');
    wallabyColliderMesh.computeWorldMatrix(true);
    this.bodyCompoundRootMesh = new BabylonMesh("bodyCompoundMesh", this.scene);
    this.bodyCompoundRootMesh.position = wallabyColliderMesh.getAbsolutePosition().clone();
    this.bodyCompoundRootMesh.rotationQuaternion = new BabylonQuaternion();
    this.bodyCompoundRootMesh.isPickable = false;

    type ColliderShape = 'box' | 'sphere';
    const bodyColliderMeshInfos: [string, ColliderShape][] = [
      ['collider_body', 'box'],
      ['collider_body_back_panel', 'box'],
      ['collider_body_front_panel', 'box'],
      ['collider_body_front_legos_1', 'box'],
      ['collider_body_front_legos_2', 'box'],
      ['collider_body_front_legos_3', 'box'],
      ['collider_body_lego', 'box'],
      ['collider_caster', 'sphere'],
      ['collider_touch_back_left', 'box'],
      ['collider_touch_back_right', 'box'],
      ['collider_touch_front', 'box'],
      ['collider_wallaby', 'box'],
      ['collider_battery', 'box'],
      ['collider_arm_servo', 'box'],
    ];

    const clawServoColliderMesh = this.scene.getMeshByName('collider_claw_servo');
    clawServoColliderMesh.computeWorldMatrix(true);
    this.armCompoundRootMesh = new BabylonMesh("armCompoundMesh", this.scene);
    this.armCompoundRootMesh.position = clawServoColliderMesh.getAbsolutePosition().clone();
    this.armCompoundRootMesh.rotationQuaternion = new BabylonQuaternion();
    this.armCompoundRootMesh.isPickable = false;

    const armColliderMeshInfos: [string][] = [
      ['collider_arm_claw_1'],
      ['collider_arm_claw_2'],
      ['collider_arm_claw_3'],
      ['collider_claw_servo'],
      ['collider_claw_servo_rod_1'],
      ['collider_claw_servo_rod_2'],
      ['collider_claw_et'],
      ['collider_arm_base'],
    ];

    const clawCenterMesh = this.scene.getMeshByName('collider_claw_3');
    clawCenterMesh.computeWorldMatrix(true);
    this.clawCompoundRootMesh = new BabylonMesh("clawCenterMesh", this.scene);
    this.clawCompoundRootMesh.position = clawCenterMesh.getAbsolutePosition().clone();
    this.clawCompoundRootMesh.rotationQuaternion = new BabylonQuaternion(0, 0, 0, 1);
    this.clawCompoundRootMesh.isPickable = false;

    const clawColliderMeshInfos: [string][] = [
      ['collider_claw_1'],
      ['collider_claw_2'],
      ['collider_claw_3'],
      ['collider_claw_3_metal'],
    ];

    // Parent body collider meshes to body root and add physics impostors
    for (const [bodyColliderMeshName, bodyColliderShape] of bodyColliderMeshInfos) {
      const colliderMesh: BabylonAbstractMesh = this.scene.getMeshByName(bodyColliderMeshName);
      if (!colliderMesh) {
        throw new Error(`failed to find collider mesh in model: ${bodyColliderMeshName}`);
      }
      
      // Unparent collider mesh before adding physics impostors to them
      colliderMesh.setParent(null);
      this.fixNegativeScaling(colliderMesh as BabylonMesh);
      
      const impostorType = bodyColliderShape === 'box'
        ? BabylonPhysicsImpostor.BoxImpostor
        : BabylonPhysicsImpostor.SphereImpostor;
      colliderMesh.physicsImpostor = new BabylonPhysicsImpostor(colliderMesh, impostorType, { mass: 0 }, this.scene);
      
      colliderMesh.setParent(this.bodyCompoundRootMesh);
    }

    for (const [armColliderMeshName] of armColliderMeshInfos) {
      const colliderMesh: BabylonAbstractMesh = this.scene.getMeshByName(armColliderMeshName);
      if (!colliderMesh) {
        throw new Error(`failed to find collider mesh in model: ${armColliderMeshName}`);
      }
      
      // Unparent collider mesh before adding physics impostors to them
      colliderMesh.setParent(null);
      this.fixNegativeScaling(colliderMesh as BabylonMesh);

      colliderMesh.physicsImpostor = new BabylonPhysicsImpostor(colliderMesh, BabylonPhysicsImpostor.BoxImpostor, { mass: 0 }, this.scene);
      
      colliderMesh.setParent(this.armCompoundRootMesh);
    }

    for (const [clawColliderMeshName] of clawColliderMeshInfos) {
      const colliderMesh: BabylonAbstractMesh = this.scene.getMeshByName(clawColliderMeshName);
      if (!colliderMesh) {
        throw new Error(`failed to find collider mesh in model: ${clawColliderMeshName}`);
      }
      
      // Unparent collider mesh before adding physics impostors to them
      colliderMesh.setParent(null);
      this.fixNegativeScaling(colliderMesh as BabylonMesh);

      colliderMesh.physicsImpostor = new BabylonPhysicsImpostor(colliderMesh, BabylonPhysicsImpostor.BoxImpostor, { mass: 0 }, this.scene);

      colliderMesh.setParent(this.clawCompoundRootMesh);
    }

    // Find wheel collider meshes in scene
    this.colliderLeftWheelMesh = this.scene.getMeshByName('collider_left_wheel');
    this.colliderRightWheelMesh = this.scene.getMeshByName('collider_right_wheel');

    // Unparent wheel collider meshes before adding physics impostors to them
    this.colliderLeftWheelMesh.setParent(null);
    this.colliderRightWheelMesh.setParent(null);
    this.fixNegativeScaling(this.colliderLeftWheelMesh as BabylonMesh);
    this.fixNegativeScaling(this.colliderRightWheelMesh as BabylonMesh);
    this.colliderLeftWheelMesh.isPickable = false;
    this.colliderRightWheelMesh.isPickable = false;

    // Find transform nodes (visual meshes) in scene and parent them to the proper node
    this.scene.getTransformNodeByName('ChassisWombat-1').setParent(this.bodyCompoundRootMesh);
    this.scene.getTransformNodeByName('KIPR_Lower_final_062119-1').setParent(this.bodyCompoundRootMesh);
    this.scene.getTransformNodeByName('1 x 5 Servo Horn-1').setParent(this.armCompoundRootMesh);
    this.scene.getTransformNodeByName('1 x 5 Servo Horn-2').setParent(this.clawCompoundRootMesh);
    this.scene.getTransformNodeByName('Servo Wheel-1').setParent(this.colliderRightWheelMesh);
    this.scene.getTransformNodeByName('Servo Wheel-2').setParent(this.colliderLeftWheelMesh);

    // Update "previous" wheel rotations to avoid sudden jump in motor position
    this.leftWheelRotationPrev = BabylonQuaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderLeftWheelMesh.rotationQuaternion);
    this.rightWheelRotationPrev = BabylonQuaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderRightWheelMesh.rotationQuaternion);
    this.armRotationDefault = BabylonQuaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.armCompoundRootMesh.rotationQuaternion);
    this.clawRotationDefault = BabylonQuaternion.Inverse(this.armCompoundRootMesh.rotationQuaternion).multiply(this.clawCompoundRootMesh.rotationQuaternion);

    // Set physics impostors for root nodes
    this.bodyCompoundRootMesh.physicsImpostor = new BabylonPhysicsImpostor(this.bodyCompoundRootMesh, BabylonPhysicsImpostor.NoImpostor, { mass: 1126, friction: 0.1 }, this.scene);
    this.colliderLeftWheelMesh.physicsImpostor = new BabylonPhysicsImpostor(this.colliderLeftWheelMesh, BabylonPhysicsImpostor.CylinderImpostor, { mass: 14, friction: 25 }, this.scene);
    this.colliderRightWheelMesh.physicsImpostor = new BabylonPhysicsImpostor(this.colliderRightWheelMesh, BabylonPhysicsImpostor.CylinderImpostor, { mass: 14, friction: 25 }, this.scene);
    this.armCompoundRootMesh.physicsImpostor = new BabylonPhysicsImpostor(this.armCompoundRootMesh, BabylonPhysicsImpostor.NoImpostor, { mass: 132, friction: 5 }, this.scene);
    this.clawCompoundRootMesh.physicsImpostor = new BabylonPhysicsImpostor(this.clawCompoundRootMesh, BabylonPhysicsImpostor.NoImpostor, { mass: 17, friction: 5 }, this.scene);

    const servoHornTransform = this.scene.getTransformNodeByID('1 x 5 Servo Horn-2');
    servoHornTransform.computeWorldMatrix();
    const zAxisQuaternion = new BabylonQuaternion(0, 0, -1, 0);
    const zAxisRotatedQuaternion = servoHornTransform.absoluteRotationQuaternion.multiply(zAxisQuaternion).multiply(BabylonQuaternion.Inverse(servoHornTransform.absoluteRotationQuaternion));
    const zAxisRotatedVector = new BabylonVector3(zAxisRotatedQuaternion.x, zAxisRotatedQuaternion.y, zAxisRotatedQuaternion.z);

    const servoWasher = this.scene.getTransformNodeByID('Servo Washer-1');
    servoWasher.computeWorldMatrix();
    const clawMainPivot = servoWasher.absolutePosition.clone().subtract(this.armCompoundRootMesh.absolutePosition.clone());
    const clawConnectedPivot = servoWasher.absolutePosition.clone().subtract(this.clawCompoundRootMesh.absolutePosition.clone());

    const clawJointData: BabylonPhysicsJointData = {
      mainPivot: clawMainPivot.clone(),
      // mainPivot: new BabylonVector3(0, 20, 40),
      connectedPivot: clawConnectedPivot.clone(),
      // connectedPivot: new BabylonVector3(0, -3, 0),
      mainAxis: zAxisRotatedVector.clone(),
      // connectedAxis: negativeZ,
      connectedAxis: zAxisRotatedVector.clone(),
    };
    this.clawJoint =  new BabylonMotorEnabledJoint(BabylonPhysicsJoint.HingeJoint, clawJointData);
    this.armCompoundRootMesh.physicsImpostor.addJoint(this.clawCompoundRootMesh.physicsImpostor, this.clawJoint);

    // eslint-disable-next-line newline-per-chained-call
    const armMainPivot = this.scene.getTransformNodeByID('Servo Washer-2').getAbsolutePosition().subtract(this.bodyCompoundRootMesh.position);
    // eslint-disable-next-line newline-per-chained-call
    const armConnectedPivot = this.scene.getTransformNodeByID('Servo Washer-2').getAbsolutePivotPoint().subtract(this.armCompoundRootMesh.position);
    this.armJoint =  new BabylonMotorEnabledJoint(BabylonPhysicsJoint.HingeJoint, {
      mainPivot: armMainPivot,
      connectedPivot: armConnectedPivot,
      mainAxis: new BabylonVector3(1, 0, 0),
      connectedAxis: new BabylonVector3(1, 0, 0),
    });
    this.bodyCompoundRootMesh.physicsImpostor.addJoint(this.armCompoundRootMesh.physicsImpostor, this.armJoint);

    // Create joint for right wheel
    const rightWheelMainPivot = this.colliderRightWheelMesh.position.subtract(this.bodyCompoundRootMesh.position);
    this.rightWheelJoint = new BabylonMotorEnabledJoint(BabylonPhysicsJoint.HingeJoint, {
      mainPivot: rightWheelMainPivot,
      connectedPivot: new BabylonVector3(0, 0, 0),
      mainAxis: new BabylonVector3(1, 0, 0),
      connectedAxis: new BabylonVector3(0, -1, 0),
    });
    this.bodyCompoundRootMesh.physicsImpostor.addJoint(this.colliderRightWheelMesh.physicsImpostor, this.rightWheelJoint);

    // Create joint for left wheel
    const leftWheelMainPivot = this.colliderLeftWheelMesh.position.subtract(this.bodyCompoundRootMesh.position);
    this.leftWheelJoint = new BabylonMotorEnabledJoint(BabylonPhysicsJoint.HingeJoint, {
      mainPivot: leftWheelMainPivot,
      connectedPivot: new BabylonVector3(0, 0, 0),
      mainAxis: new BabylonVector3(-1, 0, 0),
      connectedAxis: new BabylonVector3(0, 1, 0),
    });
    this.bodyCompoundRootMesh.physicsImpostor.addJoint(this.colliderLeftWheelMesh.physicsImpostor, this.leftWheelJoint);

    // Create sensors
    // `SENSOR_MAPPINGS` is a dictionary of mesh IDs/names to sensor descriptions
    // `instantiateSensor` takes this description and creates the appropriate sensor object
    const instantiate = ([id, sensor]: [string, Sensor]) => instantiateSensor(this.scene, id, sensor);
    this.sensorObjects_ = Dict.toList(SENSOR_MAPPINGS).map(instantiate);

    // Make all sensors visible for now. Eventually the user will be able to control this from the UI
    for (const sensorObject of this.sensorObjects_) sensorObject.isVisible = true;
    
    this.setRobotPosition({ x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(0), theta: Angle.degrees(0) });

    await this.scene.whenReadyAsync();
  }

  // Compare Babylon positions with state positions. If they differ significantly, update state
  private updateStore_ = () => {
    const { nodes, robot } = store.getState().scene.workingScene;
    
    const setNodeBatch: SceneAction.SetNodeBatchParams = {
      nodeIds: [],
      modifyReferenceScene: false,
    };

    // Check if nodes have moved significant amounts
    for (const nodeId of Dict.keySet(nodes)) {
      const node = nodes[nodeId];
      const bNode = this.scene.getNodeByID(nodeId) || this.scene.getNodeByName(node.name);

      // The node may still be loading
      if (!bNode) continue;

      const origin = node.origin ?? {};
      const nodeOriginChange = this.getSignificantOriginChange(origin, bNode);
      if (nodeOriginChange.position || nodeOriginChange.orientation || nodeOriginChange.scale) {
        setNodeBatch.nodeIds.push({
          id: nodeId,
          node: {
            ...node,
            origin: {
              ...node.origin,
              ...nodeOriginChange,
            }
          },
        });
      }
    }

    // Check if robot has moved a significant amount
    let setRobotOrigin: SceneAction.SetRobotOriginParams;
    const robotOrigin = robot?.origin ?? {};
    const robotOriginChange = this.getSignificantOriginChange(robotOrigin, this.bodyCompoundRootMesh);
    if (robotOriginChange.position || robotOriginChange.orientation || robotOriginChange.scale) {
      setRobotOrigin = {
        origin: {
          ...robotOrigin,
          ...robotOriginChange,
        },
        modifyReferenceScene: false,
      };
    }

    // Update state with significant changes, if needed
    this.debounceUpdate_ = true;
    if (setNodeBatch.nodeIds.length > 0) store.dispatch(SceneAction.setNodeBatch(setNodeBatch));
    if (setRobotOrigin) store.dispatch(SceneAction.setRobotOrigin(setRobotOrigin));
    this.debounceUpdate_ = false;
  };

  private getSignificantOriginChange(currentOrigin: UnitReferenceFrame, bNode: BabylonNode): UnitReferenceFrame {
    const change: UnitReferenceFrame = {};

    const position = currentOrigin?.position ?? UnitVector3.zero('meters');
    const rotation = currentOrigin?.orientation ?? Rotation.fromRawQuaternion(Quaternion.IDENTITY, 'euler');

    let bPosition: BabylonVector3;
    let bRotation: BabylonQuaternion;
    if (bNode instanceof BabylonTransformNode || bNode instanceof BabylonAbstractMesh) {
      bPosition = bNode.position;
      bRotation = bNode.rotationQuaternion;
    } else if (bNode instanceof BabylonShadowLight) {
      bPosition = bNode.position;
      bRotation = BabylonQuaternion.Identity();
    } else {
      throw new Error(`Unknown node type: ${bNode.constructor.name}`);
    }

    if (bPosition) {
      const bPositionConv = UnitVector3.fromRaw(Vector3.fromBabylon(bPosition), 'centimeters');
      
      // Distance between the two positions in meters
      const distance = UnitVector3.distance(position, bPositionConv);

      // If varies by more than 0.5cm, consider it a change
      if (distance.value > 0.005) {
        change.position = UnitVector3.toTypeGranular(bPositionConv, position.x.type, position.y.type, position.z.type);
      }
    }

    if (bRotation) {
      const bOrientationConv = Rotation.fromRawQuaternion(Quaternion.fromBabylon(bRotation), 'euler');

      // Angle between the two rotations in radians
      const angle = Rotation.angle(rotation, bOrientationConv);
      const radians = Angle.toRadians(angle);
      
      // If varies by more than 0.5deg, consider it a change
      if (radians.value > 0.00872665) {
        change.orientation = Rotation.toType(bOrientationConv, rotation.type);
      }
    }

    return change;
  }
  
  private startRenderLoop(): void {
    this.initStoreSubscription_();
    this.engine.runRenderLoop(() => {
      // Post updates to the store
      this.updateStore_();

      this.scene.render();
    });

  }

  // Resets the position/rotation of the robot to the given values (cm and radians)
  public setRobotPosition(position: RobotPosition): void {
    const rootMeshes = [
      this.bodyCompoundRootMesh,
      this.colliderLeftWheelMesh,
      this.colliderRightWheelMesh,
      this.armCompoundRootMesh,
      this.clawCompoundRootMesh
    ];

    // Create a transform node, positioned and rotated to match the body root
    const resetTransformNode: BabylonTransformNode = new BabylonTransformNode("resetTransformNode", this.scene);
    resetTransformNode.setAbsolutePosition(this.bodyCompoundRootMesh.absolutePosition);
    resetTransformNode.rotationQuaternion = this.bodyCompoundRootMesh.absoluteRotationQuaternion;

    for (const rootMesh of rootMeshes) {
      // Stop the robot's motion in case it was falling or otherwise moving
      rootMesh.physicsImpostor.setLinearVelocity(BabylonVector3.Zero());
      rootMesh.physicsImpostor.setAngularVelocity(BabylonVector3.Zero());

      rootMesh.setParent(resetTransformNode);
    }

    // Set the position and rotation
    // Assuming that position is already in cm/radians. Eventually we'll need to convert depending on the incoming units
    const { x, y, z, theta } = position;
    resetTransformNode.setAbsolutePosition(new BabylonVector3(Distance.toCentimetersValue(x), Distance.toCentimetersValue(y), Distance.toCentimetersValue(z)));
    resetTransformNode.rotationQuaternion = BabylonQuaternion.RotationAxis(BabylonVector3.Up(), Angle.toRadiansValue(theta));

    // Destroy the transform node
    for (const rootMesh of rootMeshes) {
      rootMesh.setParent(null);
    }
    resetTransformNode.dispose();
  }

  public handleResize(): void {
    this.engine.resize();
  }
  
  public updateSensorOptions(isNoiseEnabled: boolean, isRealisticEnabled: boolean): void {
    for (const sensorObject of this.sensorObjects_) {
      sensorObject.isNoiseEnabled = isNoiseEnabled;
      sensorObject.isRealisticEnabled = isRealisticEnabled;
    }
  }

  private setDriveMotors(leftSpeed: number, rightSpeed: number) {
    // One motor is negative because the wheel joints are created on opposite axes,
    // so one needs to turn "backwards" for them to turn in the same direction
    if (this.leftWheelJoint && this.rightWheelJoint) {
      const leftSpeedClamped = Math.max(-this.MAX_MOTOR_VELOCITY, Math.min(leftSpeed, this.MAX_MOTOR_VELOCITY));
      const rightSpeedClamped = Math.max(-this.MAX_MOTOR_VELOCITY, Math.min(rightSpeed, this.MAX_MOTOR_VELOCITY));
      this.leftWheelJoint.setMotor(leftSpeedClamped / 315);
      this.rightWheelJoint.setMotor(-rightSpeedClamped / 315);
    }
    if (leftSpeed === 0) {
      this.colliderLeftWheelMesh.physicsImpostor.setAngularVelocity(BabylonVector3.Zero());
    }
    if (rightSpeed === 0) {
      this.colliderRightWheelMesh.physicsImpostor.setAngularVelocity(BabylonVector3.Zero());
    }
  }

  // Gets the delta rotation (in radians) between start and end along the given axis
  private getDeltaRotationOnAxis = (start: BabylonQuaternion, end: BabylonQuaternion, axis: BabylonVector3) => {
    // Get axis vector local to starting point, by rotating axis vector by the start quaternion
    const axisQuaternion = new BabylonQuaternion(axis.x, axis.y, axis.z, 0);
    const axisLocalQuaternion = start.multiply(axisQuaternion).multiply(BabylonQuaternion.Inverse(start));
    const axisLocalVector = new BabylonVector3(axisLocalQuaternion.x, axisLocalQuaternion.y, axisLocalQuaternion.z);

    // Get delta quaternion between start and end quaternions, such that end = start * delta
    const delta = end.multiply(BabylonQuaternion.Inverse(start));

    // Perform swing-twist decomposition of delta to get twist on local axis vector
    const twist = this.getTwistForQuaternion(delta, axisLocalVector);

    // Quaternion is defined with [w = cos(theta / 2)], so [theta = 2 * acos(w)]
    return 2 * Math.acos(twist.w);
  };

  // Does a "swing-twist" decomposition of the given quaternion q
  // "direction" vector must be normalized
  private getTwistForQuaternion = (q: BabylonQuaternion, direction: BabylonVector3) => {
    const rotationAxis = new BabylonVector3(q.x, q.y, q.z);

    // Calculate vector projection of vector onto direction
    // Shortcut projection calculation since "direction" is assumed to be normalized (i.e. magnitude of 1)
    const dotProd: number = BabylonVector3.Dot(direction, rotationAxis);
    const projection = direction.scale(dotProd);

    const twist = new BabylonQuaternion(projection.x, projection.y, projection.z, q.w).normalize();

    // If the result is in the opposite-facing axis, convert it to the correct-facing axis
    if (dotProd < 0) {
      twist.scaleInPlace(-1);
    }

    return twist;
  };

  private setServoPositions(goals: number[]) {
    // Get all necessary meshes
    const bodyCurrQuat = this.bodyCompoundRootMesh.rotationQuaternion.clone();
    const armCurrQuat = this.armCompoundRootMesh.rotationQuaternion.clone();
    const clawCurrQuat = this.clawCompoundRootMesh.rotationQuaternion.clone();

    // Get updated real mesh rotation for arm
    const armCurr = BabylonQuaternion.Inverse(bodyCurrQuat).multiply(armCurrQuat);
    let armRotation = this.getDeltaRotationOnAxis(this.armRotationDefault, armCurr, Space.armRotationVector);
    if (armRotation >= Math.PI) {
      armRotation = armRotation - 2 * Math.PI;
    }

    // Get difference between goal and current rotation
    const armDelta = armRotation + this.ARM_DEFAULT_ROTATION - goals[0] / this.SERVO_TICKS_PER_RADIAN;
    const armSign = armDelta >= 0 ? 1 : -1;
    const armDeltaNorm = Math.abs(armDelta / (this.SERVO_DEFUALT_RADIANS * 2));

    // Set motor for arm based on how close to goal mesh is
    if (armDeltaNorm < 0.01) {
      this.armJoint.setMotor(0);
    } else if (armDeltaNorm >= 0.001 && armDeltaNorm <= 0.04) {
      this.armJoint.setMotor(armSign * 1.2, 8000);
    } else {
      this.armJoint.setMotor(armSign * 6, 8000);
    }

    // Get updated real mesh rotation for claw
    const clawCurr = BabylonQuaternion.Inverse(armCurrQuat).multiply(clawCurrQuat);
    let clawRotation = this.getDeltaRotationOnAxis(this.clawRotationDefault, clawCurr, Space.clawRotationVector);
    if (clawRotation >= Math.PI) {
      clawRotation = clawRotation - 2 * Math.PI;
    }

    // Get difference between goal and current rotation
    const clawDelta = clawRotation - this.CLAW_DEFAULT_ROTATION + goals[3] / this.SERVO_TICKS_PER_RADIAN;
    const clawSign = clawDelta >= 0 ? -1 : 1;
    const clawDeltaNorm = Math.abs(clawDelta / (this.SERVO_DEFUALT_RADIANS * 2));
    
    // Set motor for claw based on how close to goal mesh is
    if (clawDeltaNorm < 0.01) {
      this.clawJoint.setMotor(0);
    } else if (clawDeltaNorm >= 0.001 && clawDeltaNorm <= 0.04) {
      this.clawJoint.setMotor(clawSign * 1.2, 2000);
    } else {
      this.clawJoint.setMotor(clawSign * 6, 2000);
    }
  }

  // Takes a mesh with negative scaling values and "bakes" the negative scaling into the mesh itself,
  // resulting in effectively the same mesh but with all positive scale values.
  // This is used specifically on collider meshes imported from the GLTF model, to work around an issue
  // with physics impostors and negative scaling.
  // See GitHub issue: https://github.com/BabylonJS/Babylon.js/issues/10283
  private fixNegativeScaling(mesh: BabylonMesh) {
    const initialScaling = mesh.scaling.clone();
    const scaleMatrix = BabylonMatrix.Scaling(Math.sign(initialScaling.x), Math.sign(initialScaling.y), Math.sign(initialScaling.z));
    mesh.bakeTransformIntoVertices(scaleMatrix);
    initialScaling.set(Math.abs(initialScaling.x), Math.abs(initialScaling.y), Math.abs(initialScaling.z));
    mesh.scaling = initialScaling;
  }
}
