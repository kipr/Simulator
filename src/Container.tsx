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
			const holder = document.getElementById('right') as HTMLDivElement;
			const engine = new Babylon.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
			const space = new Sim.Space(engine, canvas);
			space.createScene();
			engine.runRenderLoop(function(){
				space.scene.executeWhenReady(function () {
					// space.scene.getMeshByID('pw-mt11040').rotationQuaternion = undefined;
					space.scene.getMeshByID('pw-mt11040').rotationQuaternion = space.wheel1.rotationQuaternion;
					space.scene.getMeshByID('black high gloss plastic').rotationQuaternion = space.wheel1.rotationQuaternion;
					space.scene.getMeshByID('matte rubber').rotationQuaternion = space.wheel1.rotationQuaternion;

					space.scene.getMeshByID('pw-mt11040.2').rotationQuaternion = space.wheel2.rotationQuaternion;
					space.scene.getMeshByID('black high gloss plastic.2').rotationQuaternion = space.wheel2.rotationQuaternion;
					space.scene.getMeshByID('matte rubber.2').rotationQuaternion = space.wheel2.rotationQuaternion;
				});
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