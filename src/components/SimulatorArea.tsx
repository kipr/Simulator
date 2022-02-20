import * as React from 'react';

import * as Sim from '../Sim';
import { RobotState } from "../RobotState";

import { styled } from 'styletron-react';

import resizeListener, { ResizeListener } from './ResizeListener';
import { Vector2 } from '../math';

import Loading from './Loading';

export interface SimulatorAreaProps {
  robotState: RobotState;
  isSensorNoiseEnabled: boolean;
  isRealisticSensorsEnabled: boolean;

  onRobotStateUpdate: (robotState: Partial<RobotState>) => void;
  // onRobotPositionSetCompleted: () => void;
}
interface SimulatorAreaState {
  loading: boolean,
  loadingMessage: string
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
  },
  touchAction: 'none',
});

export class SimulatorArea extends React.Component<SimulatorAreaProps, SimulatorAreaState> {
  private containerRef_: HTMLDivElement;
  private canvasRef_: HTMLCanvasElement;

  constructor(props: SimulatorAreaProps) {
    super(props);
    this.state = { 
      loading: true,
      loadingMessage: '',
    };
  }

  componentDidMount() {
    // after a few seconds of loading, show some messages to the user

    // 30 second message: still going, might have fail
    setTimeout(() => {
      if (this.state.loading) {
        this.setState({ loadingMessage: 'This process is taking longer than expected...\nIf you have a poor internet connection, this can take some time' });
      }
    }, 30 * 1000);
    // 120 second message: likely failed
    setTimeout(() => {
      if (this.state.loading) {
        this.setState({ loadingMessage: 'The simulator may have failed to load.\nPlease submit a feedback form to let us know!' });
      }
    }, 120 * 1000);

    // TODO: If simulator initialization fails, we should show the user an error
    Sim.Space.getInstance().ensureInitialized()
      .then(() => {
        this.setState({ 
          loading: false,
          loadingMessage: ''
        });
      })
      .catch(e => console.error('Simulator initialization failed', e));
  }

  private lastWidth_ = 0;
  private lastHeight_ = 0;

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
    // Check if simulation settings were changed
    if (prevProps.isSensorNoiseEnabled !== this.props.isSensorNoiseEnabled || prevProps.isRealisticSensorsEnabled !== this.props.isRealisticSensorsEnabled) {
      Sim.Space.getInstance().updateSensorOptions(this.props.isSensorNoiseEnabled, this.props.isRealisticSensorsEnabled);
    }
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

  render() {
    if (this.state.loading) {
      return (
        <Container >
          <Loading 
            message='Initializing Simulator...'
            errorMessage={this.state.loadingMessage}
          />;
        </Container>
      );
    } 
    return (
      <Container ref={this.bindContainerRef_}>
        <Canvas ref={this.bindCanvasRef_} />
      </Container>
    );
  }
}
