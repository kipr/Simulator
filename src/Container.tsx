import * as React from 'react';
import { App } from './App';
import * as Sim from './Sim';
import WorkerInstance from './WorkerInstance';
import { RobotState } from './RobotState';
import * as Babylon from 'babylonjs';
import { SimulatorArea } from './SimulatorArea';

export interface ContainerProps { }
interface ContainerState {
	robot: RobotState
}
type Props = ContainerProps;
type State = ContainerState;

class Collapsible extends React.Component {
	private open;
	private title;
	constructor(props) {
		super(props);
		this.state = {
			open: this.open
		}
		this.togglePanel = this.togglePanel.bind(this);
	}

	togglePanel(e) {
		this.setState({open: !this.open});
		this.open = !this.open;
	}

	componentDidUpdate() {

	}

	render() {
		return (<div>
			<div onClick={(e) => this.togglePanel(e)} className='header'>Cans</div>
			{this.open ? (
				<div className='content'>
					{this.props.children}
				</div>
			) : null}
		</div>);
	}
}


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
	private space: Sim.Space = null;

	componentWillMount() {
		WorkerInstance.onStateChange = this.onStateChange
	}

	private onRobotChange_ = (robot: RobotState) => {
		WorkerInstance.state = robot;
	};

	private onCheckBoxActivity = (canName: string, canItem: number) => {
		const checkbox = document.getElementById(canName) as HTMLInputElement;
		//canItem.setEnabled(checkbox.checked);
		if(checkbox.checked){
			this.space.generateCans(canName, canItem)
		}
		else{
			//canItem.dispose();
			console.log(this.space.scene.getMeshByName(canName));
			this.space.scene.getMeshByName(canName).dispose();
		}
	}

	render() {
		const {
			props, state
		} = this

		// TODO: replacing this with SimulatorArea.tsx
		// document.body.onload = () => {
		// 	const canvas = document.getElementById('simview') as HTMLCanvasElement;
		// 	const engine = new Babylon.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
		// 	this.space = new Sim.Space(engine, canvas);
		// 	let counter = 0;
		// 	let m1, m2, s1, s3;
		// 	this.space.createScene();
		// 	this.space.loadMeshes(this.space);
		// 	// space.scene.executeWhenReady(function () {
		// 	// 	space.assignVisServoArm();
		// 	// 	space.assignVisWheels();
		// 	// });

		// 	this.space.scene.registerAfterRender(() => {
		// 		m1 = WorkerInstance.DirectionalValues(WorkerInstance.registers[62], WorkerInstance.registers[63]) / 1500 * -2;
		// 		m2 = WorkerInstance.DirectionalValues(WorkerInstance.registers[68], WorkerInstance.registers[69]) / 1500 * -2;
		// 		this.space.setMotors(m1, m2);
		// 		// space.setMotors(m1,m2);

		// 		// if(this.registers_[61] == 0){
		// 		// 	s1 = WorkerInstance.readServoRegister(WorkerInstance.registers[78], WorkerInstance.registers[79]);
		// 		// 	s3 = WorkerInstance.readServoRegister(WorkerInstance.registers[80], WorkerInstance.registers[81]);
		// 		// }
		// 	});
		// 	engine.runRenderLoop(() => {
		// 		this.space.scene.render();
		// 	})

		// 	canvas.addEventListener('resize', function () {
		// 		engine.resize();
		// 		//console.log('Yay!');
		// 	})
		// };

		return (
			<div id="main">
				<div id="root">
					<section id="app">
						<App robot={state.robot} onRobotChange={this.onRobotChange_} />
						<div>
							<Collapsible>
								<div>
									<ul>
										<li>
											<input name="canOne" id="checkboxOne" type="checkbox" value="can1" onChange={() => this.onCheckBoxActivity("checkboxOne", 1)}/>
											<label>Can 1</label>
										</li>
										<li>
											<input name="canTwo" id="checkboxTwo" type="checkbox" value="can2" onChange={() => this.onCheckBoxActivity("checkboxTwo", 2)} />
											<label>Can 2</label>
										</li>
										<li>
											<input name="canThree" id="checkboxThree" type="checkbox" value="can3" onChange={() => this.onCheckBoxActivity("checkboxThree", 3)} />
											<label>Can 3</label>
										</li>
										<li>
											<input name="canFour" id="checkboxFour" type="checkbox" value="can4" onChange={() => this.onCheckBoxActivity("checkboxFour", 4)}/>
											<label>Can 4</label>
										</li>
										<li>
											<input name="canFive" id="checkboxFive" type="checkbox" value="can5" onChange={() => this.onCheckBoxActivity("checkboxFive", 5)} />
											<label>Can 5</label>
										</li>
										<li>
											<input name="canSix" id="checkboxSix" type="checkbox" value="can6" onChange={() => this.onCheckBoxActivity("checkboxSix", 6)} />
											<label>Can 6</label>
										</li>
										<li>
											<input name="canSeven" id="checkboxSeven" type="checkbox" value="can7" onChange={() => this.onCheckBoxActivity("checkboxSeven", 7)}/>
											<label>Can 7</label>
										</li>
										<li>
											<input name="canEight" id="checkboxEight" type="checkbox" value="can8" onChange={() => this.onCheckBoxActivity("checkboxEight", 8)} />
											<label>Can 8</label>
										</li>
										<li>
											<input name="canNine" id="checkboxNine" type="checkbox" value="can9" onChange={() => this.onCheckBoxActivity("checkboxNine", 9)} />
											<label>Can 9</label>
										</li>
										<li>
											<input name="canTen" id="checkboxTen" type="checkbox" value="can10" onChange={() => this.onCheckBoxActivity("checkboxTen", 10)}/>
											<label>Can 10</label>
										</li>
										<li>
											<input name="canEleven" id="checkboxEleven" type="checkbox" value="can11" onChange={() => this.onCheckBoxActivity("checkboxEleven", 11)} />
											<label>Can 11</label>
										</li>
										<li>
											<input name="canTwelve" id="checkboxTwelve" type="checkbox" value="can12 " onChange={() => this.onCheckBoxActivity("checkboxTwelve", 12)} />
											<label>Can 12</label>
										</li>
									</ul>
								</div>
							</Collapsible>
						</div>
					</section>
				</div>
				<div id="right">
					<SimulatorArea />
				</div>
			</div>
		)
	}
}

//All logic inside of index.tsx