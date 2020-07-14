import * as Babylon from 'babylonjs';
import 'babylonjs-loaders';
// import Oimo = require('babylonjs/Oimo');
import Ammo = require('./ammo');

export class Space {
	public engine: Babylon.Engine;
	public canvas: HTMLCanvasElement;
	public scene: Babylon.Scene;
	private ground: Babylon.Mesh;
	public wheel1: Babylon.Mesh;
	public wheel2: Babylon.Mesh;
	public botbody: Babylon.Mesh;
	public caster: Babylon.Mesh;
	public motor1: number;
	public motor2: number;
	// public can: Babylon.Mesh;

	private collidersVisible = false;

	constructor(engine: Babylon.Engine, canvas: HTMLCanvasElement) {
		this.engine = engine;
		this.canvas = canvas;
		this.scene = new Babylon.Scene(engine);
		this.motor1 = -2;
		this.motor2 = -2;
	}

	// public wheel1_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
	// 	mainPivot: new Babylon.Vector3(7.9,-0.2,5.1),//Point relative to the center of the base object
	// 	connectedPivot: new Babylon.Vector3(0,0,0),//Point relative to the center of the rotating object
	// 	mainAxis: new Babylon.Vector3(1,0,0),//Base object axis of rotation
	// 	connectedAxis: new Babylon.Vector3(0,-1,0)//Rotating object axis of rotation (don't forget about any rotations you may have made)
	// });
	public wheel1_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
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
	public wheel2_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
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

		this.scene.enablePhysics(new Babylon.Vector3(0,-9.8,0), new Babylon.AmmoJSPlugin(true, Ammo));

		this.buildGround();

		//Colliders

		this.buildBotBody();

		this.buildCaster();

		this.buildWheels();

		// this.can = Babylon.MeshBuilder.CreateCylinder("can",{height:10, diameter:6.8}, this.scene);
		// this.can.position.y = 30;

		this.assignPhysicsImpostors();
	}
	//Assigns set of meshes to new parent
	private meshChildrenTransfer (target: Babylon.Mesh, source: Babylon.AbstractMesh[]) {
		source.forEach(element => {
			console.log(element);
			target.addChild(element as Babylon.AbstractMesh);
		});
		console.log(target);
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
		this.botbody.position.y = 4.2;
		this.botbody.position.z = -12.3;
		this.botbody.isVisible = this.collidersVisible;
	}

	private buildCaster () {
		this.caster = Babylon.MeshBuilder.CreateSphere("caster", {segments:16, diameter:2.2}, this.scene);
		this.caster.parent = this.botbody;
		this.caster.position.y = -2.4;
		this.caster.position.z = -9;
		this.caster.isVisible = this.collidersVisible;
	}

	private buildWheels () {
		const wheelMaterial = new Babylon.StandardMaterial("wheel_mat", this.scene);
		this.wheel1 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, this.scene);
		this.wheel1.material = wheelMaterial;
		this.wheel1.position.x = 7.9;
		this.wheel1.position.y = 4;
		this.wheel1.position.z = -7.2;
		this.wheel1.rotation.z = Math.PI/2;
		this.wheel1.isVisible = this.collidersVisible;

		this.wheel2 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, this.scene);
		this.wheel2.material = wheelMaterial;
		this.wheel2.position.x = -7.9;
		this.wheel2.position.y = 4;
		this.wheel2.position.z = -7.2;
		this.wheel2.rotation.z = -Math.PI/2;
		this.wheel2.isVisible = this.collidersVisible;
	}

	private assignPhysicsImpostors () {
		this.caster.physicsImpostor = new Babylon.PhysicsImpostor(this.caster, Babylon.PhysicsImpostor.SphereImpostor, {mass: 10}, this.scene);
		this.wheel1.physicsImpostor = new Babylon.PhysicsImpostor(this.wheel1, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 5, friction: 10}, this.scene);
		this.wheel2.physicsImpostor = new Babylon.PhysicsImpostor(this.wheel2, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 5, friction: 10}, this.scene);
		this.botbody.physicsImpostor = new Babylon.PhysicsImpostor(this.botbody, Babylon.PhysicsImpostor.BoxImpostor, {mass: 50}, this.scene);
		// this.can.physicsImpostor = new Babylon.PhysicsImpostor(this.can, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 5}, this.scene);

		this.botbody.physicsImpostor.addJoint(this.wheel1.physicsImpostor,this.wheel1_joint);

		this.botbody.physicsImpostor.addJoint(this.wheel2.physicsImpostor,this.wheel2_joint);
		//console.log(this.scene.isPhysicsEnabled());
	}

	public assignVisWheels () {
		this.scene.getMeshByID('pw-mt11040').setParent(this.wheel1);
		this.scene.getMeshByID('black high gloss plastic').setParent(this.wheel1);
		this.scene.getMeshByID('matte rubber').setParent(this.wheel1);
		// this.scene.getMeshByID('pw-mt11040').position.setAll(0);
		// this.scene.getMeshByID('black high gloss plastic').position.setAll(0);
		// this.scene.getMeshByID('matte rubber').position.setAll(0);
		
		this.scene.getMeshByID('pw-mt11040.2').setParent(this.wheel2);
		this.scene.getMeshByID('black high gloss plastic.2').setParent(this.wheel2);
		this.scene.getMeshByID('matte rubber.2').setParent(this.wheel2);
		// this.scene.getMeshByID('pw-mt11040.2').position.setAll(0);
		// this.scene.getMeshByID('black high gloss plastic.2').position.setAll(0);
		// this.scene.getMeshByID('matte rubber.2').position.setAll(0);
	}
}
	