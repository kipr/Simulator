import * as React from 'react';
import { SimulatorSidebar } from './SimulatorSidebar';
import * as Sim from './Sim';
import WorkerInstance from './WorkerInstance';
import { RobotState } from './RobotState';
import { SimulatorArea } from './SimulatorArea';

export interface RootProps { }
interface RootState {
	robotState: RobotState,
	isCanEnabled: boolean[],
}
type Props = RootProps;
type State = RootState;

export class Root extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = {
			robotState: WorkerInstance.state,
			isCanEnabled: Array<boolean>(12).fill(false),
		}
	}

	componentDidMount() {
		WorkerInstance.onStateChange = (robotState: RobotState) => {
			this.setState({
				robotState,
			});
		};
	}

	private onRobotStateChange_ = (robot: RobotState) => {
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
						<SimulatorSidebar robotState={state.robotState} isCanChecked={state.isCanEnabled} onRobotStateChange={this.onRobotStateChange_} onCanChange={this.onCanChange_} />
					</section>
				</div>
				<div id="right">
					<SimulatorArea robotState={state.robotState} canEnabled={state.isCanEnabled} onRobotStateChange={this.onRobotStateChange_} />
				</div>
			</div>
		)
	}
}

//All logic inside of index.tsx