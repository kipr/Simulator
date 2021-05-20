import * as Babylon from 'babylonjs';
import 'babylonjs-loaders';
// import Oimo = require('babylonjs/Oimo');
import * as Ammo from './ammo';
import {
  SensorObject,
  Sensor,
  instantiate as instantiateSensor,
  MAPPINGS as SENSOR_MAPPINGS
} from './sensors';
import { RobotState } from './RobotState';
import Dict from './Dict';

export class Space {
  private engine: Babylon.Engine;
  private canvas: HTMLCanvasElement;
  private scene: Babylon.Scene;

  private ammo_: Babylon.AmmoJSPlugin;

  private ground: Babylon.Mesh;
  private mat: Babylon.Mesh;

  // The position offset of the robot, applied to the user-specified position
  private robotOffset: Babylon.Vector3 = new Babylon.Vector3(0, 7, -52);

  private bodyCompoundRootMesh: Babylon.AbstractMesh;
  private armCompoundRootMesh: Babylon.AbstractMesh;
  private clawCompoundRootMesh: Babylon.AbstractMesh;

  private colliderLeftWheelMesh: Babylon.AbstractMesh;
  private colliderRightWheelMesh: Babylon.AbstractMesh;

  private leftWheelJoint: Babylon.MotorEnabledJoint;
  private rightWheelJoint: Babylon.MotorEnabledJoint;
  private armJoint: Babylon.MotorEnabledJoint;
  private clawJoint: Babylon.MotorEnabledJoint;
  

  // Last recorded rotations of wheels and servos
  private leftWheelRotationPrev: Babylon.Quaternion;
  private rightWheelRotationPrev: Babylon.Quaternion;
  private armRotationDefault: Babylon.Quaternion;
  private clawRotationDefault: Babylon.Quaternion;

  private sensorObjects_: SensorObject[];

  private canCoordinates: Array<[number, number]>;

  private collidersVisible = false;

  private readonly DEFAULT_TIMESTEP = 1 / 60;
  private readonly TIMESTEP_FACTOR = 4;

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
  private static readonly wheelRotationVector: Babylon.Vector3 = new Babylon.Vector3(0, -1, 0);
  private static readonly armRotationVector: Babylon.Vector3 = new Babylon.Vector3(1, 0, 0);
  private static readonly clawRotationVector: Babylon.Vector3 = new Babylon.Vector3(0, 0, -1);

  private getRobotState: () => RobotState;
  private updateRobotState: (robotState: Partial<RobotState>) => void;

  // TODO: Find a better way to communicate robot state instead of these callbacks
  constructor(canvas: HTMLCanvasElement, getRobotState: () => RobotState, updateRobotState: (robotState: Partial<RobotState>) => void) {
    this.canvas = canvas;
    this.engine = new Babylon.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Babylon.Scene(this.engine);

    this.getRobotState = getRobotState;
    this.updateRobotState = updateRobotState;
  }

  public createScene(): void {
    const camera = new Babylon.ArcRotateCamera("botcam",10,10,10, new Babylon.Vector3(50,50,50), this.scene);
    camera.setTarget(Babylon.Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new Babylon.HemisphericLight("botlight", new Babylon.Vector3(0,1,0), this.scene);
    light.intensity = 0.75;

    // At 100x scale, gravity should be -9.8 * 100, but this causes weird jitter behavior
    // Full gravity will be -9.8 * 10
    const gravityVector = new Babylon.Vector3(0, -9.8 * 50, 0);
    this.ammo_ = new Babylon.AmmoJSPlugin(true, Ammo);
    this.ammo_.setFixedTimeStep(this.DEFAULT_TIMESTEP / this.TIMESTEP_FACTOR);
    this.scene.enablePhysics(gravityVector, this.ammo_);

    this.buildFloor();

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

      const robotState = this.getRobotState();

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

      this.updateRobotState(nextRobotState);
    });

    this.scene.registerAfterRender(() => {
      const currRobotState = this.getRobotState();

      // Set simulator motor speeds based on robot state
      this.setDriveMotors(currRobotState.motorSpeeds[0], currRobotState.motorSpeeds[3]);

      // Set simulator servo positions based on robot state
      this.setServoPositions(currRobotState.servoPositions);

      // Get current wheel rotations
      const leftWheelRotationCurr = Babylon.Quaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderLeftWheelMesh.rotationQuaternion);
      const rightWheelRotationCurr = Babylon.Quaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderRightWheelMesh.rotationQuaternion);

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
      const m0Position = currRobotState.motorPositions[0] + leftRotation * this.WHEEL_TICKS_PER_RADIAN;
      const m3Position = currRobotState.motorPositions[3] + rightRotation * this.WHEEL_TICKS_PER_RADIAN;
      this.updateRobotState({
        motorPositions: [m0Position, 0, 0, m3Position],
      });

      this.leftWheelRotationPrev = leftWheelRotationCurr;
      this.rightWheelRotationPrev = rightWheelRotationCurr;
    });
  }
  

  public async loadMeshes(): Promise<void> {
    // Load model into scene
    const importMeshResult = await Babylon.SceneLoader.ImportMeshAsync("",'static/', 'Simulator_Demobot_colliders.glb', this.scene);

    // TEMP FIX: Scale everything up by 100 to avoid Ammo issues at small scale
    const rootMesh = importMeshResult.meshes.find(mesh => mesh.name === '__root__');
    rootMesh.scaling.scaleInPlace(100);

    // Also have to apply transformations to 'Root' node b/c when visual transform nodes are unparented, they lose their transformations
    // (seems to be fixed in Babylon 5 alpha versions)

    this.scene.getTransformNodeByName('Root').setAbsolutePosition(new Babylon.Vector3(0, 5.7, 0));
    this.scene.getTransformNodeByName('Root').scaling.scaleInPlace(100);
    
    // Hide collider meshes (unless enabled for debugging)
    importMeshResult.meshes.forEach(mesh => {
      if (mesh.name.startsWith('collider')) {
        mesh.visibility = 0.6;
        mesh.isVisible = this.collidersVisible;
      }
    });

    // Create the root mesh for the body compound
    // We need this so that we can set a specific center of mass for the whole body
    // For now, use the wallaby collider location as the center of mass
    const wallabyColliderMesh = this.scene.getMeshByName('collider_wallaby');
    wallabyColliderMesh.computeWorldMatrix(true);
    this.bodyCompoundRootMesh = new Babylon.Mesh("bodyCompoundMesh", this.scene);
    this.bodyCompoundRootMesh.position = wallabyColliderMesh.getAbsolutePosition().clone();
    this.bodyCompoundRootMesh.rotationQuaternion = new Babylon.Quaternion();

    type ColliderShape = 'box' | 'sphere';
    const bodyColliderMeshInfos: [string, ColliderShape][] = [
      ['collider_body', 'box'],
      ['collider_body_back_panel', 'box'],
      ['collider_body_front_panel', 'box'],
      ['collider_body_front_legos', 'box'],
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
    this.armCompoundRootMesh = new Babylon.Mesh("armCompoundMesh", this.scene);
    this.armCompoundRootMesh.position = clawServoColliderMesh.getAbsolutePosition().clone();
    this.armCompoundRootMesh.rotationQuaternion = new Babylon.Quaternion();

    const armColliderMeshInfos: [string][] = [
      ['collider_arm_claw_1'],
      ['collider_arm_claw_2'],
      ['collider_arm_claw_3'],
      ['collider_claw_servo'],
    ];

    const clawCenterMesh = this.scene.getMeshByName('collider_claw_3');
    clawCenterMesh.computeWorldMatrix(true);
    this.clawCompoundRootMesh = new Babylon.Mesh("clawCenterMesh", this.scene);
    this.clawCompoundRootMesh.position = clawCenterMesh.getAbsolutePosition().clone();
    this.clawCompoundRootMesh.rotationQuaternion = new Babylon.Quaternion(0, 0, 0, 1);

    const clawColliderMeshInfos: [string][] = [
      ['collider_claw_1'],
      ['collider_claw_2'],
      ['collider_claw_3'],
    ];

    // Parent body collider meshes to body root and add physics impostors
    for (const [bodyColliderMeshName, bodyColliderShape] of bodyColliderMeshInfos) {
      const colliderMesh: Babylon.AbstractMesh = this.scene.getMeshByName(bodyColliderMeshName);
      if (!colliderMesh) {
        throw new Error(`failed to find collider mesh in model: ${bodyColliderMeshName}`);
      }
      
      // Unparent collider mesh before adding physics impostors to them
      colliderMesh.setParent(null);
      this.fixNegativeScaling(colliderMesh as Babylon.Mesh);
      
      const impostorType = bodyColliderShape === 'box'
        ? Babylon.PhysicsImpostor.BoxImpostor
        : Babylon.PhysicsImpostor.SphereImpostor;
      colliderMesh.physicsImpostor = new Babylon.PhysicsImpostor(colliderMesh, impostorType, { mass: 0 }, this.scene);
      
      colliderMesh.setParent(this.bodyCompoundRootMesh);
    }

    for (const [armColliderMeshName] of armColliderMeshInfos) {
      const colliderMesh: Babylon.AbstractMesh = this.scene.getMeshByName(armColliderMeshName);
      if (!colliderMesh) {
        throw new Error(`failed to find collider mesh in model: ${armColliderMeshName}`);
      }
      
      // Unparent collider mesh before adding physics impostors to them
      colliderMesh.setParent(null);
      this.fixNegativeScaling(colliderMesh as Babylon.Mesh);

      colliderMesh.physicsImpostor = new Babylon.PhysicsImpostor(colliderMesh, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0 }, this.scene);
      
      colliderMesh.setParent(this.armCompoundRootMesh);
    }

    for (const [clawColliderMeshName] of clawColliderMeshInfos) {
      const colliderMesh: Babylon.AbstractMesh = this.scene.getMeshByName(clawColliderMeshName);
      if (!colliderMesh) {
        throw new Error(`failed to find collider mesh in model: ${clawColliderMeshName}`);
      }
      
      // Unparent collider mesh before adding physics impostors to them
      colliderMesh.setParent(null);
      this.fixNegativeScaling(colliderMesh as Babylon.Mesh);

      colliderMesh.physicsImpostor = new Babylon.PhysicsImpostor(colliderMesh, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0 }, this.scene);

      colliderMesh.setParent(this.clawCompoundRootMesh);
    }

    // Find wheel collider meshes in scene
    this.colliderLeftWheelMesh = this.scene.getMeshByName('collider_left_wheel');
    this.colliderRightWheelMesh = this.scene.getMeshByName('collider_right_wheel');

    // Unparent wheel collider meshes before adding physics impostors to them
    this.colliderLeftWheelMesh.setParent(null);
    this.colliderRightWheelMesh.setParent(null);
    this.fixNegativeScaling(this.colliderLeftWheelMesh as Babylon.Mesh);
    this.fixNegativeScaling(this.colliderRightWheelMesh as Babylon.Mesh);

    // Find transform nodes (visual meshes) in scene and parent them to the proper node
    this.scene.getTransformNodeByName('ChassisWombat-1').setParent(this.bodyCompoundRootMesh);
    this.scene.getTransformNodeByName('KIPR_Lower_final_062119-1').setParent(this.bodyCompoundRootMesh);
    this.scene.getTransformNodeByName('1 x 5 Servo Horn-1').setParent(this.armCompoundRootMesh);
    this.scene.getTransformNodeByName('1 x 5 Servo Horn-2').setParent(this.clawCompoundRootMesh);
    this.scene.getTransformNodeByName('Servo Wheel-1').setParent(this.colliderRightWheelMesh);
    this.scene.getTransformNodeByName('Servo Wheel-2').setParent(this.colliderLeftWheelMesh);

    // Update "previous" wheel rotations to avoid sudden jump in motor position
    this.leftWheelRotationPrev = Babylon.Quaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderLeftWheelMesh.rotationQuaternion);
    this.rightWheelRotationPrev = Babylon.Quaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderRightWheelMesh.rotationQuaternion);
    this.armRotationDefault = Babylon.Quaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.armCompoundRootMesh.rotationQuaternion);
    this.clawRotationDefault = Babylon.Quaternion.Inverse(this.armCompoundRootMesh.rotationQuaternion).multiply(this.clawCompoundRootMesh.rotationQuaternion);

    // Set physics impostors for root nodes
    this.bodyCompoundRootMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.bodyCompoundRootMesh, Babylon.PhysicsImpostor.NoImpostor, { mass: 1126, friction: 0.1 }, this.scene);
    this.colliderLeftWheelMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.colliderLeftWheelMesh, Babylon.PhysicsImpostor.CylinderImpostor, { mass: 14, friction: 5 }, this.scene);
    this.colliderRightWheelMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.colliderRightWheelMesh, Babylon.PhysicsImpostor.CylinderImpostor, { mass: 14, friction: 5 }, this.scene);
    this.armCompoundRootMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.armCompoundRootMesh, Babylon.PhysicsImpostor.NoImpostor, { mass: 132, friction: 5 }, this.scene);
    this.clawCompoundRootMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.clawCompoundRootMesh, Babylon.PhysicsImpostor.NoImpostor, { mass: 17, friction: 5 }, this.scene);

    const servoHornTransform = this.scene.getTransformNodeByID('1 x 5 Servo Horn-2');
    servoHornTransform.computeWorldMatrix();
    const zAxisQuaternion = new Babylon.Quaternion(0, 0, -1, 0);
    const zAxisRotatedQuaternion = servoHornTransform.absoluteRotationQuaternion.multiply(zAxisQuaternion).multiply(Babylon.Quaternion.Inverse(servoHornTransform.absoluteRotationQuaternion));
    const zAxisRotatedVector = new Babylon.Vector3(zAxisRotatedQuaternion.x, zAxisRotatedQuaternion.y, zAxisRotatedQuaternion.z);

    const servoWasher = this.scene.getTransformNodeByID('Servo Washer-1');
    servoWasher.computeWorldMatrix();
    const clawMainPivot = servoWasher.absolutePosition.clone().subtract(this.armCompoundRootMesh.absolutePosition.clone());
    const clawConnectedPivot = servoWasher.absolutePosition.clone().subtract(this.clawCompoundRootMesh.absolutePosition.clone());

    const clawJointData: Babylon.PhysicsJointData = {
      mainPivot: clawMainPivot.clone(),
      // mainPivot: new Babylon.Vector3(0, 20, 40),
      connectedPivot: clawConnectedPivot.clone(),
      // connectedPivot: new Babylon.Vector3(0, -3, 0),
      mainAxis: zAxisRotatedVector.clone(),
      // connectedAxis: negativeZ,
      connectedAxis: zAxisRotatedVector.clone(),
    };
    this.clawJoint =  new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint, clawJointData);
    this.armCompoundRootMesh.physicsImpostor.addJoint(this.clawCompoundRootMesh.physicsImpostor, this.clawJoint);

    // eslint-disable-next-line newline-per-chained-call
    const armMainPivot = this.scene.getTransformNodeByID('Servo Washer-2').getAbsolutePosition().subtract(this.bodyCompoundRootMesh.position);
    // eslint-disable-next-line newline-per-chained-call
    const armConnectedPivot = this.scene.getTransformNodeByID('Servo Washer-2').getAbsolutePivotPoint().subtract(this.armCompoundRootMesh.position);
    this.armJoint =  new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint, {
      mainPivot: armMainPivot,
      connectedPivot: armConnectedPivot,
      mainAxis: new Babylon.Vector3(1, 0, 0),
      connectedAxis: new Babylon.Vector3(1, 0, 0),
    });
    this.bodyCompoundRootMesh.physicsImpostor.addJoint(this.armCompoundRootMesh.physicsImpostor, this.armJoint);

    // Create joint for right wheel
    const rightWheelMainPivot = this.colliderRightWheelMesh.position.subtract(this.bodyCompoundRootMesh.position);
    this.rightWheelJoint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint, {
      mainPivot: rightWheelMainPivot,
      connectedPivot: new Babylon.Vector3(0, 0, 0),
      mainAxis: new Babylon.Vector3(1, 0, 0),
      connectedAxis: new Babylon.Vector3(0, -1, 0),
    });
    this.bodyCompoundRootMesh.physicsImpostor.addJoint(this.colliderRightWheelMesh.physicsImpostor, this.rightWheelJoint);

    // Create joint for left wheel
    const leftWheelMainPivot = this.colliderLeftWheelMesh.position.subtract(this.bodyCompoundRootMesh.position);
    this.leftWheelJoint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint, {
      mainPivot: leftWheelMainPivot,
      connectedPivot: new Babylon.Vector3(0, 0, 0),
      mainAxis: new Babylon.Vector3(-1, 0, 0),
      connectedAxis: new Babylon.Vector3(0, 1, 0),
    });
    this.bodyCompoundRootMesh.physicsImpostor.addJoint(this.colliderLeftWheelMesh.physicsImpostor, this.leftWheelJoint);

    // Create sensors
    // `SENSOR_MAPPINGS` is a dictionary of mesh IDs/names to sensor descriptions
    // `instantiateSensor` takes this description and creates the appropriate sensor object
    const instantiate = ([id, sensor]: [string, Sensor]) => instantiateSensor(this.scene, id, sensor);
    this.sensorObjects_ = Dict.toList(SENSOR_MAPPINGS).map(instantiate);

    // Make all sensors visible for now. Eventually the user will be able to control this from the UI
    for (const sensorObject of this.sensorObjects_) sensorObject.isVisible = true;
    
    this.resetPosition();

    await this.scene.whenReadyAsync();
  }
  
  public startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  // Resets the position/rotation of the robot to the current robot state
  public resetPosition(): void {
    const rootMeshes = [this.bodyCompoundRootMesh, this.colliderLeftWheelMesh, this.colliderRightWheelMesh, this.armCompoundRootMesh, this.clawCompoundRootMesh];

    // Create a transform node, positioned and rotated to match the body root
    const resetTransformNode: Babylon.TransformNode = new Babylon.TransformNode("resetTransformNode", this.scene);
    resetTransformNode.setAbsolutePosition(this.bodyCompoundRootMesh.absolutePosition);
    resetTransformNode.rotationQuaternion = this.bodyCompoundRootMesh.absoluteRotationQuaternion;

    for (const rootMesh of rootMeshes) {
      // Stop the robot's motion in case it was falling or otherwise moving
      rootMesh.physicsImpostor.setLinearVelocity(Babylon.Vector3.Zero());
      rootMesh.physicsImpostor.setAngularVelocity(Babylon.Vector3.Zero());

      rootMesh.setParent(resetTransformNode);
    }

    // Set the position and rotation
    const { x, y, z, theta } = this.getRobotState();
    resetTransformNode.setAbsolutePosition(new Babylon.Vector3(x, y, z).addInPlace(this.robotOffset));
    resetTransformNode.rotationQuaternion = Babylon.Quaternion.RotationAxis(Babylon.Vector3.Up(), Babylon.Tools.ToRadians(theta));

    // Destroy the transform node
    for (const rootMesh of rootMeshes) {
      rootMesh.setParent(null);
    }
    resetTransformNode.dispose();
  }

  public handleResize(): void {
    this.engine.resize();
  }

  public createCan(canNumber: number): void {
    const canName = `Can${canNumber}`;
    const canMaterial = new Babylon.StandardMaterial("can", this.scene);
    canMaterial.diffuseTexture = new Babylon.Texture('static/Can Texture.png',this.scene);
    canMaterial.emissiveTexture = canMaterial.diffuseTexture.clone();
    canMaterial.emissiveColor = new Babylon.Color3(0.1,0.1,0.1);
    const faceUV: Babylon.Vector4[] = [];
    faceUV[0] = Babylon.Vector4.Zero();
    faceUV[1] = new Babylon.Vector4(1, 0, 0, 1);
    faceUV[2] = Babylon.Vector4.Zero();

    const new_can = Babylon.MeshBuilder.CreateCylinder(canName,{ height:10, diameter:6, faceUV: faceUV }, this.scene);
    new_can.material = canMaterial;
    new_can.physicsImpostor = new Babylon.PhysicsImpostor(new_can, Babylon.PhysicsImpostor.CylinderImpostor, { mass: 5, friction: 5 }, this.scene);
    new_can.position = new Babylon.Vector3(this.canCoordinates[canNumber - 1][0], 5, this.canCoordinates[canNumber - 1][1]);
  }

  public destroyCan(canNumber: number): void {
    const canName = `Can${canNumber}`;
    this.scene.getMeshByName(canName).dispose();
  }

  private buildFloor() {
    this.mat = Babylon.MeshBuilder.CreateGround("mat", { width:118, height:59, subdivisions:2 }, this.scene);
    this.mat.position.y = -0.8;
    this.mat.rotate(new Babylon.Vector3(0,1,0),-Math.PI / 2);
    const matMaterial = new Babylon.StandardMaterial("ground", this.scene);
    matMaterial.ambientTexture = new Babylon.Texture('static/Surface-A.png',this.scene);
    this.mat.material = matMaterial;
    this.mat.physicsImpostor = new Babylon.PhysicsImpostor(this.mat, Babylon.PhysicsImpostor.BoxImpostor,{ mass:0, friction: 1 }, this.scene);

    this.ground = Babylon.MeshBuilder.CreateGround("ground", { width:354, height:354, subdivisions:2 }, this.scene);
    this.ground.position.y = -0.83;
    const groundMaterial = new Babylon.StandardMaterial("ground", this.scene);
    groundMaterial.emissiveColor = new Babylon.Color3(0.1,0.1,0.1);
    this.ground.material = groundMaterial;
    this.ground.physicsImpostor = new Babylon.PhysicsImpostor(this.ground, Babylon.PhysicsImpostor.BoxImpostor,{ mass:0, friction: 1 }, this.scene);
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
      this.colliderLeftWheelMesh.physicsImpostor.setAngularVelocity(Babylon.Vector3.Zero());
    }
    if (rightSpeed === 0) {
      this.colliderRightWheelMesh.physicsImpostor.setAngularVelocity(Babylon.Vector3.Zero());
    }
  }

  // Gets the delta rotation (in radians) between start and end along the given axis
  private getDeltaRotationOnAxis = (start: Babylon.Quaternion, end: Babylon.Quaternion, axis: Babylon.Vector3) => {
    // Get axis vector local to starting point, by rotating axis vector by the start quaternion
    const axisQuaternion = new Babylon.Quaternion(axis.x, axis.y, axis.z, 0);
    const axisLocalQuaternion = start.multiply(axisQuaternion).multiply(Babylon.Quaternion.Inverse(start));
    const axisLocalVector = new Babylon.Vector3(axisLocalQuaternion.x, axisLocalQuaternion.y, axisLocalQuaternion.z);

    // Get delta quaternion between start and end quaternions, such that end = start * delta
    const delta = end.multiply(Babylon.Quaternion.Inverse(start));

    // Perform swing-twist decomposition of delta to get twist on local axis vector
    const twist = this.getTwistForQuaternion(delta, axisLocalVector);

    // Quaternion is defined with [w = cos(theta / 2)], so [theta = 2 * acos(w)]
    return 2 * Math.acos(twist.w);
  };

  // Does a "swing-twist" decomposition of the given quaternion q
  // "direction" vector must be normalized
  private getTwistForQuaternion = (q: Babylon.Quaternion, direction: Babylon.Vector3) => {
    const rotationAxis = new Babylon.Vector3(q.x, q.y, q.z);

    // Calculate vector projection of vector onto direction
    // Shortcut projection calculation since "direction" is assumed to be normalized (i.e. magnitude of 1)
    const dotProd: number = Babylon.Vector3.Dot(direction, rotationAxis);
    const projection = direction.scale(dotProd);

    const twist = new Babylon.Quaternion(projection.x, projection.y, projection.z, q.w).normalize();

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
    const armCurr = Babylon.Quaternion.Inverse(bodyCurrQuat).multiply(armCurrQuat);
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
      this.armJoint.setMotor(armSign * 0.3 * this.TIMESTEP_FACTOR, 8000);
    } else {
      this.armJoint.setMotor(armSign * 1.5 * this.TIMESTEP_FACTOR, 8000);
    }

    // Get updated real mesh rotation for claw
    const clawCurr = Babylon.Quaternion.Inverse(armCurrQuat).multiply(clawCurrQuat);
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
      this.clawJoint.setMotor(clawSign * 0.3 * this.TIMESTEP_FACTOR, 2000);
    } else {
      this.clawJoint.setMotor(clawSign * 1.5 * this.TIMESTEP_FACTOR, 2000);
    }
  }

  // Takes a mesh with negative scaling values and "bakes" the negative scaling into the mesh itself,
  // resulting in effectively the same mesh but with all positive scale values.
  // This is used specifically on collider meshes imported from the GLTF model, to work around an issue
  // with physics impostors and negative scaling.
  // See GitHub issue: https://github.com/BabylonJS/Babylon.js/issues/10283
  private fixNegativeScaling(mesh: Babylon.Mesh) {
    const initialScaling = mesh.scaling.clone();
    const scaleMatrix = Babylon.Matrix.Scaling(Math.sign(initialScaling.x), Math.sign(initialScaling.y), Math.sign(initialScaling.z));
    mesh.bakeTransformIntoVertices(scaleMatrix);
    initialScaling.set(Math.abs(initialScaling.x), Math.abs(initialScaling.y), Math.abs(initialScaling.z));
    mesh.scaling = initialScaling;
  }
}
