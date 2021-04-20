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

  private bodyCompoundRootMesh: Babylon.AbstractMesh;
  private botMover: Babylon.Vector3;

  private leftWheelJoint: Babylon.MotorEnabledJoint;
  private rightWheelJoint: Babylon.MotorEnabledJoint;

  // TODO: Associate each sensor with an update frequency, since we may update different sensors at different speeds
  private etSensorFake: VisibleSensor;
  private etSensorArm: VisibleSensor;
  private ticksSinceETSensorUpdate: number;

  private can: Babylon.Mesh;
  private canCoordinates: Array<[number, number]>;

  private collidersVisible = false;

  private readonly TICKS_BETWEEN_ET_SENSOR_UPDATES = 15;

  private getRobotState: () => RobotState;
  private setRobotState: (robotState: RobotState) => void;

  // TODO: Find a better way to communicate robot state instead of these callbacks
  constructor(canvas: HTMLCanvasElement, getRobotState: () => RobotState, setRobotState: (robotState: RobotState) => void) {
    this.canvas = canvas;
    this.engine = new Babylon.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Babylon.Scene(this.engine);

    this.getRobotState = getRobotState;
    this.setRobotState = setRobotState;
    // this.botMover = new Babylon.Vector3(getRobotState().x, getRobotState().y, getRobotState().z).subtractFromFloats(RobotState.empty.x, RobotState.empty.y, RobotState.empty.z);
    this.botMover = new Babylon.Vector3(0,1,-37);
    this.ticksSinceETSensorUpdate = 0;
  }

  public createScene(): void {
    const camera = new Babylon.ArcRotateCamera("botcam",10,10,10, new Babylon.Vector3(50,50,50), this.scene);
    camera.setTarget(Babylon.Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new Babylon.HemisphericLight("botlight", new Babylon.Vector3(0,1,0), this.scene);
    light.intensity = 0.75;

    // At 100x scale, gravity should be -9.8 * 100, but this causes weird jitter behavior,
    // so leaving as -9.8 * 10 for now
    this.scene.enablePhysics(new Babylon.Vector3(0,-9.8 * 10,0), new Babylon.AmmoJSPlugin(true, Ammo));

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
        const robotState = this.getRobotState();
        this.setRobotState({
          ...robotState,
          analog0_value: this.etSensorFake.getValue(),
          analog1_value: this.etSensorArm ? this.etSensorArm.getValue() : robotState.analog1_value,
        });

        this.ticksSinceETSensorUpdate = 0;
      } else {
        this.ticksSinceETSensorUpdate++;
      }
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
    this.scene.getTransformNodeByName('Root').setAbsolutePosition(new Babylon.Vector3(RobotState.empty.x, RobotState.empty.y, RobotState.empty.z).add(this.botMover));
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
    this.bodyCompoundRootMesh.position = wallabyColliderMesh.getAbsolutePosition().add(this.botMover);

    type ColliderShape = 'box' | 'sphere';
    const bodyColliderMeshInfos: [string, ColliderShape][] = [
      ['collider_arm_claw_1', 'box'],
      ['collider_arm_claw_2', 'box'],
      ['collider_arm_claw_3', 'box'],
      ['collider_claw_1', 'box'],
      ['collider_claw_2', 'box'],
      ['collider_claw_3', 'box'],
      ['collider_claw_servo', 'box'],
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
      colliderMesh.setAbsolutePosition(colliderMesh.absolutePosition.add(this.botMover));
    }
    
    // Find wheel collider meshes in scene
    const colliderLeftWheelMesh: Babylon.AbstractMesh = this.scene.getMeshByName('collider_left_wheel');
    const colliderRightWheelMesh: Babylon.AbstractMesh = this.scene.getMeshByName('collider_right_wheel');

    // Unparent wheel collider meshes before adding physics impostors to them
    colliderLeftWheelMesh.setParent(null);
    colliderRightWheelMesh.setParent(null);

    colliderLeftWheelMesh.setAbsolutePosition(colliderLeftWheelMesh.absolutePosition.add(this.botMover));
    colliderRightWheelMesh.setAbsolutePosition(colliderRightWheelMesh.absolutePosition.add(this.botMover));

    // Find transform nodes (visual meshes) in scene and parent them to the proper node
    this.scene.getTransformNodeByName('ChassisWombat-1').setParent(this.bodyCompoundRootMesh);
    this.scene.getTransformNodeByName('KIPR_Lower_final_062119-1').setParent(this.bodyCompoundRootMesh);
    this.scene.getTransformNodeByName('1 x 5 Servo Horn-1').setParent(this.bodyCompoundRootMesh);
    this.scene.getTransformNodeByName('1 x 5 Servo Horn-2').setParent(this.bodyCompoundRootMesh);
    this.scene.getTransformNodeByName('Servo Wheel-1').setParent(colliderRightWheelMesh);
    this.scene.getTransformNodeByName('Servo Wheel-2').setParent(colliderLeftWheelMesh);

    // Set physics impostors for root nodes
    this.bodyCompoundRootMesh.physicsImpostor = new Babylon.PhysicsImpostor(this.bodyCompoundRootMesh, Babylon.PhysicsImpostor.NoImpostor, { mass: 100, friction: 0.1 }, this.scene);
    colliderLeftWheelMesh.physicsImpostor = new Babylon.PhysicsImpostor(colliderLeftWheelMesh, Babylon.PhysicsImpostor.CylinderImpostor, { mass: 10, friction: 1 }, this.scene);
    colliderRightWheelMesh.physicsImpostor = new Babylon.PhysicsImpostor(colliderRightWheelMesh, Babylon.PhysicsImpostor.CylinderImpostor, { mass: 10, friction: 1 }, this.scene);
    // Create joint for right wheel
    const rightWheelMainPivot = colliderRightWheelMesh.position.subtract(this.bodyCompoundRootMesh.position);
    this.rightWheelJoint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint, {
      mainPivot: rightWheelMainPivot,
      connectedPivot: new Babylon.Vector3(0, 0, 0),
      mainAxis: new Babylon.Vector3(1, 0, 0),
      connectedAxis: new Babylon.Vector3(0, -1, 0),
    });
    this.bodyCompoundRootMesh.physicsImpostor.addJoint(colliderRightWheelMesh.physicsImpostor, this.rightWheelJoint);

    // Create joint for left wheel
    const leftWheelMainPivot = colliderLeftWheelMesh.position.subtract(this.bodyCompoundRootMesh.position);
    this.leftWheelJoint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint, {
      mainPivot: leftWheelMainPivot,
      connectedPivot: new Babylon.Vector3(0, 0, 0),
      mainAxis: new Babylon.Vector3(-1, 0, 0),
      connectedAxis: new Babylon.Vector3(0, 1, 0),
    });
    this.bodyCompoundRootMesh.physicsImpostor.addJoint(colliderLeftWheelMesh.physicsImpostor, this.leftWheelJoint);

    // Create ET sensors, positioned relative to other meshes
    const etSensorMesh = this.scene.getMeshByID('black satin finish plastic');
    this.etSensorArm = new ETSensorBabylon(this.scene, etSensorMesh, new Babylon.Vector3(0.0, 0.02, 0.0), new Babylon.Vector3(0.02, 0.02, -0.015), { isVisible: true });
    this.etSensorFake = new ETSensorBabylon(this.scene, this.bodyCompoundRootMesh, new Babylon.Vector3(0, 0, 18), new Babylon.Vector3(0, 0, 18), { isVisible: true });

    await this.scene.whenReadyAsync();

    // this.bodyCompoundRootMesh.rotate(Babylon.Axis.Y, Math.PI);
    // this.bodyCompoundRootMesh.setAbsolutePosition(new Babylon.Vector3(0,6.7,20));

    this.scene.registerAfterRender(() => {
      const m1 = this.getRobotState().motor0_speed  / 1500 * 2;
      const m2 = this.getRobotState().motor3_speed  / 1500 * 2;

      this.setMotors(m1, m2);

      // const s0_position = Math.round((this.getRobotState().servo0_position / 11.702) - 87.5);
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
  

  public startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
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
    this.ground.position.y = -0.81;
    const groundMaterial = new Babylon.StandardMaterial("ground", this.scene);
    groundMaterial.emissiveColor = new Babylon.Color3(0.1,0.1,0.1);
    this.ground.material = groundMaterial;
    this.ground.physicsImpostor = new Babylon.PhysicsImpostor(this.ground, Babylon.PhysicsImpostor.BoxImpostor,{ mass:0, friction: 1 }, this.scene);
  }

  private setMotors(m1: number, m2: number) {
    // One motor is negative because the wheel joints are created on opposite axes,
    // so one needs to turn "backwards" for them to turn in the same direction
    this.leftWheelJoint.setMotor(m1);
    this.rightWheelJoint.setMotor(-m2);
  }

  // private setpositiveServo(s0_position: number) {
  //   this.liftArm_joint.setMotor(0.3); // Rotates arm backwards

  //   const angle_Positive = Babylon.Tools.ToDegrees(this.servoArmMotor.rotationQuaternion.toEulerAngles()._x);
  //   if (s0_position  > angle_Positive || angle_Positive > 85 || angle_Positive < -85) {
  //     this.liftArm_joint.setMotor(0);
  //   }
  // }

  // private setnegativeServo(s0_position: number) {
  //   this.liftArm_joint.setMotor(-0.3); // Rotates arm forward

  //   const angle_Negative = Babylon.Tools.ToDegrees(this.servoArmMotor.rotationQuaternion.toEulerAngles()._x);
  //   if (s0_position < angle_Negative || angle_Negative < -85 || angle_Negative > 85) {
  //     this.liftArm_joint.setMotor(0);
  //   }
  // }
}
