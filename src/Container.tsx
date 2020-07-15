import * as React from 'react';
import { App } from './App';
import * as Sim from './Sim';
import WorkerInstance from './WorkerInstance';
import { RobotState } from './RobotState';
import * as Babylon from 'babylonjs';

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
			const engine = new Babylon.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
			const space = new Sim.Space(engine, canvas);
			let counter = 0;
			let m1, m2;
			space.createScene();

			space.scene.executeOnceBeforeRender(function () {
				const loader = Babylon.SceneLoader.ImportMesh("",'static/', 'Simulator_Demobot.glb', space.scene, function (meshes) {
					//space.botbody.addChild(meshes[0]);
					meshes[0].setParent(space.botbody);
					console.log(meshes[0].id);
					space.assignVisWheels();
				});
				//space.scene.getMeshByID('__root__') == null;
			});

			space.scene.registerBeforeRender(function () {
				m1 = WorkerInstance.DirectionalValues(WorkerInstance.registers[62], WorkerInstance.registers[63])/1500*-2;
				m2 = WorkerInstance.DirectionalValues(WorkerInstance.registers[68], WorkerInstance.registers[69])/1500*-2;
				space.setMotors(m1,m2);
			});
			engine.runRenderLoop(function(){
				space.scene.render();
			});
			
			canvas.addEventListener('resize', function(){
				engine.resize();
				console.log('Yay!');
			})
		};

		return (
			<section id="app">
				<App robot={state.robot} onRobotChange={this.onRobotChange_} />
			</section>
		)
	}
}

//All logic inside of index.tsx