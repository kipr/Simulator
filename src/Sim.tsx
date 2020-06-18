import * as THREE from 'three';
import * as Ammo from 'ammo.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as Babylon from 'babylonjs';

export class Space {
	public createScene(engine: Babylon.Engine, canvas: HTMLCanvasElement): Babylon.Scene {
		const scene = new Babylon.Scene(engine);

		const camera = new Babylon.UniversalCamera("botcam", new Babylon.Vector3(0,5,-10), scene);
		camera.setTarget(Babylon.Vector3.Zero());
		camera.attachControl(canvas, true);

		const light = new Babylon.HemisphericLight("botlight", new Babylon.Vector3(0,1,0), scene);
		light.intensity = 0.7;

		var sphere = Babylon.Mesh.CreateSphere("sphere1", 16, 2, scene);
		sphere.position.y = 3;

		var ground = Babylon.Mesh.CreateGround("mat", 6, 6, 2, scene);

		return scene;
	}
}
	/*
	private renderer: THREE.WebGLRenderer;
	private light: THREE.Light;
	private controls: OrbitControls;

	private scene = new THREE.Scene();
	private clock = new THREE.Clock();
	private physicsWorld: Ammo.btDiscreteDynamicsWorld;
	private rigidBodies = new Array<THREE.Object3D>();

	private parentElement = document.getElementById('right') as HTMLDivElement;
	private canvas = document.getElementById('simview') as HTMLCanvasElement;

	private camera = new THREE.PerspectiveCamera(60, this.parentElement.clientWidth / this.parentElement.clientHeight, 0.2, 5000);
	
	public constructor() {
		this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
		this.renderer.setClearColor(0xBFD1E5);//clearcolor
		//this.renderer.setPixelRatio(this.canvas.
		this.renderer.setSize(this.parentElement.clientWidth, this.parentElement.clientHeight);
		this.camera.position.set( 0, 30, 70 );
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		// this.renderer.domElement.id = 'simview';
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		// element.appendChild(this.renderer.domElement);		

		// Physics configuration
		const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
		const overlappingPairCache = new Ammo.btAxisSweep3(new Ammo.btVector3(-1000,-1000,-1000), new Ammo.btVector3(1000,1000,1000));
		const solver = new Ammo.btSequentialImpulseConstraintSolver();

		this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration);
		this.physicsWorld.setGravity( new Ammo.btVector3(0, -9.8, 0));
	}
	

	public enableShadows(): void {
		this.renderer.shadowMap.enabled = true;
	}

	public setCamera(): void {
		window.addEventListener('resize', () => {
			this.camera.aspect = this.parentElement.clientWidth / this.parentElement.clientHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(this.parentElement.clientWidth, this.parentElement.clientHeight);
		}, false);
	}

	public getCamera(): THREE.PerspectiveCamera {
		return this.camera;
	}

	public getRenderer(): THREE.WebGLRenderer {
		return this.renderer;
	}

	public getControls(): OrbitControls {
		return this.controls;
	}

	public getScene(): THREE.Scene {
		return this.scene;
	}

	public getPhysicsWorld(): Ammo.btDiscreteDynamicsWorld {
		return this.physicsWorld;
	}

	public addLight(light: THREE.Light): void {
		this.light = light;
		this.scene.add(this.light);
	}

	public addObject(object: THREE.Object3D): void {
		this.scene.add(object);
	}

	public addPhysicsObject(object: THREE.Object3D, body: Ammo.btRigidBody, mass: number): void {
		object.userData.physicsBody = body;
		if (mass > 0) {
			this.rigidBodies.push(object);
			body.setActivationState(4); // Disable deactivation
		}
		this.scene.add(object);
		this.physicsWorld.addRigidBody(body);
	}


	private tempTransform = new Ammo.btTransform();

	private updatePhysics(delta: number) {
		// Step world
		this.physicsWorld.stepSimulation(delta, 10);

		// Update rigid bodies
		const len = this.rigidBodies.length;
		for (let i = 0; i < len; i++) {
			var objThree = this.rigidBodies[i];
			var ms = objThree.userData.physicsBody.getMotionState();
			if (ms) {
				ms.getWorldTransform(this.tempTransform);

				let p = this.tempTransform.getOrigin();
				objThree.position.set(p.x(), p.y(), p.z());

				let q = this.tempTransform.getRotation();
				objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
			}
		}
	}

	public update(isPhysicsEnabled: boolean){
		let deltaTime = this.clock.getDelta();
		this.renderer.render(this.scene, this.camera);
		this.physicsWorld.isPhysicsEnabled && this.updatePhysics(deltaTime);
		this.controls.update();
	}
}

//-------------------------------------------------------------------

export class ShapeFactory {

	private engine: Engine;

	constructor(engine: Engine) {
		this.engine = engine;
	}

	private createRigidBody(threeObject: THREE.Object3D, physicsShape: Ammo.btCylinderShape, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion): void {
		var transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
		transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
		const motionState = new Ammo.btDefaultMotionState(transform);

		const localInertia = new Ammo.btVector3(0, 0, 0);
		physicsShape.calculateLocalInertia(mass, localInertia);

		var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
		var body = new Ammo.btRigidBody(rbInfo);

		this.engine.addPhysicsObject(threeObject, body, mass);
	}

	/*public createParalellepiped(sx: number, sy: number, sz: number, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion, material: THREE.Material): THREE.Mesh {
		let threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
		threeObject.position.copy(pos);
		threeObject.quaternion.copy(quat);
		let shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
		shape.setMargin(0.05);

		this.createRigidBody(threeObject, shape, mass, pos, quat);
		return threeObject;
	}

	public createSphere(radius: number, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion, material: THREE.Material): THREE.Mesh {
		var threeObject = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 16), material);
		threeObject.position.copy(pos);
		threeObject.quaternion.copy(quat);
		let shape = new Ammo.btSphereShape(radius);
		shape.setMargin(0.05);

		this.createRigidBody(threeObject, shape, mass, pos, quat);
		return threeObject;
	}

	public createGround(){
    
		let pos = {x: 0, y: 0, z: 0};
		let scale = {x: 100, y: 0.5, z: 50};
		let quat = {x: 0, y: 0, z: 0, w: 1};
		let mass = 0;
		const planeLength = 120;
      	const planeWidth = 60;

		const loader = new THREE.TextureLoader();
		const texture = loader.load('static/Surface-A.png');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;

		const planeGeo = new THREE.PlaneBufferGeometry(planeLength, planeWidth);

		const planeMat = new THREE.MeshPhongMaterial({
			map: texture,
			side: THREE.DoubleSide,
			color: 0xa0afa4,
		});
	
		//threeJS Section
		let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), planeMat);
	
		blockPlane.position.set(pos.x, pos.y, pos.z);
		blockPlane.scale.set(scale.x, scale.y, scale.z);
	
		blockPlane.castShadow = true;
		blockPlane.receiveShadow = true;
	
		this.engine.getScene().add(blockPlane);
	
	
		//Ammojs Section
		let transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
		transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
		let motionState = new Ammo.btDefaultMotionState( transform );
	
		let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
		colShape.setMargin( 0.01 );
	
		let localInertia = new Ammo.btVector3( 0, 0, 0 );
		colShape.calculateLocalInertia( mass, localInertia );
	
		let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
		let body = new Ammo.btRigidBody( rbInfo );
	
	
		this.engine.getPhysicsWorld().addRigidBody( body );
	}

	public geomMeshConvert(geom: any) {
		//console.log(geom);

	}

	public wheels1;
	public wheels2;

	//
	public getRobot(): void {
		let root;
		var glTFGeometry = new THREE.BufferGeometry();
		const gltfLoader = new GLTFLoader();
		gltfLoader.load('static/Simulator_Demobot.glb', (gltf) => {
			root = gltf.scene;
			
			glTFGeometry = root.children[0].children[0].children[0].children[0];
			//console.log(glTFGeometry);

			//let btShapes = new Ammo.btBvhTriangleMeshShape(mesh.children, true, true);
			//console.log(mesh);
			//console.log(btShapes);
			//this.createRigidBody(mesh, btShapes, 3, new THREE.Vector3( -30, 1, 0 ), new THREE.Quaternion(0,0,0,1));
			//console.log(root.children[0].children[0].children[0].children[0].children[0]);
			this.engine.getScene().add(root);
			//this.engine.getScene().add(mesh);
			//this.engine.addObject(root);

			this.wheels1 = root.getObjectByName('Servo_Wheel-1');
			this.wheels2 = root.getObjectByName('Servo_Wheel-2');
			console.log(this.wheels1);
			this.createRigidBody(this.wheels1, new Ammo.btCylinderShape(new Ammo.btVector3(10,10,2)), 10, this.wheels1.position, this.wheels1.quaternion);
			
			// if (this.wheels1) {
			// 	for (const wheel of this.wheels1.children) {
			// 		console.log(wheel);
			// 		this.createRigidBody(this.wheels1, new Ammo.btCylinderShape(new Ammo.btVector3(wheel.geometry.boundingSphere.radius, wheel.geometry.boundingSphere.radius, (wheel.geometry.boundingBox.max.y-wheel.geometry.boundingBox.min.y)/2)), 10, wheel.position, wheel.quaternion);
			// 	}
			// }
			
			//this.createRigidBody(this.wheels1, new Ammo.btBvhTriangleMeshShape(this.wheels1.children), 10, this.wheels1.children.position, this.wheels1.children.quaternion);

			gltf.scene.scale.set(0.75,0.75,0.75); // scale here
			gltf.scene.position.set(-30,1,0);
			gltf.scene.rotateY(Math.PI/2);

		});
		this.geomMeshConvert(glTFGeometry);
	}
}*/