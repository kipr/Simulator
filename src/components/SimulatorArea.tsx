import * as React from 'react';

import * as Sim from '../Sim';
import { RobotState } from "../RobotState";
import { SurfaceState } from '../SurfaceState';

import { styled } from 'styletron-react';

import {
  Items,
} from '../items';
import resizeListener, { ResizeListener } from './ResizeListener';
import { Vector2 } from '../math';

export interface SimulatorAreaProps {
  robotState: RobotState;
  itemEnabled: boolean[];
  isSensorNoiseEnabled: boolean;
  surfaceState: SurfaceState;

  onRobotStateUpdate: (robotState: Partial<RobotState>) => void;
  // onRobotPositionSetCompleted: () => void;
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

  private oldIsSensorNoiseEnabled: boolean;
  
  constructor(props: SimulatorAreaProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // TODO: If simulator initialization fails, we should show the user an error
    Sim.Space.getInstance().ensureInitialized()
      .catch(e => console.error('Simulator initialization failed', e));
  }

  private lastWidth_ = 0;
  private lastHeight_ = 0;

  private defaultItemList = Object.keys(Items);

  private onSizeChange_ = (size: Vector2) => {
    if (this.lastHeight_ !== size.y || this.lastWidth_ !== size.x) {
      this.canvasRef_.style.width = `${size.x}px`;
      this.canvasRef_.style.height = `${size.y}px`;
      Sim.Space.getInstance().handleResize();
    }
    
    this.lastWidth_ = size.x;
    this.lastHeight_ = size.y;
  };

  private resizeListener_ = resizeListener(this.onSizeChange_);


  componentWillUnmount() {
    this.resizeListener_.disconnect();
  }

  componentDidUpdate(prevProps: SimulatorAreaProps) {
    // Check if any cans were toggled
    this.props.itemEnabled.forEach((enabled, i) => {
      if (enabled === prevProps.itemEnabled[i]) return;
      this.setItemEnabled(this.defaultItemList[i], enabled);
    });
    
    // Check if simulation settings were changed
    if (this.props.isSensorNoiseEnabled !== this.oldIsSensorNoiseEnabled) {
      this.oldIsSensorNoiseEnabled = this.props.isSensorNoiseEnabled;
      Sim.Space.getInstance().updateSensorOptions(this.props.isSensorNoiseEnabled);
    }

    // Check if board was reset
    if (this.props.surfaceState !== prevProps.surfaceState) {
      Sim.Space.getInstance().rebuildFloor(this.props.surfaceState);
      Sim.Space.getInstance().resetPosition();
    }

    const shouldSetRobotPosition = (
      prevProps.robotState.x !== this.props.robotState.x ||
      prevProps.robotState.y !== this.props.robotState.y ||
      prevProps.robotState.z !== this.props.robotState.z ||
      prevProps.robotState.theta !== this.props.robotState.theta
    );

    // Checks if robot position needs to be set
    if (shouldSetRobotPosition) Sim.Space.getInstance().resetPosition();
  }

  private bindContainerRef_ = (ref: HTMLDivElement) => {
    if (this.containerRef_) this.resizeListener_.unobserve(this.containerRef_);
    this.containerRef_ = ref;
    if (this.containerRef_) this.resizeListener_.observe(this.containerRef_);
  };

  private bindCanvasRef_ = (ref: HTMLCanvasElement) => {
    this.canvasRef_ = ref;

    if (this.canvasRef_) {
      Sim.Space.getInstance().switchContext(this.canvasRef_, () => this.props.robotState, (robotState) => {
        this.props.onRobotStateUpdate(robotState);
      });
    }
  };

  private setItemEnabled(itemName: string, isEnabled: boolean) {
    isEnabled
      ? Sim.Space.getInstance().createItem({ default: itemName })
      : Sim.Space.getInstance().destroyItem(itemName);
  }

  render() {
    return (
      <Container ref={this.bindContainerRef_}>
        <Canvas ref={this.bindCanvasRef_} />
      </Container>
    );
  }
}
