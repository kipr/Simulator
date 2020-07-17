import * as React from 'react';
import { App } from './App';
import * as Sim from './Sim';
import WorkerInstance from './WorkerInstance';
import { RobotState } from './RobotState';
import * as Babylon from 'babylonjs';
import { ETSensorBabylon } from './sensors/etSensorBabylon';

export interface ContainerProps { }
interface ContainerState {
	robot: RobotState
}
type Props = ContainerProps;
type State = ContainerState;




export class Container extends React.Component<Props, State> {
	constructor(props: Props, context?) {
		super(props, context)
		this.state = {
			robot: WorkerInstance.state
		}
	}
	private onStateChange = (state: RobotState) => {
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

	render() {
		const {
			props, state
		} = this

		document.body.onload = () => {
			const canvas = document.getElementById('simview') as HTMLCanvasElement;
			// const holder = document.getElementById('right') as HTMLDivElement;
			const engine = new Babylon.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
			const space = new Sim.Space(engine, canvas);
			space.createScene();

			space.scene.executeOnceBeforeRender(function () {
				const loader = Babylon.SceneLoader.ImportMesh("",'static/', 'Simulator_Demobot.glb', space.scene, meshes => {
					meshes.forEach(element => {
						space.botbody.addChild(element);
					});

					const etSensorMesh = space.scene.getMeshByID('black satin finish plastic');
					space.etSensorArm = new ETSensorBabylon(space.scene, etSensorMesh, new Babylon.Vector3(0.0, 0.02, 0.0), new Babylon.Vector3(0.02, 0.02, -0.015), { isVisible: true });

					space.assignVisWheels();
				});
			});

			engine.runRenderLoop(function(){
				space.wheel1_joint.setMotor(state.robot.motor0_speed/100*space.motor1);
				space.wheel2_joint.setMotor(state.robot.motor3_speed/100*space.motor2);
				// const motorConv = Math.PI/4800;
				// const motor1speed = -motorConv*10;
				// const motor2speed = motorConv*10;
				
				// space.wheel1.rotate(Babylon.Axis.Y, motor1speed, Babylon.Space.LOCAL);
				// space.wheel2.rotate(Babylon.Axis.Y, motor2speed, Babylon.Space.LOCAL);
				// const fwdForceDir = new Babylon.Vector3(0,0,1);
				// const fwdForceApp = new Babylon.Vector3(0,0,5.1);
				//space.botbody.physicsImpostor.applyForce(fwdForceDir.scale(10), fwdForceApp)
				// space.wheel1.physicsImpostor.applyForce(fwdForceDir.scale(6), fwdForceApp);
				// space.wheel2.physicsImpostor.applyForce(fwdForceDir.scale(6), fwdForceApp);

				space.scene.render();
				//space.wheel1_joint.setMotor(state.robot.motor0_speed/500,state.robot.motor0_speed/500);
				//space.wheel2_joint.setMotor(state.robot.motor3_speed/500,state.robot.motor3_speed/500);
			});
			
			canvas.addEventListener('resize', function(){
				engine.resize();
				console.log('Yay!');
			})
		};
		//console.log('qwe')

		return (
			<section id="app">
				<App robot={state.robot} onRobotChange={this.onRobotChange_} />
			</section>
		)
	}
}

//All logic inside of index.tsx