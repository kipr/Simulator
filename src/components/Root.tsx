import * as React from 'react';
import WorkerInstance from '../WorkerInstance';
import { RobotState } from '../RobotState';

import { SurfaceState, SurfaceStatePresets } from '../SurfaceState';
import Menu from './Menu';

import { styled } from 'styletron-react';
import { DARK, ThemeProps } from './theme';
import Console from './Console';
import Widget from './Widget';
import OverlayLayout from './OverlayLayout';
import { Layout } from './Layout';
import BottomLayout from './BottomLayout';
import SideLayout from './SideLayout';

import * as portals from 'react-reverse-portal';
import { SimulatorArea, SimulatorAreaProps } from './SimulatorArea';
import { Portal } from './Portal';
import { SettingsDialog } from './SettingsDialog';
import { AboutDialog } from './AboutDialog';

type ModalType = 'settings' | 'about' | 'none';

interface RootState {
  shouldSetRobotPosition: boolean,
  isSensorNoiseEnabled: boolean,
  surfaceState: SurfaceState,
  robotState: RobotState;
  cans: boolean[];
  layout: Layout;
  code: string;
  simulatorSink: Portal.Sink;

  modal: ModalType;
}

type Props = Record<string, never>;
type State = RootState;

const Container = styled('div', {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
});

export class Root extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      robotState: WorkerInstance.state,
      shouldSetRobotPosition: false,
      isSensorNoiseEnabled: false,
      surfaceState: SurfaceStatePresets.jbcA,
      cans: Array<boolean>(12).fill(false),
      layout: Layout.Overlay,
      code: '',
      simulatorSink: undefined,
      modal: 'none'
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
      motorSpeeds: [ ...this.state.robotState.motorSpeeds ],
      motorPositions: [ ...this.state.robotState.motorPositions ],
      servoPositions: [ ...this.state.robotState.servoPositions ],
      analogValues: [ ...this.state.robotState.analogValues ],
      ...robot,
    };

    WorkerInstance.state = newRobotState;
  };

  private onCanChange_ = (canNumber: number, enabled: boolean) => {
    this.setState(prevState => {
      const cans = [ ...prevState.cans ];
      cans[canNumber] = enabled;
      return { cans };
    });
  };

  private onRobotPositionSetRequested_ = () => {
    this.setState({ shouldSetRobotPosition: true });
  };

  private onRobotPositionSetCompleted_ = () => {
    this.setState({ shouldSetRobotPosition: false });
  };
  
  private onToggleSensorNoise_ = (enabled: boolean) => {
    this.setState({ isSensorNoiseEnabled: enabled });
  };

  private onUpdateSurfaceState_ = (newSurfaceState: SurfaceState) => {
    this.setState({ surfaceState: newSurfaceState });
  };


  private onCodeChange_ = (code: string) => {
    this.setState({ code });
  }

  private overlayLayout_: OverlayLayout;
  private bindOverlayLayout_ = (overlayLayout: OverlayLayout) => {
    this.overlayLayout_ = overlayLayout;
  };

  private onShowAll_ = () => {
    this.overlayLayout_.showAll();
  }

  private onHideAll_ = () => {
    this.overlayLayout_.hideAll();
  }
  
  private onLayoutChange_ = (layout: Layout) => {
    this.setState({
      layout
    })
  };

  private onModalClick_ = (modal: ModalType) => () => this.setState({
    modal
  });

  private onModalClose_ = () => this.setState({
    modal: 'none'
  });

  private bindSimulatorSink_ = (simulatorSink: Portal.Sink) => {
    this.setState({
      simulatorSink
    });
  };

  private onRunClick_ = () => {

  };

  private onStopClick_ = () => {

  };

  private onDownloadClick_ = () => {

  };

  render() {
    const { props, state } = this;
    const { cans, robotState, layout, code, simulatorSink, modal } = state;

    const theme = DARK;

    let impl: JSX.Element;
    switch (layout) {
      case Layout.Overlay: {
        impl = (
          <OverlayLayout
            ref={this.bindOverlayLayout_}
            code={code}
            onCodeChange={this.onCodeChange_}
            cans={cans}
            onStateChange={this.onRobotStateUpdate_}
            theme={theme}
            state={robotState}
            simulator={this.bindSimulatorSink_}
            onCanChange={this.onCanChange_}
          />
        );
        break;
      }
      case Layout.Bottom: {
        impl = (
          <BottomLayout
            code={code}
            onCodeChange={this.onCodeChange_}
            cans={cans}
            onStateChange={this.onRobotStateUpdate_}
            theme={theme}
            state={robotState}
            simulator={this.bindSimulatorSink_}
            onCanChange={this.onCanChange_}
          />
        );
        break;
      }
      case Layout.Side: {
        impl = (
          <SideLayout
            code={code}
            onCodeChange={this.onCodeChange_}
            cans={cans}
            onStateChange={this.onRobotStateUpdate_}
            theme={theme}
            state={robotState}
            simulator={this.bindSimulatorSink_}
            onCanChange={this.onCanChange_}
          />
        );
        break;
      }
      default: {
        return null;
      }
      
    }

    return (

      <>
        <Container>
          <Menu
            layout={layout}
            onLayoutChange={this.onLayoutChange_}
            theme={theme}
            onShowAll={this.onShowAll_}
            onHideAll={this.onHideAll_}
            onSettingsClick={this.onModalClick_('settings')}
            onAboutClick={this.onModalClick_('about')}
            onDownloadClick={this.onDownloadClick_}
            onRunClick={this.onRunClick_}
            onStopClick={this.onStopClick_}
          />
          {impl}
          <Portal.Source sink={simulatorSink}>
            <SimulatorArea key='simulator' robotState={robotState} canEnabled={cans} onRobotStateUpdate={this.onRobotStateUpdate_} />
          </Portal.Source>
        </Container>
        {modal === 'settings' ? <SettingsDialog theme={theme} onClose={this.onModalClose_} /> : undefined}
        {modal === 'about' ? <AboutDialog theme={theme} onClose={this.onModalClose_} /> : undefined}
      </>

    );
  }
}

// All logic inside of index.tsx
