import * as React from 'react';
import { App } from './App';
import * as Sim from './Sim';
import WorkerInstance from './WorkerInstance';
import { RobotState } from './RobotState';
import { SimulatorArea } from './SimulatorArea';

export interface ContainerProps { }
interface ContainerState {
	robot: RobotState,
	isCanEnabled: boolean[],
}
type Props = ContainerProps;
type State = ContainerState;

export class Container extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = {
			robot: WorkerInstance.state,
			isCanEnabled: Array<boolean>(12).fill(false),
		}
	}
	private onStateChange = (state: RobotState) => {
		//console.log('state change'); 
		this.setState({
			robot: state
		});

	}
	private space: Sim.Space = null;

	componentDidMount() {
		WorkerInstance.onStateChange = this.onStateChange;
	}

	private onRobotChange_ = (robot: RobotState) => {
		WorkerInstance.state = robot;
	};

	private onCanChange_ = (canNumber: number, enabled: boolean) => {
		this.setState(prevState => {
			let isCanEnabled = [...prevState.isCanEnabled];
			isCanEnabled[canNumber] = enabled;
			return { isCanEnabled: isCanEnabled };
		});
	}

	render() {
		const {
			props, state
		} = this

		return (
			<div id="main">
				<div id="root">
					<section id="app">
						<App robot={state.robot} isCanChecked={state.isCanEnabled} onRobotChange={this.onRobotChange_} onCanChange={this.onCanChange_} />
					</section>
				</div>
				<div id="right">
					<SimulatorArea canEnabled={state.isCanEnabled} />
				</div>
			</div>
		)
	}
}

//All logic inside of index.tsx