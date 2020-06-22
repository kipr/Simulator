import * as Babylon from 'babylonjs';
import 'babylonjs-loaders';
import Oimo = require('babylonjs/Oimo');
import Ammo = require('./ammo');

export class Space {
	public createScene(engine: Babylon.Engine, canvas: HTMLCanvasElement): Babylon.Scene {
		const scene = new Babylon.Scene(engine);

		const camera = new Babylon.ArcRotateCamera("botcam",10,10,10, new Babylon.Vector3(0,0,0), scene);
		camera.setTarget(Babylon.Vector3.Zero());
		camera.attachControl(canvas, true);

		const light = new Babylon.HemisphericLight("botlight", new Babylon.Vector3(0,1,0), scene);
		light.intensity = 0.7;

		// scene.enablePhysics(new Babylon.Vector3(0,-10,0), new Babylon.OimoJSPlugin(5, Oimo));
		scene.enablePhysics(new Babylon.Vector3(0,-10,0), new Babylon.AmmoJSPlugin(true, Ammo));


		const ground = Babylon.MeshBuilder.CreateGround("mat", {width:118, height:59, subdivisions:2}, scene);
		ground.rotate(new Babylon.Vector3(0,1,0),Math.PI/2);
		const material = new Babylon.StandardMaterial("mat-material", scene);
		material.ambientTexture = new Babylon.Texture('static/Surface-A.png',scene);
		ground.material = material;
		ground.physicsImpostor = new Babylon.PhysicsImpostor(ground, Babylon.PhysicsImpostor.BoxImpostor,{mass:0}, scene);
		// ground._freeze();

		//Colliders
		const collidersVisible = true;

		const botbody = Babylon.MeshBuilder.CreateBox("botbody", {width:12.3, depth:24.6, height:3}, scene);
		botbody.position.y = 4.2;
		botbody.position.z = -12.3;
		botbody.isVisible = collidersVisible;

		const caster = Babylon.MeshBuilder.CreateSphere("caster", {segments:16, diameter:2.2}, scene);
		caster.position.z = -21.3;
		caster.position.y = 1.8;
		caster.isVisible = collidersVisible;

		const wheel1 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, scene);
		wheel1.position.y = 4;
		wheel1.position.x = 7.9;
		wheel1.position.z = -7.2;
		wheel1.rotation.z = Math.PI/2;
		wheel1.isVisible = collidersVisible;

		const wheel2 = Babylon.MeshBuilder.CreateCylinder("wheel1",{height:0.7, diameter:6.8}, scene);
		wheel2.position.y = 4;
		wheel2.position.x = -7.9;
		wheel2.position.z = -7.2;
		wheel2.rotation.z = -Math.PI/2;
		wheel2.isVisible = collidersVisible;

		let physicsRoot = new Babylon.Mesh("",scene);
		
		
		const loader = Babylon.SceneLoader.ImportMesh("",'static/', 'Simulator_Demobot.glb', scene, function (meshes, particlesystems, skeletons) {
			const demobot = meshes[0];
			
			//Adding meshes to physics root
			scene.executeWhenReady(function (){
				caster.physicsImpostor = new Babylon.PhysicsImpostor(caster, Babylon.PhysicsImpostor.SphereImpostor, {mass: 2, friction: 0.5, restitution:1}, scene);
				wheel1.physicsImpostor = new Babylon.PhysicsImpostor(wheel1, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 2, friction: 0.5, restitution:1}, scene);
				wheel2.physicsImpostor = new Babylon.PhysicsImpostor(wheel2, Babylon.PhysicsImpostor.CylinderImpostor, {mass: 2, friction: 0.5, restitution:1}, scene);
				botbody.physicsImpostor = new Babylon.PhysicsImpostor(botbody, Babylon.PhysicsImpostor.BoxImpostor, {mass: 2, friction: 0.5, restitution:1}, scene);
				// physicsRoot.physicsImpostor = new Babylon.PhysicsImpostor(physicsRoot, Babylon.PhysicsImpostor.NoImpostor, {mass: 10, friction: 0.5, restitution:4}, scene);
				
				botbody.addChild(caster);
				botbody.addChild(wheel1);
				botbody.addChild(wheel2);
				meshes.forEach(element => {
					botbody.addChild(element);
				});
				//botbody				
				
				// physicsRoot.addChild(botbody);
				// physicsRoot.position.y = 10;

				// console.log(physicsRoot);
				
			});

			


		});
		scene.executeWhenReady(function () {

			//console.log(scene.getNodeByID("Simulator Demobot").uniqueId);
			//console.log(scene.getNodeByID("Simulator Demobot"));
		});
		// scene.getNodeByID("Simulator Demobot").
		// scene.getNodeByID("Simulator Demobot").uniqueId
		// scene.getTransformNodeByUniqueID(2365)
		return scene;
	}
}
	