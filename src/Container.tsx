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

document.body.onload = () => {
		const canvas = document.getElementById('simview') as HTMLCanvasElement;
		const holder = document.getElementById('right') as HTMLDivElement;
		const engine = new Babylon.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
		const space = new Sim.Space();
		const scene = space.createScene(engine, canvas);
		engine.runRenderLoop(function(){
			scene.render();
		});
		
		canvas.addEventListener('resize', function(){
			engine.resize();
			console.log('Yay!');
		})
};


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

		//console.log('qwe')

		return (
			<section id="app">
				<App robot={state.robot} onRobotChange={this.onRobotChange_} />
			</section>
		)
	}
}

//All logic inside of index.tsx