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

class Collapsible extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false
		}
		this.togglePanel = this.togglePanel.bind(this);
	}

	togglePanel(e) {
		this.setState({ open: !this.state.open })
	}

	componentDidUpdate() {

	}

	render() {
		return (<div>
			<div onClick={(e) => this.togglePanel(e)} className='header'>
				{this.props.title}</div>
			{this.state.open ? (
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

	private onCheckBoxActivity = (checkboxItem, canItem: Babylon.InstancedMesh) => {
		canItem.setEnabled(document.getElementById(checkboxItem).checked);	
	}

	render() {
		const {
			props, state
		} = this

		document.body.onload = () => {
			const canvas = document.getElementById('simview') as HTMLCanvasElement;
			const engine = new Babylon.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
			this.space = new Sim.Space(engine, canvas);
			let counter = 0;
			let m1, m2, s1, s3;
			this.space.createScene();
			this.space.loadMeshes(this.space);
			// space.scene.executeWhenReady(function () {
			// 	space.assignVisServoArm();
			// 	space.assignVisWheels();
			// });

			this.space.scene.registerAfterRender(() => {
				m1 = WorkerInstance.DirectionalValues(WorkerInstance.registers[62], WorkerInstance.registers[63]) / 1500 * -2;
				m2 = WorkerInstance.DirectionalValues(WorkerInstance.registers[68], WorkerInstance.registers[69]) / 1500 * -2;
				this.space.setMotors(m1, m2);
				// space.setMotors(m1,m2);

				// if(this.registers_[61] == 0){
				// 	s1 = WorkerInstance.readServoRegister(WorkerInstance.registers[78], WorkerInstance.registers[79]);
				// 	s3 = WorkerInstance.readServoRegister(WorkerInstance.registers[80], WorkerInstance.registers[81]);
				// }
			});
			engine.runRenderLoop(() => {
				this.space.scene.render();
			})

			canvas.addEventListener('resize', function () {
				engine.resize();
				console.log('Yay!');
			})
		};

		return (
			<section id="app">
				<App robot={state.robot} onRobotChange={this.onRobotChange_} />
				<div>
					<Collapsible title="Cans">
						<div>
							<ul>
								<li>
									<input name="canOne" id="checkboxOne" type="checkbox" value="can1" onChange={() => this.onCheckBoxActivity("checkboxOne", this.space.can_1)}/>
									<label>Can 1</label>
								</li>
								<li>
									<input name="canTwo" id="checkboxTwo" type="checkbox" value="can2 " onChange={() => this.onCheckBoxActivity("checkboxTwo", this.space.can_2)} />
									<label>Can 2</label>
								</li>
								<li>
									<input name="canThree" id="checkboxThree" type="checkbox" value="can3 " onChange={() => this.onCheckBoxActivity("checkboxThree", this.space.can_3)} />
									<label>Can 3</label>
								</li>
							</ul>
						</div>
					</Collapsible>
				</div>
			</section>
		)
	}
}

//All logic inside of index.tsx