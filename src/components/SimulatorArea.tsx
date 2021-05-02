import * as React from 'react';

import * as Sim from '../Sim';
import { RobotState } from "../RobotState";
import { SurfaceState } from '../SurfaceState';

import { styled } from 'styletron-react';

export interface SimulatorAreaProps {
  robotState: RobotState;
  canEnabled: boolean[];
  shouldSetRobotPosition: boolean;
  isSensorNoiseEnabled: boolean;
  surfaceState: SurfaceState;

  onRobotStateUpdate: (robotState: Partial<RobotState>) => void;
  onRobotPositionSetCompleted: () => void;
}

const Container = styled('div', {
  flex: '1 1',
  position: 'relative',
  overflow: 'hidden'
});

const Canvas = styled('canvas', {
  position: 'absolute',
  ':focus': {
    outline: 'none'
  }
});

export class SimulatorArea extends React.Component<SimulatorAreaProps> {
  private containerRef_: HTMLDivElement;
  private canvasRef_: HTMLCanvasElement;

  space: Sim.Space;
  private oldIsSensorNoiseEnabled: boolean;
  
  constructor(props: SimulatorAreaProps) {
    super(props);
    this.state = {};
  }

  private run_ = false;

  componentDidMount() {
    this.space = new Sim.Space(this.canvasRef_, () => this.props.robotState, (robotState) => {
      this.props.onRobotStateUpdate(robotState);
    });
    
    this.space.createScene();
    this.space.loadMeshes().then(() => {
      this.space.startRenderLoop();
    }).catch((e) => {
      console.error('The simulator meshes failed to load', e);
    });

    // Start resize checker
    this.run_ = true;
    this.tick_();
  }

  private lastWidth_ = 0;
  private lastHeight_ = 0;

  private tick_ = () => {
    if (!this.run_) return;
    
    if (!this.containerRef_ || !this.canvasRef_) {
      requestAnimationFrame(this.tick_);
      return;
    }

    const { width, height } = this.containerRef_.getBoundingClientRect();

    if (this.lastHeight_ !== height || this.lastWidth_ !== width) {
      this.canvasRef_.style.width = `${width}px`;
      this.canvasRef_.style.height = `${height}px`;
      this.space.handleResize();
    }

    this.lastWidth_ = width;
    this.lastHeight_ = height;

    requestAnimationFrame(this.tick_);
  };

  componentWillUnmount() {
    this.run_ = false;
  }

  componentDidUpdate(prevProps: SimulatorAreaProps) {
    // Check if any cans were toggled
    this.props.canEnabled.forEach((enabled, i) => {
      if (enabled === prevProps.canEnabled[i]) return;
      this.setCanEnabled(i, enabled);
    });
    
    // Check if simulation settings were changed
    if (this.props.isSensorNoiseEnabled !== this.oldIsSensorNoiseEnabled) {
      this.oldIsSensorNoiseEnabled = this.props.isSensorNoiseEnabled;
      this.space.updateSensorOptions(this.props.isSensorNoiseEnabled);
    }

    // Check if board was reset
    if (this.props.surfaceState !== prevProps.surfaceState) {
      this.space.rebuildFloor(this.props.surfaceState);
      this.space.resetPosition();
    }

    // Checks if robot position needs to be set
    if (this.props.shouldSetRobotPosition && !prevProps.shouldSetRobotPosition) {
      this.space.resetPosition();
      this.props.onRobotPositionSetCompleted();
    }
  }

  private bindContainerRef_ = (ref: HTMLDivElement) => {
    this.containerRef_ = ref;
  };

  private bindCanvasRef_ = (ref: HTMLCanvasElement) => {
    this.canvasRef_ = ref;
  };

  private setCanEnabled(canNumber: number, isEnabled: boolean) {
    const canName = `Can${canNumber + 1}`;
    isEnabled
      ? this.space.createItem({ default: canName })
      : this.space.destroyItem(canName);
  }

  render() {
    return (
      <Container ref={this.bindContainerRef_}>
        <Canvas ref={this.bindCanvasRef_} />
      </Container>
    );
  }
}
