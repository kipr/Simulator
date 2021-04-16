import * as React from 'react';
import { SimulatorSidebar } from './SimulatorSidebar';
import WorkerInstance from '../WorkerInstance';
import { RobotState } from '../RobotState';
import { SimulatorArea } from './SimulatorArea';

interface RootState {
  robotState: RobotState,
  isCanEnabled: boolean[],
}
type Props = Record<string, never>;
type State = RootState;

export class Root extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      robotState: WorkerInstance.state,
      isCanEnabled: Array<boolean>(12).fill(false),
    };
  }

  componentDidMount(): void {
    WorkerInstance.onStateChange = (robotState: RobotState) => {
      this.setState({
        robotState,
      });
    };
  }

  private onRobotStateUpdate_ = (robot: Partial<RobotState>) => {
    // Create new robot state object by applying the partial changes
    const newRobotState: RobotState = {
      ...this.state.robotState,
      motorSpeeds: [...this.state.robotState.motorSpeeds],
      motorPositions: [...this.state.robotState.motorPositions],
      servoPositions: [...this.state.robotState.servoPositions],
      analogValues: [...this.state.robotState.analogValues],
      ...robot,
    };

    WorkerInstance.state = newRobotState;
  };

  private onCanChange_ = (canNumber: number, enabled: boolean) => {
    this.setState(prevState => {
      const isCanEnabled = [...prevState.isCanEnabled];
      isCanEnabled[canNumber] = enabled;
      return { isCanEnabled: isCanEnabled };
    });
  };

  render(): React.ReactNode {
    const { state } = this;

    return (
      <div id="main">
        <div id="root">
          <section id="app">
            <SimulatorSidebar robotState={state.robotState} isCanChecked={state.isCanEnabled} onRobotStateChange={this.onRobotStateUpdate_} onCanChange={this.onCanChange_} />
          </section>
        </div>
        <div id="right">
          <SimulatorArea robotState={state.robotState} canEnabled={state.isCanEnabled} onRobotStateUpdate={this.onRobotStateUpdate_} />
        </div>
      </div>
    );
  }
}

// All logic inside of index.tsx