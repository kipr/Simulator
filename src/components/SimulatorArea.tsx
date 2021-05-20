import * as React from 'react';

import * as Sim from '../Sim';
import { RobotState } from "../RobotState";

interface SimulatorAreaProps {
  robotState: RobotState;
  canEnabled: boolean[];
  shouldSetRobotPosition: boolean;
  isSensorNoiseEnabled: boolean;

  onRobotStateUpdate: (robotState: Partial<RobotState>) => void;
  onRobotPositionSetCompleted: () => void;
}

export class SimulatorArea extends React.Component<SimulatorAreaProps> {
  canvas: HTMLCanvasElement;
  space: Sim.Space;
  private oldIsSensorNoiseEnabled: boolean;
  
  constructor(props: SimulatorAreaProps) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.space = new Sim.Space(this.canvas, () => this.props.robotState, (robotState) => {
      this.props.onRobotStateUpdate(robotState);
    });

    // Resize Babylon engine when canvas is resized
    this.canvas.addEventListener('resize', () => {
      this.space.handleResize();
    });
    
    this.space.createScene();
    this.space.loadMeshes()
      .then(() => {
        this.space.startRenderLoop();
      })
      .catch((e) => {
        console.error('The simulator meshes failed to load', e);
      });
  }

  componentDidUpdate(prevProps: SimulatorAreaProps): void {
    // Check if any cans were toggled
    this.props.canEnabled.forEach((enabled, i) => {
      if (enabled !== prevProps.canEnabled[i]) {
        this.setCanEnabled(i, enabled);
      }
    });
    
    // Check if simulation settings were changed
    if(this.props.isSensorNoiseEnabled != this.oldIsSensorNoiseEnabled){
      this.oldIsSensorNoiseEnabled=this.props.isSensorNoiseEnabled;
      this.space.updateSensorOptions(this.props.isSensorNoiseEnabled);
    }

    // Checks if robot position needs to be set
    if (this.props.shouldSetRobotPosition && !prevProps.shouldSetRobotPosition) {
      this.space.resetPosition();
      this.props.onRobotPositionSetCompleted();
    }
  }

  private setCanvasRef = (c: HTMLCanvasElement) => {
    if (c !== null) {
      this.canvas = c;
    }
  };

  private setCanEnabled(canNumber: number, isEnabled: boolean) {
    isEnabled
      ? this.space.createCan(canNumber + 1)
      : this.space.destroyCan(canNumber + 1);
  }

  render(): React.ReactNode {
    return (
      <canvas ref={this.setCanvasRef} id="simview" />
    );
  }
}
