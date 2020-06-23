import * as Babylon from 'babylonjs';
import 'babylonjs-loaders';
// import Oimo = require('babylonjs/Oimo');
import Ammo = require('./ammo');

export class Space {
	public wheel1_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
		mainPivot: new Babylon.Vector3(7.9,-0.2,5.1),//Point relative to the center of the base object
		connectedPivot: new Babylon.Vector3(0,0,0),//Point relative to the center of the rotating object
		mainAxis: new Babylon.Vector3(1,0,0),//Base object axis of rotation
		connectedAxis: new Babylon.Vector3(0,-1,0)//Rotating object axis of rotation (don't forget about any rotations you may have made)
	});

	public wheel2_joint = new Babylon.MotorEnabledJoint(Babylon.PhysicsJoint.HingeJoint,{
		mainPivot: new Babylon.Vector3(-7.9,-0.2,5.1),
		connectedPivot: new Babylon.Vector3(0,0,0),
		mainAxis: new Babylon.Vector3(1,0,0),
		connectedAxis: new Babylon.Vector3(0,1,0)
	});
	public createScene(engine: Babylon.Engine, canvas: HTMLCanvasElement): Babylon.Scene {
		const scene = new Babylon.Scene(engine);

		const camera = new Babylon.ArcRotateCamera("botcam",10,10,10, new Babylon.Vector3(50,50,50), scene);
		camera.setTarget(Babylon.Vector3.Zero());
		camera.attachControl(canvas, true);

		const light = new Babylon.HemisphericLight("botlight", new Babylon.Vector3(0,1,0), scene);
		light.intensity = 0.7;

		// scene.enablePhysics(new Babylon.Vector3(0,-10,0), new Babylon.OimoJSPlugin(5, Oimo));
		scene.enablePhysics(new Babylon.Vector3(0,-9.8,0), new Babylon.AmmoJSPlugin(true, Ammo));


		const ground = Babylon.MeshBuilder.CreateGround("mat", {width:118, height:59, subdivisions:2}, scene);
		ground.rotate(new Babylon.Vector3(0,1,0),Math.PI/2);
		const material = new Babylon.StandardMaterial("mat-material", scene);
		material.ambientTexture = new Babylon.Texture('static/Surface-A.png',scene);
		ground.material = material;
		ground.physicsImpostor = new Babylon.PhysicsImpostor(ground, Babylon.PhysicsImpostor.BoxImpostor,{mass:0, friction: 2}, scene);

		//Colliders
		const collidersVisible = false;

		const botbody = Babylon.MeshBuilder.CreateBox("botbody", {width:12.3, depth:24.6, height:3}, scene);
		botbody.position.y = 4.2;
		botbody.position.z = -12.3;
		botbody.isVisible = collidersVisible;

		const loader = Babylon.SceneLoader.ImportMesh("",'static/', 'Simulator_Demobot.glb', scene, function (meshes, particlesystems, skeletons) {
			const demobot = meshes[0];
			
			//Adding meshes to physics root
			meshes.forEach(element => {
				botbody.addChild(element);
			});
		});

		const caster = Babylon.MeshBuilder.CreateSphere("caster", {segments:16, diameter:2.2}, scene);
		caster.parent = botbody;
		caster.position.y = -2.4;
		caster.position.z = -9;
		caster.isVisible = collidersVisible;

		const wheel1 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, scene);
		wheel1.position.x = 7.9;
		wheel1.position.y = 4;
		wheel1.position.z = -7.2;
		wheel1.rotation.z = Math.PI/2;
		wheel1.isVisible = collidersVisible;

		const wheel2 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, scene);
		wheel2.position.x = -7.9;
		wheel2.position.y = 4;
		wheel2.position.z = -7.2;
		wheel2.rotation.z = -Math.PI/2;
		wheel2.isVisible = collidersVisible;

		caster.physicsImpostor = new Babylon.PhysicsImpostor(caster, Babylon.PhysicsImpostor.SphereImpostor, {mass: 2, friction: 0.1, restitution:1}, scene);
		wheel1.physicsImpostor = new Babylon.PhysicsImpostor(wheel1, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 2, friction: 4, restitution:1}, scene);
		wheel2.physicsImpostor = new Babylon.PhysicsImpostor(wheel2, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 2, friction: 4, restitution:1}, scene);
		botbody.physicsImpostor = new Babylon.PhysicsImpostor(botbody, Babylon.PhysicsImpostor.BoxImpostor, {mass: 50, friction: 0, restitution:1}, scene);

		botbody.physicsImpostor.addJoint(wheel1.physicsImpostor,this.wheel1_joint);

		botbody.physicsImpostor.addJoint(wheel2.physicsImpostor,this.wheel2_joint);

		this.wheel1_joint.setMotor(1,-1.75);
		this.wheel2_joint.setMotor(1,-1.75);
		return scene;
	}
}
	