import * as THREE from 'three';
import * as Ammo from 'ammo-node';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Sim {
  public canvas = document.getElementById('sim') as HTMLCanvasElement;
  public renderer = new THREE.WebGLRenderer({canvas});
  public main () {
    
  
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-33, 100, 5);
  
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(-37, 0, -2);
    controls.update();
  
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('LightGrey');
  
    {
      const planeLength = 120;
      const planeWidth = 60;
  
      const loader = new THREE.TextureLoader();
      const texture = loader.load('static/Surface-A.png');
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
    //   const repeats = planeSize / 2;
    //   texture.repeat.set(repeats, repeats);
  
      const planeGeo = new THREE.PlaneBufferGeometry(planeLength, planeWidth);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(planeGeo, planeMat);
      mesh.rotation.x = Math.PI * -.5;
      scene.add(mesh);
    }
  
    {
      const skyColor = 0xB1E1FF;  // light blue
      const groundColor = 0xB97A20;  // brownish orange
      const intensity = 0.5;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      scene.add(light);
    }
  
    {
      const color = 0xFFFFFF;
      const intensity = 0.5;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(5, 10, 2);
      scene.add(light);
      scene.add(light.target);
    }
  
    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
      // const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
      const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
      const distance = sizeToFitOnScreen / Math.tan(halfFovY);
      // compute a unit vector that points in the direction the camera is now
      // in the xz plane from the center of the box
      const direction = (new THREE.Vector3())
          .subVectors(camera.position, boxCenter)
          .multiply(new THREE.Vector3(0, 0.3, 0.9))
          .normalize();
  
      // move the camera to a position distance units way from the center
      // in whatever direction the camera was from the center already
      camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  
      // pick some near and far values for the frustum that
      // will contain the box.
      camera.near = boxSize / 100;
      camera.far = boxSize * 100;
      
      camera.updateProjectionMatrix();
  
      // point the camera to look at the center of the box
      camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }

    function dumpObject(obj, lines = [], isLast = true, prefix = '') {
      const localPrefix = isLast ? '└─' : '├─';
      lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
      const newPrefix = prefix + (isLast ? '  ' : '│ ');
      const lastNdx = obj.children.length - 1;
      obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
      });
      return lines;
    }

    let wheels;
    {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load('static/Simulator_Demobot_Cleared.glb', (gltf) => {
        const root = gltf.scene;
        scene.add(root);

        wheels = root.getObjectByName('Servo_Wheel-1');
        console.log(wheels);
        console.log(dumpObject(root).join('\n'))
        //console.log(root.children[0].children[0].children[0].children[0].children);

  
        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);
  
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());
  
        // set the camera to frame the box
        frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
        gltf.scene.scale.set(1,1,1); // scale here
        gltf.scene.position.set(-37,0,-2);
        gltf.scene.rotateY(Math.PI/2);
        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();
      });
    }
  
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
  
    function render(time) {
        time *= 0.001;
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      if (wheels) {
        for (const wheel of wheels.children) {
          wheel.rotation.y = time;
        }
      }
  
      renderer.render(scene, camera);
  
      requestAnimationFrame(render);
    }
  
    requestAnimationFrame(render);
  }

}


export class Engine {
	private sim: Sim;

    private physicsWorld: Ammo.btDiscreteDynamicsWorld;
    private rigidBodies = new Array<THREE.Object3D>();
    private clock = new THREE.Clock();
    
    public constructor(sim: Sim){
		this.sim = sim;
		const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
		const overlappingPairCache = new Ammo.btAxisSweep3(new Ammo.btVector3(-1000,-1000,-1000), new Ammo.btVector3(1000,1000,1000));
		const solver = new Ammo.btSequentialImpulseConstraintSolver();

		this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration);
		this.physicsWorld.setGravity( new Ammo.btVector3(0, -9.8, 0));

    }

    public addPhysicsObject(object: THREE.Object3D, body: Ammo.btRigidBody, mass: number): void {
		object.userData.physicsBody = body;
		if (mass > 0) {
			this.rigidBodies.push(object);
			body.setActivationState(4); // Disable deactivation
		}
		this.sim.constructor().scene.add(object);
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

	public update(isPhysicsEnabled: boolean): number {
		const deltaTime = this.clock.getDelta();
		isPhysicsEnabled && this.updatePhysics(deltaTime);
		Sim.main().renderer.render(this.sim.scene, this.sim.camera);
		return deltaTime;
	}
}

export class ShapeFactory {

	private engine: Engine;

	constructor(engine: Engine) {
		this.engine = engine;
	}

	private createRigidBody(threeObject: THREE.Object3D, physicsShape: Ammo.btConvexShape, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion): void {
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
}
