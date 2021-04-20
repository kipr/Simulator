import React = require("react");

import * as Sim from '../Sim';
import { RobotState } from "../RobotState";

interface SimulatorAreaProps {
  robotState: RobotState;
  canEnabled: boolean[];

  onRobotStateChange: (robotState: RobotState) => void;
}

export class SimulatorArea extends React.Component<SimulatorAreaProps> {
  canvas: HTMLCanvasElement;
  space: Sim.Space;
  
  constructor(props: SimulatorAreaProps) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.space = new Sim.Space(this.canvas, () => this.props.robotState, (robotState) => {
      this.props.onRobotStateChange(robotState);
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
    // Checks to see if robot position has been set
    if (this.props.robotState.mesh !== prevProps.robotState.mesh) {
      this.setMeshEnabled(this.props.robotState.mesh);
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

  private setMeshEnabled(isEnabled: boolean) {
    isEnabled
      ? this.reloadMeshes()
      : this.space.destroyBot();
  }

  private reloadMeshes() {
    this.space.loadMeshes()
      .catch((e) => {
        console.error('The simulator meshes failed to load', e);
      });
  }

  render(): React.ReactNode {
    return (
      <canvas ref={this.setCanvasRef} id="simview" />
    );
  }
}