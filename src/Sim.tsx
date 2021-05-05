import * as Babylon from 'babylonjs';
import 'babylonjs-loaders';
// import Oimo = require('babylonjs/Oimo');
import Ammo = require('./ammo');
import { VisibleSensor } from './sensors/sensor';
import { ETSensorBabylon } from './sensors/etSensorBabylon';
import { RobotState } from './RobotState';

export class Space {
  private engine: Babylon.Engine;
  private canvas: HTMLCanvasElement;
  private scene: Babylon.Scene;

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
  

  // Last recorded rotations of left and right wheels
  private leftWheelRotationPrev: Babylon.Quaternion;
  private rightWheelRotationPrev: Babylon.Quaternion;

  // TODO: Associate each sensor with an update frequency, since we may update different sensors at different speeds
  private etSensorFake: VisibleSensor;
  private etSensorArm: VisibleSensor;
  private ticksSinceETSensorUpdate: number;

  private canCoordinates: Array<[number, number]>;

  private collidersVisible = false;

  private readonly TICKS_BETWEEN_ET_SENSOR_UPDATES = 15;
  private readonly WHEEL_TICKS_PER_RADIAN = 2048 / (2 * Math.PI);

  // Servos on robot normally only have 175 degrees of range
  private readonly SERVO_DEFUALT_RADIANS = 87.5 * Math.PI / 180;
  private readonly SERVO_TICKS_PER_RADIAN = 2048 / (2 * this.SERVO_DEFUALT_RADIANS);
  
  private readonly MAX_MOTOR_VELOCITY = 1500;

  // The axis along which to calculate wheel rotations
  // This is the y axis instead of the x axis because the wheels in the loaded model are rotated
  private static readonly wheelRotationVector: Babylon.Vector3 = new Babylon.Vector3(0, -1, 0);

  private getRobotState: () => RobotState;
  private updateRobotState: (robotState: Partial<RobotState>) => void;

  // TODO: Find a better way to communicate robot state instead of these callbacks
  constructor(canvas: HTMLCanvasElement, getRobotState: () => RobotState, updateRobotState: (robotState: Partial<RobotState>) => void) {
    this.canvas = canvas;
    this.engine = new Babylon.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Babylon.Scene(this.engine);

    this.getRobotState = getRobotState;
    this.updateRobotState = updateRobotState;

    this.ticksSinceETSensorUpdate = 0;
  }

  public createScene(): void {
    const camera = new Babylon.ArcRotateCamera("botcam",10,10,10, new Babylon.Vector3(50,50,50), this.scene);
    camera.setTarget(Babylon.Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new Babylon.HemisphericLight("botlight", new Babylon.Vector3(0,1,0), this.scene);
    light.intensity = 0.75;

    // At 100x scale, gravity should be -9.8 * 100, but this causes weird jitter behavior
    // Full gravity will be -9.8 * 10
    const gravityVector = new Babylon.Vector3(0, -9.8 * 10, 0);
    this.scene.enablePhysics(gravityVector, new Babylon.AmmoJSPlugin(true, Ammo));

    this.buildFloor();

    // (x, z) coordinates of cans around the board
    this.canCoordinates = [[-22, -14.3], [0, -20.6], [15.5, -23.7], [0, -6.9], [-13.7, 6.8], [0, 6.8], [13.5, 6.8], [25.1, 14.8], [0, 34], [-18.8, 45.4], [0, 54.9], [18.7, 45.4]];

    // Logic that happens before every frame
    this.scene.registerBeforeRender(() => {
      let didUpdateFakeETSensor = false;
      let didUpdateArmETSensor = false;

      // If visualization is on, update ET sensor visual
      if (this.etSensorFake.isVisible) {
        this.etSensorFake.update();
        this.etSensorFake.updateVisual();
        didUpdateFakeETSensor = true;
      }

      if (this.etSensorArm?.isVisible) {
        this.etSensorArm.update();
        this.etSensorArm.updateVisual();
        didUpdateArmETSensor = true;
      }

      // If 30 frames have passed since last sensor update, update ET sensor value
      if (this.ticksSinceETSensorUpdate >= this.TICKS_BETWEEN_ET_SENSOR_UPDATES) {
        // Update ET sensor if we didn't already update it earlier
        if (!didUpdateFakeETSensor) {
          this.etSensorFake.update();
          didUpdateFakeETSensor = true;
        }

        if (this.etSensorArm && !didUpdateArmETSensor) {
          this.etSensorArm.update();
          didUpdateArmETSensor = true;
        }

        // Update robot state with new ET sensor value
        const currRobotState = this.getRobotState();
        const a0 = this.etSensorFake.getValue();
        const a1 = this.etSensorArm ? this.etSensorArm.getValue() : currRobotState.analogValues[1];
        this.updateRobotState({ analogValues: [a0, a1, 0, 0, 0, 0] });

        this.ticksSinceETSensorUpdate = 0;
      } else {
        this.ticksSinceETSensorUpdate++;
      }
    });

    this.scene.registerAfterRender(() => {
      const currRobotState = this.getRobotState();

      // Set simulator motor speeds based on robot state
      this.setDriveMotors(currRobotState.motorSpeeds[0], currRobotState.motorSpeeds[3]);

      // Set simulator servo positions based on robot state
      this.setServoPositions(currRobotState.servoPositions);
      this.clawJoint.setMotor(1);

      // Get current wheel rotations
      const leftWheelRotationCurr = Babylon.Quaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderLeftWheelMesh.rotationQuaternion);
      const rightWheelRotationCurr = Babylon.Quaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.colliderRightWheelMesh.rotationQuaternion);
      // const armRotationCurr = Babylon.Quaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.armCompoundRootMesh.rotationQuaternion);
      
      let leftRotation = this.getDeltaRotationOnAxis(this.leftWheelRotationPrev, leftWheelRotationCurr, Space.wheelRotationVector);
      let rightRotation = this.getDeltaRotationOnAxis(this.rightWheelRotationPrev, rightWheelRotationCurr, Space.wheelRotationVector);
      // let armRotation = this.getDeltaRotationOnAxis(this.armGoalRotation, armRotationCurr, Space.armRotationVector);

      // If rotation is in (pi, 2pi) range, convert to the equivalent negative rotation in (-pi, 0) range
      if (leftRotation > Math.PI) {
        leftRotation = leftRotation - 2 * Math.PI;
      }
      if (rightRotation > Math.PI) {
        rightRotation = rightRotation - 2 * Math.PI;
      }

      // const s0_position = Math.round((this.getRobotState().servoPositions[0] / 11.702) - 87.5);
      // const angle_servoArm = Math.round(Babylon.Tools.ToDegrees(this.armCompoundRootMesh.rotationQuaternion.toEulerAngles()._x));

      // Update motor positions based on wheel rotation
      const m0Position = currRobotState.motorPositions[0] + leftRotation * this.WHEEL_TICKS_PER_RADIAN;
      const m3Position = currRobotState.motorPositions[3] + rightRotation * this.WHEEL_TICKS_PER_RADIAN;
      this.updateRobotState({
        motorPositions: [m0Position, 0, 0, m3Position],
      });

      this.leftWheelRotationPrev = leftWheelRotationCurr;
      this.rightWheelRotationPrev = rightWheelRotationCurr;

      // const s0_position = Math.round((this.getRobotState().servoPositions[0] / 11.702) - 87.5);
      // const angle_servoArm = Math.round(Babylon.Tools.ToDegrees(this.servoArmMotor.rotationQuaternion.toEulerAngles()._x));
      // console.log(`position: ${this.getRobotState().servo0_position} Calculated position: ${s0_position} Servo Angle: ${angle_servoArm}`);
      // // console.log(Math.round(Babylon.Tools.ToDegrees(this.servoArmMotor.rotationQuaternion.toEulerAngles()._x)));

      // if (s0_position > angle_servoArm) {
      //   this.setnegativeServo(s0_position);
      // } else if (s0_position < angle_servoArm) {
      //   this.setpositiveServo(s0_position);
      // } else if (s0_position === angle_servoArm) {
      //   this.liftArm_joint.setMotor(0);
      // } else {
      //   // do something
      // }
      // this.liftClaw_joint.setMotor(0.3);
      

      // if(this.registers_[61] == 0){
      //   s1 = WorkerInstance.readServoRegister(WorkerInstance.registers[78], WorkerInstance.registers[79]);
      //   s3 = WorkerInstance.readServoRegister(WorkerInstance.registers[80], WorkerInstance.registers[81]);
      // }
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

    const clawColliderMesh = this.scene.getMeshByName('collider_claw_1');
    clawColliderMesh.computeWorldMatrix(true);
    this.clawCompoundRootMesh = new Babylon.Mesh("clawCompoundMesh", this.scene);
    this.clawCompoundRootMesh.position = clawColliderMesh.getAbsolutePosition().clone();
    this.clawCompoundRootMesh.rotationQuaternion = new Babylon.Quaternion();

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
      colliderMesh.physicsImpostor = new Babylon.PhysicsImpostor(colliderMesh, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0 }, this.scene);
      
      colliderMesh.setParent(this.clawCompoundRootMesh);
    }

    // Find wheel collider meshes in scene
    this.colliderLeftWheelMesh = this.scene.getMeshByName('collider_left_wheel');
    this.colliderRightWheelMesh = this.scene.getMeshByName('collider_right_wheel');

    // Unparent wheel collider meshes before adding physics impostors to them
    this.colliderLeftWheelMesh.setParent(null);
    this.colliderRightWheelMesh.setParent(null);

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
    // this.armGoalRotation = Babylon.Quaternion.Inverse(this.bodyCompoundRootMesh.rotationQuaternion).multiply(this.armCompoundRootMesh.rotationQuaternion);

    // Set physics impostors for root nodes
    this.bodyCompoundRootMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.bodyCompoundRootMesh, Babylon.PhysicsImpostor.NoImpostor, { mass: 100, friction: 0.1 }, this.scene);
    this.colliderLeftWheelMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.colliderLeftWheelMesh, Babylon.PhysicsImpostor.CylinderImpostor, { mass: 10, friction: 5 }, this.scene);
    this.colliderRightWheelMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.colliderRightWheelMesh, Babylon.PhysicsImpostor.CylinderImpostor, { mass: 10, friction: 5 }, this.scene);
    this.armCompoundRootMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.armCompoundRootMesh, Babylon.PhysicsImpostor.NoImpostor, { mass: 6, friction: 0.1 }, this.scene);
    this.clawCompoundRootMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.clawCompoundRootMesh, Babylon.PhysicsImpostor.NoImpostor, { mass: 0.5, friction: 0.1 }, this.scene);
    
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

    // eslint-disable-next-line newline-per-chained-call
    const clawMainPivot = this.scene.getTransformNodeByID('Servo Washer-1').getAbsolutePosition().subtract(this.armCompoundRootMesh.position);
    // eslint-disable-next-line newline-per-chained-call
    const clawConnectedPivot = this.scene.getTransformNodeByID('Servo Washer-1').getAbsolutePivotPoint().subtract(this.clawCompoundRootMesh.position);
    this.clawJoint =  new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint, {
      mainPivot: clawMainPivot,
      connectedPivot: clawConnectedPivot,
      mainAxis: new Babylon.Vector3(1, 0, 0),
      connectedAxis: new Babylon.Vector3(1, 0, 0), // this.scene.getTransformNodeByID('Servo Washer-1').getAbsolutePosition(),
    });
    this.armCompoundRootMesh.physicsImpostor.addJoint(this.clawCompoundRootMesh.physicsImpostor, this.clawJoint);

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

    

    // Create ET sensors, positioned relative to other meshes
    const etSensorMesh = this.scene.getMeshByID('black satin finish plastic');
    this.etSensorArm = new ETSensorBabylon(this.scene, etSensorMesh, new Babylon.Vector3(0.0, 0.02, 0.0), new Babylon.Vector3(0.02, 0.02, -0.015), { isVisible: true });
    this.etSensorFake = new ETSensorBabylon(this.scene, this.bodyCompoundRootMesh, new Babylon.Vector3(0, 0, 18), new Babylon.Vector3(0, 0, 18), { isVisible: true });

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
    const rootMeshes = [this.bodyCompoundRootMesh, this.colliderLeftWheelMesh, this.colliderRightWheelMesh, this.armCompoundRootMesh];

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
    const new_can = Babylon.MeshBuilder.CreateCylinder(canName,{ height:10, diameter:6 }, this.scene);
    new_can.physicsImpostor = new Babylon.PhysicsImpostor(new_can, Babylon.PhysicsImpostor.CylinderImpostor, { mass: 10, friction: 5 }, this.scene);
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

  private vecToLocal(vector: Babylon.Vector3, mesh: Babylon.AbstractMesh): Babylon.Vector3 {
    const matrix = mesh.getWorldMatrix();
    return Babylon.Vector3.TransformCoordinates(vector, matrix);
  }


  private setServoPositions(goals: number[]) {
    const armCurr = this.armCompoundRootMesh.rotationQuaternion.toEulerAngles().x;
    const armGoal = goals[0] / this.SERVO_TICKS_PER_RADIAN - this.SERVO_DEFUALT_RADIANS;
    const delta = armCurr - armGoal;
    const sign = delta >= 0 ? 1 : -1;
    const deltaNorm = Math.abs(delta / (this.SERVO_DEFUALT_RADIANS * 2));
    switch (delta !== null) {
      case deltaNorm < 0.02:
        this.armJoint.setMotor(0);
        this.armCompoundRootMesh.physicsImpostor.setAngularVelocity(Babylon.Vector3.Zero());
        break;
      case deltaNorm >= 0.02 && deltaNorm <= 0.04:
        this.armJoint.setMotor(sign * 0.3);
        break;
      case deltaNorm > 0.04:
        this.armJoint.setMotor(sign * 2.38);
        break;
      default:
        this.armJoint.setMotor(0);
        this.armCompoundRootMesh.physicsImpostor.setAngularVelocity(Babylon.Vector3.Zero());
    }
    
  }

  private setPositiveServo(s0_position: number) {
    this.armJoint.setMotor(2.38); // Rotates arm backwards

    const angle_Positive = Babylon.Tools.ToDegrees(this.armCompoundRootMesh.rotationQuaternion.toEulerAngles()._x);
    if (s0_position  > angle_Positive || angle_Positive > 85 || angle_Positive < -85) {
      this.armJoint.setMotor(0);
    }
  }

  private setNegativeServo(s0_position: number) {
    this.armJoint.setMotor(-2.38); // Rotates arm forward

    const angle_Negative = Babylon.Tools.ToDegrees(this.armCompoundRootMesh.rotationQuaternion.toEulerAngles()._x);
    if (s0_position < angle_Negative || angle_Negative < -85 || angle_Negative > 85) {
      this.armJoint.setMotor(0);
    }
  }
}
