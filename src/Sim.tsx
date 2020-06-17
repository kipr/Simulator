import * as THREE from 'three';
import * as Ammo from 'ammo.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//import { AnimationBlendMode } from 'three';
import { type } from 'os';


export class Engine {
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

	public update(/*isPhysicsEnabled: boolean*/){
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
	}*/

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

	/*public createWall_X_axis(mass: number, startX: number, endX: number, yCount: number, z: number, shift: boolean, material: Array<THREE.Material>) {
		const quat = new THREE.Quaternion(0, 0, 0, 1);
		for (let y = 0; y <= yCount; y += 1.5) {
			let offsetX = shift? 1.5 : 0;
			shift = !shift;
			for (let x = startX; x <= endX; x += 3) {
				let pos = new THREE.Vector3(x + offsetX, y + 0.75, z);
				const materialIndex = Math.floor(Math.random() * material.length);
				let obstacle = this.createParalellepiped(3, 1.5, 1.5, mass, pos, quat, material[materialIndex]);
				obstacle.castShadow = true;
				obstacle.receiveShadow = true;
			}
		}
	}

	public createWall_Z_axis(mass: number, startZ: number, endZ: number, yCount: number, x: number, shift: boolean, material: Array<THREE.Material>) {
		const quat = new THREE.Quaternion(0, 0, 0, 1);
		quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 90 * Math.PI / 180);
		for (let y = 0; y <= yCount; y += 1.5) {
			let offsetZ = shift? 1.5 : 0;
			shift = !shift;
			for (let z = startZ; z <= endZ; z += 3) {
				let pos = new THREE.Vector3(x, y + 0.75, z + offsetZ);
				const materialIndex = Math.floor(Math.random() * material.length);
				let obstacle = this.createParalellepiped(3, 1.5, 1.5, mass, pos, quat, material[materialIndex]);
				obstacle.castShadow = true;
				obstacle.receiveShadow = true;
			}
		}
	}*/
}

//-------------------------------------------------------------------

/*export class WASDControls {

	private pitchObject: THREE.Object3D;
	private yawObject: THREE.Object3D;

	private moveForward = false;
	private moveBackward = false;
	private moveLeft = false;
	private moveRight = false;
	private rotateCCW = false;
	private rotateCW = false;

	enabled: boolean = false;
	private velocity = new THREE.Vector3(1,1,1);

	private static PI_2 = Math.PI / 2;

	public constructor(camera: THREE.Camera) {
		camera.rotation.set(0, 0, 0);
		this.pitchObject = new THREE.Object3D();
		this.pitchObject.add(camera);

		this.yawObject = new THREE.Object3D();
		this.yawObject.position.y = 10;
		this.yawObject.add(this.pitchObject);

		this.initEventListeners();
	}

	public getObject() {
		return this.yawObject;
	}

	public setPitchRotationX(x: number): void {
		this.pitchObject.rotation.x = x;
	}

	private initEventListeners(): void {
		document.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
		document.addEventListener('keydown', (event) => this.setMove(event.keyCode, true), false);
		document.addEventListener('keyup', (event) => this.setMove(event.keyCode, false), false);
	}

	private onMouseMove(event) {
		if (this.enabled === false) return;

		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		const factor = 0.001;
		this.yawObject.rotation.y -= movementX * factor;
		this.pitchObject.rotation.x -= movementY * factor;
		this.pitchObject.rotation.x = Math.max(-WASDControls.PI_2, Math.min(WASDControls.PI_2, this.pitchObject.rotation.x));
	};

	private setMove(keyCode:number, value: boolean): void {
		if (this.enabled === false) return;
		switch (keyCode) {
			case 87: // w
				this.moveForward = value;
				break;
			case 65: // a
				this.moveLeft = value;
				break;
			case 83: // s
				this.moveBackward = value;
				break;
			case 68: // d
				this.moveRight = value;
				break;
			case 81:
				this.rotateCCW = value;
				break;
			case 69:
				this.rotateCW = value;
				break;
		}
	}

	public update(delta: number): void {
		if (this.enabled === false) return;

		const factor = 10.0 * delta;
		this.velocity.x -= this.velocity.x * factor;
		this.velocity.y -= this.velocity.y * factor;
		this.velocity.z -= this.velocity.z * factor;

		const step = 400.0 * delta;
		if (this.moveForward) this.velocity.z -= step;
		if (this.moveBackward) this.velocity.z += step;
		if (this.moveLeft) this.velocity.x -= step;
		if (this.moveRight) this.velocity.x += step;
		if (this.rotateCCW) this.

		this.yawObject.translateX(this.velocity.x * delta);
		this.yawObject.translateZ(this.velocity.z * delta);
	}
}

//-------------------------------------------------------------------

export function lockPointer(controls: WASDControls) {
	const message = document.getElementById('message');
	const blocker = document.getElementById('blocker');
	const pointerlockerror = (event) => {
		document.addEventListener('keydown', (event) => {
			if (event.keyCode == 27) { // ESC
				controls.enabled = false;
				blocker.style.display = 'block';
				message.style.display = 'none';
			}
		}, false);
		message.innerHTML = document.getElementById('errorMessage').innerHTML;
		blocker.style.display = 'none';
		message.style.display = 'block';
		controls.enabled = true;
	};

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	if (havePointerLock) {
		const _body: any = document.getElementById('container');
		const _doc: any = document;
		_body.requestPointerLock = _body.requestPointerLock || _body.mozRequestPointerLock || _body.webkitRequestPointerLock;
		const pointerlockchange = (event) => {
			if (_doc.pointerLockElement === _body || _doc.mozPointerLockElement === _body || _doc.webkitPointerLockElement === _body) {
				controls.enabled = true;
				blocker.style.display = 'none';
				message.style.display = 'block';
			} else {
				controls.enabled = false;
				blocker.style.display = 'block';
				message.style.display = 'none';
			}
		};
		document.addEventListener('pointerlockchange', pointerlockchange, false);
		document.addEventListener('mozpointerlockchange', pointerlockchange, false);
		document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
		document.addEventListener('pointerlockerror', pointerlockerror, false);
		document.addEventListener('mozpointerlockerror', pointerlockerror, false);
		document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

		if (/Firefox/i.test(navigator.userAgent)) {
			var fullscreenchange = (event) => {
				if (_doc.fullscreenElement === _body || _doc.mozFullscreenElement === _body || _doc.mozFullScreenElement === _body) {
					_doc.removeEventListener('fullscreenchange', fullscreenchange);
					_doc.removeEventListener('mozfullscreenchange', fullscreenchange);
					_body.requestPointerLock();
					controls.enabled = true;
				} else
					controls.enabled = false;
			};
			_doc.addEventListener('fullscreenchange', fullscreenchange, false);
			_doc.addEventListener('mozfullscreenchange', fullscreenchange, false);
			_body.requestFullscreen = _body.requestFullscreen || _body.mozRequestFullscreen || _body.mozRequestFullScreen || _body.webkitRequestFullscreen;
			_body.requestFullscreen();
		} else {
			_body.requestPointerLock();
		}
	} else {
		pointerlockerror(null);
	}
}

//-------------------------------------------------------------------

export class MouseShooter {
	private radius: number;
	private mass: number;
	private factory: ShapeFactory;
	private camera: THREE.PerspectiveCamera;

	private pos = new THREE.Vector3();
	private screenCenter = new THREE.Vector2(0, 0);
	private raycaster = new THREE.Raycaster();
	private quat = new THREE.Quaternion(0, 0, 0, 1);
	private ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });

	public constructor(radius: number, mass: number, factory: ShapeFactory, camera: THREE.PerspectiveCamera) {
		this.radius = radius;
		this.mass = mass;
		this.factory = factory;
		this.camera = camera;
	}

	public shoot() {
		this.raycaster.setFromCamera(this.screenCenter, this.camera);

		this.pos.copy(this.raycaster.ray.direction);
		this.pos.add(this.raycaster.ray.origin);

		const ball = this.factory.createSphere(this.radius, this.mass, this.pos, this.quat, this.ballMaterial);
		ball.castShadow = true;
		ball.receiveShadow = true;

		const body = ball.userData.physicsBody;
		this.pos.copy(this.raycaster.ray.direction);
		this.pos.multiplyScalar(80);
		body.setLinearVelocity(new Ammo.btVector3(this.pos.x, this.pos.y, this.pos.z));
	}
}*/

//-------------------------------------------------------------------

// export class Sim {
//   public canvas = document.getElementById('sim') as HTMLCanvasElement;
//   public renderer = new THREE.WebGLRenderer({canvas: this.canvas});
//   public main () {
    
    
//     const fov = 45;
//     const aspect = 2;  // the canvas default
//     const near = 0.1;
//     const far = 100;
//     const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//     camera.position.set(-33, 100, 5);
  
//     const controls = new OrbitControls(camera, this.canvas);
//     controls.target.set(-37, 0, -2);
//     controls.update();
  
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color('LightGrey');

//     //-----------------AMMO Code---------------
//     let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
//         dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
//         overlappingPairCache    = new Ammo.btDbvtBroadphase(),
//         solver                  = new Ammo.btSequentialImpulseConstraintSolver();

//     let physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
//     physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
  
//     {
//       const planeLength = 120;
//       const planeWidth = 60;
  
//       const loader = new THREE.TextureLoader();
//       const texture = loader.load('static/Surface-A.png');
//       texture.wrapS = THREE.RepeatWrapping;
//       texture.wrapT = THREE.RepeatWrapping;
//       texture.magFilter = THREE.NearestFilter;
//     //   const repeats = planeSize / 2;
//     //   texture.repeat.set(repeats, repeats);
  
//       const planeGeo = new THREE.PlaneBufferGeometry(planeLength, planeWidth);
//       const planeMat = new THREE.MeshPhongMaterial({
//         map: texture,
//         side: THREE.DoubleSide,
//       });
//       const mesh = new THREE.Mesh(planeGeo, planeMat);
//       mesh.rotation.x = Math.PI * -.5;
//       scene.add(mesh);
//     }
  
//     {
//       const skyColor = 0xB1E1FF;  // light blue
//       const groundColor = 0xB97A20;  // brownish orange
//       const intensity = 0.5;
//       const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
//       scene.add(light);
//     }
  
//     {
//       const color = 0xFFFFFF;
//       const intensity = 0.5;
//       const light = new THREE.DirectionalLight(color, intensity);
//       light.position.set(5, 10, 2);
//       scene.add(light);
//       scene.add(light.target);
//     }
  
//     const frameArea = (sizeToFitOnScreen, boxSize, boxCenter, camera) => {
//       // const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
//       const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
//       const distance = sizeToFitOnScreen / Math.tan(halfFovY);
//       // compute a unit vector that points in the direction the camera is now
//       // in the xz plane from the center of the box
//       const direction = (new THREE.Vector3())
//           .subVectors(camera.position, boxCenter)
//           .multiply(new THREE.Vector3(0, 0.3, 0.9))
//           .normalize();
  
//       // move the camera to a position distance units way from the center
//       // in whatever direction the camera was from the center already
//       camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  
//       // pick some near and far values for the frustum that
//       // will contain the box.
//       camera.near = boxSize / 100;
//       camera.far = boxSize * 100;
      
//       camera.updateProjectionMatrix();
  
//       // point the camera to look at the center of the box
//       camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
//     }

//     let wheels1;
//     let wheels2;
//     {
//       const gltfLoader = new GLTFLoader();
//       gltfLoader.load('static/Simulator_Demobot_Cleared.glb', (gltf) => {
//         const root = gltf.scene;
//         scene.add(root);

//         wheels1 = root.getObjectByName('Servo_Wheel-1');
//         wheels2 = root.getObjectByName('Servo_Wheel-2');
//         console.log(wheels1);
//         //console.log(root.children[0].children[0].children[0].children[0].children);

  
//         // compute the box that contains all the stuff
//         // from root and below
//         const box = new THREE.Box3().setFromObject(root);
  
//         const boxSize = box.getSize(new THREE.Vector3()).length();
//         const boxCenter = box.getCenter(new THREE.Vector3());
  
//         // set the camera to frame the box
//         frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
//         gltf.scene.scale.set(1,1,1); // scale here
//         gltf.scene.position.set(-37,0,-2);
//         gltf.scene.rotateY(Math.PI/2);
//         // update the Trackball controls to handle the new size
//         controls.maxDistance = boxSize * 10;
//         controls.target.copy(boxCenter);
//         controls.update();
//       });
//     }
  
//     const resizeRendererToDisplaySize = (renderer) =>  {
//       const canvas = renderer.domElement;
//       const width = canvas.clientWidth;
//       const height = canvas.clientHeight;
//       const needResize = canvas.width !== width || canvas.height !== height;
//       if (needResize) {
//         renderer.setSize(width, height, false);
//       }
//       return needResize;
//     }
  
//     const render = (time) => {
//         time *= 0.001;
//       if (resizeRendererToDisplaySize(this.renderer)) {
//         const canvas = this.renderer.domElement;
//         camera.aspect = canvas.clientWidth / canvas.clientHeight;
//         camera.updateProjectionMatrix();
//       }

//       if (wheels1) {
//         for (const wheel of wheels1.children) {
//           wheel.rotation.y = -time;
//         }
//       }
//       if (wheels2) {
//         for (const wheel of wheels2.children) {
//           wheel.rotation.y = time;
//         }
//       }
  
//       this.renderer.render(scene, camera);
  
//       requestAnimationFrame(render);
//     }
  
//     requestAnimationFrame(render);
//   }

// }






//--------------------------------SIM Code Ends Here---------------------------------------------------------------------//
// export class Engine {
// 	private sim: Sim;

//     private physicsWorld: Ammo.btDiscreteDynamicsWorld;
//     private rigidBodies = new Array<THREE.Object3D>();
//     private clock = new THREE.Clock();
    
//     public constructor(sim: Sim){
// 		this.sim = sim;
// 		const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
// 		const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
// 		const overlappingPairCache = new Ammo.btAxisSweep3(new Ammo.btVector3(-1000,-1000,-1000), new Ammo.btVector3(1000,1000,1000));
// 		const solver = new Ammo.btSequentialImpulseConstraintSolver();

// 		this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration);
// 		this.physicsWorld.setGravity( new Ammo.btVector3(0, -9.8, 0));

//     }

//     public addPhysicsObject(object: THREE.Object3D, body: Ammo.btRigidBody, mass: number): void {
// 		object.userData.physicsBody = body;
// 		if (mass > 0) {
// 			this.rigidBodies.push(object);
// 			body.setActivationState(4); // Disable deactivation
// 		}
// 		this.sim.constructor().scene.add(object);
// 		this.physicsWorld.addRigidBody(body);
//     }
    
//     private tempTransform = new Ammo.btTransform();

// 	private updatePhysics(delta: number) {
// 		// Step world
// 		this.physicsWorld.stepSimulation(delta, 10);

// 		// Update rigid bodies
// 		const len = this.rigidBodies.length;
// 		for (let i = 0; i < len; i++) {
// 			var objThree = this.rigidBodies[i];
// 			var ms = objThree.userData.physicsBody.getMotionState();
// 			if (ms) {
// 				ms.getWorldTransform(this.tempTransform);

// 				let p = this.tempTransform.getOrigin();
// 				objThree.position.set(p.x(), p.y(), p.z());

// 				let q = this.tempTransform.getRotation();
// 				objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
// 			}
// 		}
// 	}

// 	public update(isPhysicsEnabled: boolean): number {
// 		const deltaTime = this.clock.getDelta();
// 		isPhysicsEnabled && this.updatePhysics(deltaTime);
// 		Sim.main().renderer.render(this.sim.scene, this.sim.camera);
// 		return deltaTime;
// 	}
// }

// export class ShapeFactory {

// 	private engine: Engine;

// 	constructor(engine: Engine) {
// 		this.engine = engine;
// 	}

// 	private createRigidBody(threeObject: THREE.Object3D, physicsShape: Ammo.btConvexShape, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion): void {
// 		var transform = new Ammo.btTransform();
// 		transform.setIdentity();
// 		transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
// 		transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
// 		const motionState = new Ammo.btDefaultMotionState(transform);

// 		const localInertia = new Ammo.btVector3(0, 0, 0);
// 		physicsShape.calculateLocalInertia(mass, localInertia);

// 		var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
// 		var body = new Ammo.btRigidBody(rbInfo);

// 		this.engine.addPhysicsObject(threeObject, body, mass);
// 	}
// }
