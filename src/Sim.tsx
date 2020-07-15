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
	public wheel1: Babylon.Mesh;
	public wheel2: Babylon.Mesh;

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
	}

	// public wheel1_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
	// 	mainPivot: new Babylon.Vector3(7.9,-0.2,5.1),//Point relative to the center of the base object
	// 	connectedPivot: new Babylon.Vector3(0,0,0),//Point relative to the center of the rotating object
	// 	mainAxis: new Babylon.Vector3(1,0,0),//Base object axis of rotation
	// 	connectedAxis: new Babylon.Vector3(0,-1,0)//Rotating object axis of rotation (don't forget about any rotations you may have made)
	// });
	public wheel1_joint = new Babylon.PhysicsJoint(Babylon.PhysicsJoint.HingeJoint,{
		mainPivot: new Babylon.Vector3(7.9,-0.2,5.1),//Point relative to the center of the base object
		connectedPivot: new Babylon.Vector3(0,0,0),//Point relative to the center of the rotating object
		mainAxis: new Babylon.Vector3(1,0,0),//Base object axis of rotation
		connectedAxis: new Babylon.Vector3(0,-1,0)//Rotating object axis of rotation (don't forget about any rotations you may have made)
	});

	// public wheel2_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
	// 	mainPivot: new Babylon.Vector3(-7.9,-0.2,5.1),
	// 	connectedPivot: new Babylon.Vector3(0,0,0),
	// 	mainAxis: new Babylon.Vector3(1,0,0),
	// 	connectedAxis: new Babylon.Vector3(0,1,0)
	// });
	public wheel2_joint = new Babylon.PhysicsJoint(Babylon.PhysicsJoint.HingeJoint,{
		mainPivot: new Babylon.Vector3(-7.9,-0.2,5.1),
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

		// scene.enablePhysics(new Babylon.Vector3(0,-10,0), new Babylon.OimoJSPlugin(5, Oimo));
		this.scene.enablePhysics(new Babylon.Vector3(0,-9.8,0), new Babylon.AmmoJSPlugin(true, Ammo));


		const ground = Babylon.MeshBuilder.CreateGround("mat", {width:118, height:59, subdivisions:2}, this.scene);
		ground.rotate(new Babylon.Vector3(0,1,0),Math.PI/2);
		const material = new Babylon.StandardMaterial("mat-material", this.scene);
		material.ambientTexture = new Babylon.Texture('static/Surface-A.png',this.scene);
		ground.material = material;
		ground.physicsImpostor = new Babylon.PhysicsImpostor(ground, Babylon.PhysicsImpostor.BoxImpostor,{mass:0, friction: 2}, this.scene);

		//Colliders
		const collidersVisible = false;

		const botbody = Babylon.MeshBuilder.CreateBox("botbody", {width:12.3, depth:24.6, height:3}, this.scene);
		botbody.position.y = 4.2;
		botbody.position.z = -12.3;
		botbody.isVisible = collidersVisible;

		const loader = Babylon.SceneLoader.ImportMesh("",'static/', 'Simulator_Demobot.glb', this.scene, (meshes, particlesystems, skeletons) => {
			const demobot = meshes[0];
			
			//Adding meshes to physics root
			meshes.forEach(element => {
				botbody.addChild(element);
			});

			const etSensorMesh = this.scene.getMeshByID('black satin finish plastic');
			this.etSensorArm = new ETSensorBabylon(this.scene, etSensorMesh, new Babylon.Vector3(0.0, 0.02, 0.0), new Babylon.Vector3(0.02, 0.02, -0.015), { isVisible: true });
		});

		const caster = Babylon.MeshBuilder.CreateSphere("caster", {segments:16, diameter:2.2}, this.scene);
		caster.parent = botbody;
		caster.position.y = -2.4;
		caster.position.z = -9;
		caster.isVisible = collidersVisible;

		this.wheel1 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, this.scene);
		this.wheel1.position.x = 7.9;
		this.wheel1.position.y = 4;
		this.wheel1.position.z = -7.2;
		this.wheel1.rotation.z = Math.PI/2;
		this.wheel1.isVisible = collidersVisible;

		this.wheel2 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, this.scene);
		this.wheel2.position.x = -7.9;
		this.wheel2.position.y = 4;
		this.wheel2.position.z = -7.2;
		this.wheel2.rotation.z = -Math.PI/2;
		this.wheel2.isVisible = collidersVisible;

		// A cylinder positioned in front of the robot, for testing ET sensor
		// const canMesh = Babylon.MeshBuilder.CreateCylinder("can", { height: 8, diameter: 4 }, this.scene);
		// canMesh.position.z = 40;
		// canMesh.position.y = 4.5;
		// canMesh.physicsImpostor = new Babylon.PhysicsImpostor(canMesh, Babylon.PhysicsImpostor.CylinderImpostor, { mass: 5, friction: 0.5 }, this.scene);

		caster.physicsImpostor = new Babylon.PhysicsImpostor(caster, Babylon.PhysicsImpostor.SphereImpostor, {mass: 2, friction: 0.1}, this.scene);
		this.wheel1.physicsImpostor = new Babylon.PhysicsImpostor(this.wheel1, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 2, friction: 4}, this.scene);
		this.wheel2.physicsImpostor = new Babylon.PhysicsImpostor(this.wheel2, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 2, friction: 4}, this.scene);
		botbody.physicsImpostor = new Babylon.PhysicsImpostor(botbody, Babylon.PhysicsImpostor.BoxImpostor, {mass: 50, friction: 0}, this.scene);

		botbody.physicsImpostor.addJoint(this.wheel1.physicsImpostor,this.wheel1_joint);

		botbody.physicsImpostor.addJoint(this.wheel2.physicsImpostor,this.wheel2_joint);

		this.etSensorFake = new ETSensorBabylon(this.scene, botbody, new Babylon.Vector3(0, 0, 15), new Babylon.Vector3(0, 0, 15), { isVisible: true });

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

		//this.wheel1_joint.setMotor(2);
		//this.wheel2_joint.setMotor(1);
	}
}
	