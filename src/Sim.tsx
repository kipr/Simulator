import * as Babylon from 'babylonjs';
import 'babylonjs-loaders';
// import Oimo = require('babylonjs/Oimo');
import Ammo = require('./ammo');
import { VisibleSensor } from './sensors/sensor';
import { ETSensorBabylon } from './sensors/etSensorBabylon';
import WorkerInstance from './WorkerInstance';
import RegisterState from './RegisterState';

export class Space {
	public engine: Babylon.Engine;
	public canvas: HTMLCanvasElement;
	public scene: Babylon.Scene;

	private ground: Babylon.Mesh;

	public botbody: Babylon.Mesh;
	public wombat: Babylon.Mesh;
	public battery: Babylon.Mesh;
	public caster: Babylon.Mesh;

	public armServo: Babylon.Mesh;
	public liftArm: Babylon.Mesh;
	public servoArmMotor: Babylon.Mesh;
	private servoArmAxis = new Babylon.Vector3(-1.1,3.2,11.97);

	public wheel1: Babylon.Mesh;
	public wheel2: Babylon.Mesh;
	
	public motor1: number;
	public motor2: number;
	public can: Babylon.Mesh;
	public can_1: Babylon.InstancedMesh;
	public can_2: Babylon.InstancedMesh;
	public can_3: Babylon.InstancedMesh;
	public can_4: Babylon.InstancedMesh;
	public can_5: Babylon.InstancedMesh;
	public can_6: Babylon.InstancedMesh;
	public can_7: Babylon.InstancedMesh;
	public can_8: Babylon.InstancedMesh;
	public can_9: Babylon.InstancedMesh;
	public can_10: Babylon.InstancedMesh;
	public can_11: Babylon.InstancedMesh;
	public can_12: Babylon.InstancedMesh;
	public can_positions: Array<number>

	public generateCans(Can_position) {
		this.can_positions = [];
		this.can_positions = [0,0,0,22,0,14.5];
		let new_can = Babylon.MeshBuilder.CreateCylinder("can"+Can_position,{height:10, diameter:6}, this.scene);
		//this.can.position = new Babylon.Vector3(0,0,30);//.z = 30;
		new_can.physicsImpostor = new Babylon.PhysicsImpostor(new_can, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);
		new_can.position = new Babylon.Vector3(this.can_positions[Can_position*3], this.can_positions[(Can_position*3)+1],this.can_positions[(Can_position*3)+2])
	}

	private collidersVisible = true;
	private counter = 0;

	// TODO: Associate each sensor with an update frequency, since we may update different sensors at different speeds
	private etSensorFake: VisibleSensor;
	private etSensorArm: VisibleSensor;
	private ticksSinceETSensorUpdate: number;

	private readonly TICKS_BETWEEN_ET_SENSOR_UPDATES = 15;

	constructor(engine: Babylon.Engine, canvas: HTMLCanvasElement) {
		this.engine = engine;
		this.canvas = canvas;
		this.scene = new Babylon.Scene(engine);

		this.ticksSinceETSensorUpdate = 0;
		this.motor1 = -2;
		this.motor2 = -2;
	}

	public wheel1_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
		mainPivot: new Babylon.Vector3(7.9,-0.34,5.1),//Point relative to the center of the base object
		connectedPivot: new Babylon.Vector3(0,0,0),//Point relative to the center of the rotating object
		mainAxis: new Babylon.Vector3(1,0,0),//Base object axis of rotation
		connectedAxis: new Babylon.Vector3(0,-1,0)//Rotating object axis of rotation (don't forget about any rotations you may have made)
	});

	public wheel2_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
		mainPivot: new Babylon.Vector3(-7.9,-0.34,5.1),
		connectedPivot: new Babylon.Vector3(0,0,0),
		mainAxis: new Babylon.Vector3(1,0,0),
		connectedAxis: new Babylon.Vector3(0,1,0)
	});

	public liftArm_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
		mainPivot: this.servoArmAxis,
		connectedPivot: new Babylon.Vector3(0,0,0),
		mainAxis: new Babylon.Vector3(1,0,0),
		connectedAxis: new Babylon.Vector3(0,1,0)
	});

	public createScene() {
		const camera = new Babylon.ArcRotateCamera("botcam",10,10,10, new Babylon.Vector3(50,50,50), this.scene);
		camera.setTarget(Babylon.Vector3.Zero());
		camera.attachControl(this.canvas, true);

		const light = new Babylon.HemisphericLight("botlight", new Babylon.Vector3(0,1,0), this.scene);
		light.intensity = 0.7;

		this.scene.enablePhysics(new Babylon.Vector3(0,-9.8,0), new Babylon.AmmoJSPlugin(true, Ammo));

		this.buildGround();

		//Robot Colliders

		this.buildBotBody();
		
		this.buildWombat();
		this.buildBattery();
		this.buildCaster();
		this.buildArmServo();
		this.buildServoArmMotor();
		this.buildLiftArm();
		this.buildClawServo();
		this.buildStaticClawP1();
		this.buildStaticClawP2();
		this.buildStaticClawP3();
		this.buildStaticClawP4();
		this.buildStaticClawP5();
		this.buildWheels();
		this.buildcans();
		

		this.can = Babylon.MeshBuilder.CreateCylinder("can",{height:10, diameter:6.8}, this.scene);
		this.can.position.z = 30;

		this.assignPhysicsImpostors();

		this.etSensorFake = new ETSensorBabylon(this.scene, this.botbody, new Babylon.Vector3(0, 0, 15), new Babylon.Vector3(0, 0, 15), { isVisible: true });

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

				// Update registers with new ET sensor value
				WorkerInstance.setRegister(RegisterState.REG_RW_ADC_0_L, this.etSensorFake.getValue());
				if (this.etSensorArm) WorkerInstance.setRegister(RegisterState.REG_RW_ADC_1_L, this.etSensorArm.getValue());

				this.ticksSinceETSensorUpdate = 0;
			} else {
				this.ticksSinceETSensorUpdate++;
			}
		});
	}

	public loadMeshes(space: Space) {
		const loader = Babylon.SceneLoader.ImportMesh("",'static/', 'Simulator_Demobot.glb', space.scene, function (meshes) {
			meshes[0].setParent(space.botbody);
			space.scene.executeWhenReady(function () {
				space.assignVisServoArm(space);
				space.assignVisWheels(space);
			});

			const etSensorMesh = space.scene.getMeshByID('black satin finish plastic');
			space.etSensorArm = new ETSensorBabylon(space.scene, etSensorMesh, new Babylon.Vector3(0.0, 0.02, 0.0), new Babylon.Vector3(0.02, 0.02, -0.015), { isVisible: true });
			
		});
		
	}

	private buildcans() {

		this.can = Babylon.MeshBuilder.CreateCylinder("can",{height:10, diameter:6}, this.scene);
		//this.can.position = new Babylon.Vector3(0,0,30);//.z = 30;
		this.can.physicsImpostor = new Babylon.PhysicsImpostor(this.can, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);
		this.can.setEnabled(false);

		//Creating new Instances
		this.can_1 = this.can.createInstance("can_1");
		this.can_1.position = new Babylon.Vector3(22,0,14.5);
		this.can_1.setEnabled(false);
		this.can_1.physicsImpostor = new Babylon.PhysicsImpostor(this.can_1, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.can_2 = this.can.createInstance("can_2");
		this.can_2.position = new Babylon.Vector3(0,0,20.6);
		this.can_2.setEnabled(false);
		this.can_2.physicsImpostor = new Babylon.PhysicsImpostor(this.can_2, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.can_3 = this.can.createInstance("can_3");
		this.can_3.position = new Babylon.Vector3(-15.5,0,24);
		this.can_3.setEnabled(false);
		this.can_3.physicsImpostor = new Babylon.PhysicsImpostor(this.can_3, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.can_4 = this.can.createInstance("can_4");
		this.can_4.position = new Babylon.Vector3(0,0,7);
		this.can_4.setEnabled(false);
		this.can_4.physicsImpostor = new Babylon.PhysicsImpostor(this.can_4, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.can_5 = this.can.createInstance("can_5");
		this.can_5.position = new Babylon.Vector3(14,0,-7);
		this.can_5.setEnabled(false);
		this.can_5.physicsImpostor = new Babylon.PhysicsImpostor(this.can_5, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		// this.can_6 = this.can.createInstance("can_6");
		// this.can_6.position = new Babylon.Vector3(0,0,-7);
		// this.can_6.setEnabled(false);
		// this.can_6.physicsImpostor = new Babylon.PhysicsImpostor(this.can_6, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.can_7 = this.can.createInstance("can_7");
		this.can_7.position = new Babylon.Vector3(-13.7,0,-7);
		this.can_7.setEnabled(false);
		this.can_7.physicsImpostor = new Babylon.PhysicsImpostor(this.can_7, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.can_8 = this.can.createInstance("can_8");
		this.can_8.position = new Babylon.Vector3(-25,0,-14.5);
		this.can_8.setEnabled(false);
		this.can_8.physicsImpostor = new Babylon.PhysicsImpostor(this.can_8, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);
		
		this.can_9 = this.can.createInstance("can_9");
		this.can_9.position = new Babylon.Vector3(0,0,-34);
		this.can_9.setEnabled(false);
		this.can_9.physicsImpostor = new Babylon.PhysicsImpostor(this.can_9, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.can_10 = this.can.createInstance("can_10");
		this.can_10.position = new Babylon.Vector3(19,0,-45);
		this.can_10.setEnabled(false);
		this.can_10.physicsImpostor = new Babylon.PhysicsImpostor(this.can_10, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.can_11 = this.can.createInstance("can_11");
		this.can_11.position = new Babylon.Vector3(0,0,-55);
		this.can_11.setEnabled(false);
		this.can_11.physicsImpostor = new Babylon.PhysicsImpostor(this.can_11, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.can_12 = this.can.createInstance("can_12");
		this.can_12.position = new Babylon.Vector3(-18.5,0,-45);
		this.can_12.setEnabled(false);
		this.can_12.physicsImpostor = new Babylon.PhysicsImpostor(this.can_12, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);
				
	}

	private buildGround () {
		this.ground = Babylon.MeshBuilder.CreateGround("mat", {width:118, height:59, subdivisions:2}, this.scene);
		this.ground.position.y = -1;
		this.ground.rotate(new Babylon.Vector3(0,1,0),Math.PI/2);
		const groundMaterial = new Babylon.StandardMaterial("ground", this.scene);
		groundMaterial.ambientTexture = new Babylon.Texture('static/Surface-A.png',this.scene);
		this.ground.material = groundMaterial;
		this.ground.physicsImpostor = new Babylon.PhysicsImpostor(this.ground, Babylon.PhysicsImpostor.BoxImpostor,{mass:0}, this.scene);
	}

	private buildBotBody () {
		this.botbody = Babylon.MeshBuilder.CreateBox("botbody", {width:12.3, depth:24.6, height:3}, this.scene);
		this.botbody.position.y = 4.4;
		this.botbody.position.z = -12.3;
		this.botbody.isVisible = this.collidersVisible;
	}
	//Babylon.Vector3(-1.1,3.2,11.97);
	private buildWombat () {
		this.wombat = Babylon.MeshBuilder.CreateBox("wombat", {width:13, depth:13.8, height:3.3}, this.scene);
		this.wombat.parent = this.botbody;
		this.wombat.position.y = 3.15;
		this.wombat.position.z = -3.75;
		this.wombat.isVisible = this.collidersVisible;
	}

	private buildBattery () {
		this.battery = Babylon.MeshBuilder.CreateBox("battery", {width:9.4, depth:1.9, height:5}, this.scene);
		this.battery.parent = this.botbody;
		this.battery.position.x = 1.5;
		this.battery.position.y = 4.05;
		this.battery.position.z = -9.4;
		this.battery.isVisible = this.collidersVisible;
	}

	private buildCaster () {
		this.caster = Babylon.MeshBuilder.CreateSphere("caster", {segments:16, diameter:2.2}, this.scene);
		this.caster.parent = this.botbody;
		this.caster.position.y = -2.4;
		this.caster.position.z = -9;
		this.caster.isVisible = this.collidersVisible;
	}
	
	private buildArmServo () {
		this.armServo = Babylon.MeshBuilder.CreateBox("armServo", {width:3.7, depth:5.8, height:3.8}, this.scene);
		this.armServo.parent = this.botbody;
		this.armServo.position.x = 0.75;
		this.armServo.position.y = 3.35;
		this.armServo.position.z = 11;
		this.armServo.isVisible = this.collidersVisible;
	}

	private buildServoArmMotor () {
		this.servoArmMotor = Babylon.MeshBuilder.CreateCylinder("servoArmMotor",{height:1, diameter:1.1}, this.scene);
		this.servoArmMotor.rotate(Babylon.Axis.Z, -Math.PI/2);
		this.servoArmMotor.position.x = -1.1;
		this.servoArmMotor.position.y = 7.6;
		this.servoArmMotor.position.z = -0.33;
		this.servoArmMotor.isVisible = this.collidersVisible;
	}

	private buildLiftArm () {
		this.liftArm = Babylon.MeshBuilder.CreateBox("liftArm", {width:1.5, depth:9, height:1}, this.scene);
		this.liftArm.parent = this.servoArmMotor;
		this.liftArm.position.x = 0;
		this.liftArm.position.y = 0;
		this.liftArm.position.z = 4.5;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(0,1,0), -Math.PI*0.39);
		this.liftArm.isVisible = this.collidersVisible;
	}

	private buildClawServo () {
		this.armServo = Babylon.MeshBuilder.CreateBox("clawServo", {width:4.6, depth:6.6, height:3.8}, this.scene);
		this.armServo.parent = this.servoArmMotor;
		this.armServo.position.x = -0.3;
		this.armServo.position.y = 1.8;
		this.armServo.position.z = 9.3;
		this.armServo.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(0,1,0), -Math.PI*0.39);
		this.armServo.isVisible = this.collidersVisible;
	}

	private buildStaticClawP1 () {
		this.liftArm = Babylon.MeshBuilder.CreateBox("staticClawP1", {width:0.9, depth:5, height:0.7}, this.scene);
		this.liftArm.parent = this.servoArmMotor;
		this.liftArm.position.x = -2.4
		this.liftArm.position.y = 0.3;
		this.liftArm.position.z = 11;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(0,1,0), -Math.PI*0.39);
		this.liftArm.isVisible = this.collidersVisible;
	}

	private async buildStaticClawP2 () {
		this.liftArm = Babylon.MeshBuilder.CreateBox("staticClawP2", {width:0.85, depth:5.5, height:0.7}, this.scene);
		this.liftArm.parent = this.servoArmMotor;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(1,0,0), Math.PI*0.295);
		this.liftArm.position.x = -3.25;
		this.liftArm.position.y = -1.6;
		this.liftArm.position.z = 15;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(0,1,0), -Math.PI*0.39);
		this.liftArm.isVisible = this.collidersVisible;
	}

	private async buildStaticClawP3 () {
		this.liftArm = Babylon.MeshBuilder.CreateBox("staticClawP2", {width:0.85, depth:2.19, height:0.7}, this.scene);
		this.liftArm.parent = this.servoArmMotor;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(1,0,0), Math.PI*0.295);
		this.liftArm.position.x = -2.4;
		this.liftArm.position.y = -0.4;
		this.liftArm.position.z = 14.075;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(0,1,0), -Math.PI*0.39);
		this.liftArm.isVisible = this.collidersVisible;
	}

	private async buildStaticClawP4 () {
		this.liftArm = Babylon.MeshBuilder.CreateBox("staticClawP2", {width:0.85, depth:2.69, height:0.7}, this.scene);
		this.liftArm.parent = this.servoArmMotor;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(1,0,0), Math.PI*0.05);
		this.liftArm.position.x = -3.25;
		this.liftArm.position.y = -3.7;
		this.liftArm.position.z = 17.6;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(0,1,0), -Math.PI*0.39);
		this.liftArm.isVisible = this.collidersVisible;
	}

	private async buildStaticClawP5 () {
		this.liftArm = Babylon.MeshBuilder.CreateBox("staticClawP2", {width:0.85, depth:2.09, height:0.7}, this.scene);
		this.liftArm.parent = this.servoArmMotor;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(1,0,0), -Math.PI*0.2);
		this.liftArm.position.x = -3.25;
		this.liftArm.position.y = -3.37;
		this.liftArm.position.z = 19.41;
		this.liftArm.rotateAround(new Babylon.Vector3(0,0,0), new Babylon.Vector3(0,1,0), -Math.PI*0.39);
		this.liftArm.isVisible = this.collidersVisible;
	}

	private buildWheels () {
		const wheelMaterial = new Babylon.StandardMaterial("wheel_mat", this.scene);
		this.wheel1 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, this.scene);
		this.wheel1.material = wheelMaterial;
		this.wheel1.position.x = 7.9;
		this.wheel1.position.y = 4.2;
		this.wheel1.position.z = -7.2;
		this.wheel1.rotation.z = Math.PI/2;
		this.wheel1.isVisible = this.collidersVisible;

		this.wheel2 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, this.scene);
		this.wheel2.material = wheelMaterial;
		this.wheel2.position.x = -7.9;
		this.wheel2.position.y = 4.2;
		this.wheel2.position.z = -7.2;
		this.wheel2.rotation.z = -Math.PI/2;
		this.wheel2.isVisible = this.collidersVisible;
	}

	public assignPhysicsImpostors () {
		this.liftArm.physicsImpostor = new Babylon.PhysicsImpostor(this.liftArm, Babylon.PhysicsImpostor.BoxImpostor, {mass: 2}, this.scene);
		this.servoArmMotor.physicsImpostor = new Babylon.PhysicsImpostor(this.servoArmMotor, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 0.1}, this.scene);
		
		this.caster.physicsImpostor = new Babylon.PhysicsImpostor(this.caster, Babylon.PhysicsImpostor.SphereImpostor, {mass: 20}, this.scene);
		this.wombat.physicsImpostor = new Babylon.PhysicsImpostor(this.wombat, Babylon.PhysicsImpostor.BoxImpostor, {mass: 250}, this.scene);
		this.battery.physicsImpostor = new Babylon.PhysicsImpostor(this.battery, Babylon.PhysicsImpostor.BoxImpostor, {mass: 150}, this.scene);
		
		this.armServo.physicsImpostor = new Babylon.PhysicsImpostor(this.armServo, Babylon.PhysicsImpostor.BoxImpostor, {mass: 15}, this.scene);
		this.wheel1.physicsImpostor = new Babylon.PhysicsImpostor(this.wheel1, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 5, friction: 10}, this.scene);
		this.wheel2.physicsImpostor = new Babylon.PhysicsImpostor(this.wheel2, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 5, friction: 10}, this.scene);
		this.botbody.physicsImpostor = new Babylon.PhysicsImpostor(this.botbody, Babylon.PhysicsImpostor.BoxImpostor, {mass: 150}, this.scene);
		this.can.physicsImpostor = new Babylon.PhysicsImpostor(this.can, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 10, friction: 5}, this.scene);

		this.botbody.physicsImpostor.addJoint(this.servoArmMotor.physicsImpostor, this.liftArm_joint);

		this.botbody.physicsImpostor.addJoint(this.wheel1.physicsImpostor,this.wheel1_joint);
		this.botbody.physicsImpostor.addJoint(this.wheel2.physicsImpostor,this.wheel2_joint);
	}

	public assignVisWheels (space: Space) {
		space.scene.getMeshByID('pw-mt11040').setParent(space.wheel1);
		space.scene.getMeshByID('black high gloss plastic').setParent(space.wheel1);
		space.scene.getMeshByID('matte rubber').setParent(space.wheel1);
		
		space.scene.getMeshByID('pw-mt11040.2').setParent(space.wheel2);
		space.scene.getMeshByID('black high gloss plastic.2').setParent(space.wheel2);
		space.scene.getMeshByID('matte rubber.2').setParent(space.wheel2);
	}

	public assignVisServoArm (space: Space) {
		// this.scene.getTransformNodeByID('1 x 5 Servo Horn-1').getChildMeshes().forEach(element => {
		// 	element.setParent(this.servoArmMotor);
		// });
		space.scene.getTransformNodeByID('1 x 5 Servo Horn-1').setParent(space.servoArmMotor);
	}

	public setMotors(m1:number, m2:number){
		this.motor1 = m1;
		this.motor2 = m2;
		
		this.wheel1_joint.setMotor(this.motor1);
		this.wheel2_joint.setMotor(this.motor2);
		this.liftArm_joint.setMotor(0);
		//console.log(this.liftArm.rotation)
		
		
		// if (this.counter == 10){
		// 	// console.log('Turning motors, here are values ' + m1 + ' ,' + m2);
		// 	// console.log('Setting physics motor to ' + this.motor1 + ' ,' + this.motor2);
		// 	console.log(this.liftArm.rotationQuaternion)
		// 	this.counter = 0;
		// }
		this.counter++;
		
	}
}
	