import * as React from 'react';
import * as THREE from 'three';
import { App } from './App';
import { Visualizer } from './Visualizer';
import { Static } from './Static';
import * as Sim from './Sim';
import WorkerInstance from './WorkerInstance';
import { RobotState } from './RobotState';
import * as Detector from './detector';
import * as Stats from './stats.min';

export interface ContainerProps{}
interface ContainerState{
    robot: RobotState
}
type Props = ContainerProps;
type State = ContainerState;

//const sim = new Sim;
//sim.main();
window.onload = () => {
	const elem = document.getElementById('container');
	elem.innerHTML = "";

	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	} else {
		const engine = new Sim.Engine(elem, 0xBFD1E5);
		engine.enableShadows();

		// CAMERA
		{
			let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.2, 1000);
			engine.setCamera(camera);
		}

		// DIRECTIONAL LIGHT
		{
			let light = new THREE.DirectionalLight(0xffffff, 1);
			light.castShadow = true;
			light.position.set(50, 100, 50);
			const d = 100;
			light.shadow.camera.left = -d;
			light.shadow.camera.right = d;
			light.shadow.camera.top = d;
			light.shadow.camera.bottom = -d;
			light.shadow.camera.near = 2;
			light.shadow.camera.far = 500;
			light.shadow.mapSize.x = 4096;
			light.shadow.mapSize.y = 4096;
			engine.addLight(light);
		}

		// AMBIENT LIGHT
		{
			let ambientLight = new THREE.AmbientLight(0x606060);
			engine.addLight(ambientLight);
		}

		const factory = new Sim.ShapeFactory(engine);

		const textureLoader = new THREE.TextureLoader();

		// GROUND
		{
			const pos = new THREE.Vector3(0, -0.5, 0);
			const quat = new THREE.Quaternion(0, 0, 0, 1);
			const ground = factory.createParalellepiped(100, 1, 100, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
			ground.castShadow = true;
			ground.receiveShadow = true;
			textureLoader.load("img/cement.jpg", (texture) => {
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				texture.repeat.set(5, 5);
				ground.material[0].map = texture;
				ground.material[0].needsUpdate = true;
			});
			engine.addObject(ground);
		}

		// WALLS
		{
			let material = [
				new THREE.MeshPhongMaterial({ color: 0xB7B7B7 }),
				new THREE.MeshPhongMaterial({ color: 0xAAAAAA }),
				new THREE.MeshPhongMaterial({ color: 0xA4A4A4 }),
				new THREE.MeshPhongMaterial({ color: 0x979797 }),
				new THREE.MeshPhongMaterial({ color: 0x949494 }),
				new THREE.MeshPhongMaterial({ color: 0x909090 })
			];
			const brickMass = 20;
			factory.createWall_X_axis(brickMass, -9, 9, 15, -9, false, material);
			factory.createWall_X_axis(brickMass, -9, 9, 15, 9, true, material);
			factory.createWall_Z_axis(brickMass, -8.25, 8.25, 15, -9.75, true, material);
			factory.createWall_Z_axis(brickMass, -8.25, 8.25, 15, 11.25, false, material);

			textureLoader.load("img/brick.jpg", (texture) => {
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				for (let i = 0; i < material.length; i++) {
					material[i].map = texture;
					material[i].needsUpdate = true;
				}
			});
		}

		// CONTROLS
		const controls = new Sim.WASDControls(engine.getCamera());
		controls.getObject().position.set(40, 25, 40);
		controls.getObject().rotation.y = 0.75;
		controls.setPitchRotationX(-0.25);
		engine.addObject(controls.getObject());

		// MOUSE SHOOTER
		const mouseShooter = new Sim.MouseShooter(1.2, 10, factory, engine.getCamera());

		// HANDLE MOUSE CLICK
		window.addEventListener('mousedown', (event) => {
			let element = event.target as Element;
			//console.log(event.target);
			if (element.nodeName == 'A')
				return;
			else if (!controls.enabled) {
				Sim.lockPointer(controls);
			} else {
				mouseShooter.shoot();
			}
		}, false);

		// START THE ENGINE
		function animate() {
			requestAnimationFrame(animate);
			const deltaTime = engine.update(controls.enabled);
			controls.update(deltaTime);
		}
		animate();
	}
};


export class Container extends React.Component<Props, State> {
   constructor(props: Props, context?){
    super (props, context)
    this.state = {
        robot: WorkerInstance.state
    }
   } 
   private onStateChange = (state:RobotState) => {
    //console.log('state change'); 
    this.setState({
        robot: state
    });

   }
   
   componentWillMount() {
    WorkerInstance.onStateChange = this.onStateChange
   }

    private onRobotChange_ = (robot: RobotState) => {
        WorkerInstance.state = robot;
    };

   render(){
       const {
           props, state 
       }= this

       //console.log('qwe')

       return (
            <section id="app">
                <App robot= {state.robot} onRobotChange={this.onRobotChange_} />
            </section>
        )
   }
}

//All logic inside of index.tsx