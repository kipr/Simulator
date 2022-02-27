import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { signOutOfApp } from '../firebase/modules/auth';
import WorkerInstance from '../WorkerInstance';
import { RobotState } from '../RobotState';

import { SurfaceState, SurfaceStatePresets } from '../SurfaceState';
import SimMenu from './SimMenu';

import { styled } from 'styletron-react';
import { DARK, Theme } from './theme';
import OverlayLayout from './OverlayLayout';
import { Layout, LayoutProps } from './Layout';
import BottomLayout from './BottomLayout';
import SideLayout from './SideLayout';

import { SettingsDialog } from './SettingsDialog';
import { AboutDialog } from './AboutDialog';

import { FeedbackDialog } from './Feedback';
import { sendFeedback, FeedbackResponse } from './Feedback/SendFeedback';
import { FeedbackSuccessDialog } from './Feedback/SuccessModal';

import compile from '../compile';
import { SimulatorState } from './SimulatorState';
import { Angle, Distance, StyledText } from '../util';
import { Message } from 'ivygate';
import parseMessages, { hasErrors, hasWarnings, sort, toStyledText } from '../util/parse-messages';

import { Space } from '../Sim';
import { RobotPosition } from '../RobotPosition';
import { DEFAULT_SETTINGS, Settings } from '../Settings';
import { DEFAULT_FEEDBACK, Feedback } from '../Feedback';
import ExceptionDialog from './ExceptionDialog';

namespace Modal {
  export enum Type {
    Settings,
    About,
    Exception,
    Feedback,
    FeedbackSuccess,
    None,
  }

  export interface Settings {
    type: Type.Settings;
  }

  export const SETTINGS: Settings = { type: Type.Settings };

  export interface About {
    type: Type.About;
  }

  export const ABOUT: About = { type: Type.About };

  export interface Feedback {
    type: Type.Feedback;
  }

  export const FEEDBACK: Feedback = { type: Type.Feedback };

  export interface FeedbackSuccess {
    type: Type.FeedbackSuccess;
  }

  export const FEEDBACKSUCCESS: FeedbackSuccess = { type: Type.FeedbackSuccess };
  
  export interface Exception {
    type: Type.Exception;
    error: Error;
    info?: React.ErrorInfo;
  }

  export const exception = (error: Error, info?: React.ErrorInfo): Exception => ({ type: Type.Exception, error, info });

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };
}

export type Modal = Modal.Settings | Modal.About | Modal.Exception | Modal.Feedback | Modal.FeedbackSuccess | Modal.None;


interface RootState {
  surfaceState: SurfaceState,
  robotState: RobotState;
  robotStartPosition: RobotPosition;
  layout: Layout;
  code: string;

  simulatorState: SimulatorState;

  modal: Modal;

  console: StyledText;
  messages: Message[];

  theme: Theme;

  settings: Settings;

  feedback: Feedback;
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

const STDOUT_STYLE = (theme: Theme) => ({
  color: theme.color
});

const STDERR_STYLE = (theme: Theme) => ({
  color: 'red'
});

export class Root extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);



    this.state = {
      robotState: WorkerInstance.state,
      robotStartPosition: {
        x: Distance.centimeters(0),
        y: Distance.centimeters(0),
        z: Distance.centimeters(0),
        theta: Angle.degrees(0),
      },
      surfaceState: SurfaceStatePresets.jbcA,
      layout: Layout.Overlay,
      code: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main()\n{\n  printf("Hello, World!\\n");\n  return 0;\n}\n',
      modal: Modal.NONE,
      simulatorState: SimulatorState.STOPPED,
      console: StyledText.text({ text: 'Welcome to the KIPR Simulator!\n', style: STDOUT_STYLE(DARK) }),
      theme: DARK,
      messages: [],
      settings: DEFAULT_SETTINGS,
      feedback: DEFAULT_FEEDBACK,
    };
  }

  componentDidMount() {
    WorkerInstance.onStateChange = this.onWorkerStateChange_;
    WorkerInstance.onStdOutput = this.onStdOutput_;
    WorkerInstance.onStdError = this.onStdError_;
    WorkerInstance.onStopped = this.onStopped_;
  }

  private onStopped_ = () => {
    this.setState({
      simulatorState: SimulatorState.STOPPED
    });
  };

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

  private onSetRobotStartPosition_ = (position: RobotPosition) => {
    this.setState({
      robotStartPosition: {
        x: { ...position.x },
        y: { ...position.y },
        z: { ...position.z },
        theta: { ...position.theta },
      }
    });

    Space.getInstance().setRobotPosition(position);
  };

  private onUpdateSurfaceState_ = (newSurfaceName: string) => {
    const newState = SurfaceStatePresets.presets.find(preset => (preset.surfaceName === newSurfaceName));
    this.setState({ surfaceState: newState });
  };


  private onCodeChange_ = (code: string) => {
    this.setState({ code });
  };

  private overlayLayout_: OverlayLayout;
  private bindOverlayLayout_ = (overlayLayout: OverlayLayout) => {
    this.overlayLayout_ = overlayLayout;
  };

  private onShowAll_ = () => {
    this.overlayLayout_.showAll();
  };

  private onHideAll_ = () => {
    this.overlayLayout_.hideAll();
  };

  private onLayoutChange_ = (layout: Layout) => {
    this.setState({
      layout
    });
  };

  private onModalClick_ = (modal: Modal) => () => this.setState({ modal });

  private onModalClose_ = () => this.setState({ modal: Modal.NONE });

  private onWorkerStateChange_ = (robotState: RobotState) => {
    this.setState({
      robotState,
    });
  };

  private onStdOutput_ = (text: string) => {
    this.setState({
      console: StyledText.extend(this.state.console, StyledText.text({
        text,
        style: STDOUT_STYLE(this.state.theme)
      }, true))
    });
  };

  private onStdError_ = (text: string) => {
    this.setState({
      console: StyledText.extend(this.state.console, StyledText.text({
        text,
        style: STDOUT_STYLE(this.state.theme)
      }, true))
    });
  };

  private onErrorMessageClick_ = (line: number) => () => {
    if (!this.overlayLayout_) return;
    this.overlayLayout_.editor.ivygate.revealLineInCenter(line);
  };

  private onRunClick_ = () => {
    const { state } = this;
    const { code, console, theme } = state;

    let nextConsole = StyledText.extend(console, StyledText.text({
      text: `Compiling...\n`,
      style: STDOUT_STYLE(this.state.theme)
    }));

    this.setState({
      simulatorState: SimulatorState.COMPILING,
      console: nextConsole
    }, () => {
      compile(code)
        .then(compileResult => {
          const messages = sort(parseMessages(compileResult.stderr));
          const compileSucceeded = compileResult.result && compileResult.result.length > 0;

          // Show all errors/warnings in console
          for (const message of messages) {
            nextConsole = StyledText.extend(nextConsole, toStyledText(message, {
              onClick: message.ranges.length > 0
                ? this.onErrorMessageClick_(message.ranges[0].start.line)
                : undefined
            }));
          }

          if (compileSucceeded) {
            // Show success in console and start running the program
            const haveWarnings = hasWarnings(messages);
            nextConsole = StyledText.extend(nextConsole, StyledText.text({
              text: `Compilation succeeded${haveWarnings ? ' with warnings' : ''}!\n`,
              style: STDOUT_STYLE(this.state.theme)
            }));

            WorkerInstance.start(compileResult.result);
          } else {
            if (!hasErrors(messages)) {
              // Compile failed and there are no error messages; some weird underlying error occurred
              // We print the entire stderr to the console
              nextConsole = StyledText.extend(nextConsole, StyledText.text({
                text: `${compileResult.stderr}\n`,
                style: STDERR_STYLE(this.state.theme)
              }));
            }

            nextConsole = StyledText.extend(nextConsole, StyledText.text({
              text: `Compilation failed.\n`,
              style: STDERR_STYLE(this.state.theme)
            }));
          }

          this.setState({
            simulatorState: compileSucceeded ? SimulatorState.RUNNING : SimulatorState.STOPPED,
            messages,
            console: nextConsole
          });
        })
        .catch((e: unknown) => {
          window.console.error(e);

          nextConsole = StyledText.extend(nextConsole, StyledText.text({
            text: 'Something went wrong during compilation.\n',
            style: STDERR_STYLE(this.state.theme)
          }));

          this.setState({
            simulatorState: SimulatorState.STOPPED,
            messages: [],
            console: nextConsole
          });
        });
    });
  };

  private onStopClick_ = () => {
    WorkerInstance.stop();
    this.setState({
      simulatorState: SimulatorState.STOPPED
    });
  };

  private onDownloadClick_ = () => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(this.state.code)}`);
    element.setAttribute('download', 'program.c');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  private onClearConsole_ = () => {
    this.setState({
      console: StyledText.compose({ items: [] })
    });
  };

  private onIndentCode_ = () => {
    this.overlayLayout_.editor.ivygate.formatCode();
  };
  
  onDocumentationClick = () => {
    window.open("https://www.kipr.org/doc/index.html");
  };

  onLogoutClick = () => {
    signOutOfApp();
  };

  onDashboardClick = () => {
    window.location.href = '/';
  };


  private onSettingsChange_ = (changedSettings: Partial<Settings>) => {
    this.setState({ settings: { ...this.state.settings, ...changedSettings } });
  };

  private onFeedbackChange_ = (changedFeedback: Partial<Feedback>) => {
    this.setState({ feedback: { ...this.state.feedback, ...changedFeedback } });
  };

  private onFeedbackSubmit_ = () => {
    sendFeedback(this.state)
      .then((resp: FeedbackResponse) => {
        this.onFeedbackChange_(({ message: resp.message }));
        this.onFeedbackChange_(({ error: resp.networkError }));

        this.onFeedbackChange_(DEFAULT_FEEDBACK);

        this.onModalClick_(Modal.FEEDBACKSUCCESS)();
      })
      .catch((resp: FeedbackResponse) => {
        this.onFeedbackChange_(({ message: resp.message }));
        this.onFeedbackChange_(({ error: resp.networkError }));
      });
  };

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({
      modal: Modal.exception(error, info)
    });
  }

  render() {
    const { props, state } = this;
    const {
      robotState,
      robotStartPosition,
      layout,
      code,
      modal,
      simulatorState,
      console,
      messages,
      surfaceState,
      settings,
      feedback,
    } = state;

    const theme = DARK;

    const commonLayoutProps: LayoutProps = {
      code,
      onStateChange: this.onRobotStateUpdate_,
      robotStartPosition,
      onSetRobotStartPosition: this.onSetRobotStartPosition_,
      theme,
      state: robotState,
      console,
      onCodeChange: this.onCodeChange_,
      messages,
      settings,
      onClearConsole: this.onClearConsole_,
      onIndentCode: this.onIndentCode_,
      surfaceState,
      onSurfaceChange: this.onUpdateSurfaceState_,
      feedback,
    };

    let impl: JSX.Element;
    switch (layout) {
      case Layout.Overlay: {
        impl = (
          <OverlayLayout ref={this.bindOverlayLayout_} {...commonLayoutProps} />
        );
        break;
      }
      case Layout.Bottom: {
        impl = (
          <BottomLayout {...commonLayoutProps} />
        );
        break;
      }
      case Layout.Side: {
        impl = (
          <SideLayout {...commonLayoutProps} />
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
          <SimMenu
            layout={layout}
            onLayoutChange={this.onLayoutChange_}
            theme={theme}
            onShowAll={this.onShowAll_}
            onHideAll={this.onHideAll_}
            onSettingsClick={this.onModalClick_(Modal.SETTINGS)}
            onAboutClick={this.onModalClick_(Modal.ABOUT)}
            onDownloadClick={this.onDownloadClick_}
            onRunClick={this.onRunClick_}
            onStopClick={this.onStopClick_}
            onDocumentationClick={this.onDocumentationClick}
            onDashboardClick={this.onDashboardClick}
            onLogoutClick={this.onLogoutClick}
            onFeedbackClick={this.onModalClick_(Modal.FEEDBACK)}
            simulatorState={simulatorState}
          />
          {impl}
        </Container>
        {modal.type === Modal.Type.Settings ? <SettingsDialog theme={theme} settings={settings} onSettingsChange={this.onSettingsChange_} onClose={this.onModalClose_} /> : undefined}
        {modal.type === Modal.Type.About ? <AboutDialog theme={theme} onClose={this.onModalClose_} /> : undefined}
        {modal.type === Modal.Type.Feedback ? <FeedbackDialog theme={theme} feedback={feedback} onFeedbackChange={this.onFeedbackChange_} onClose={this.onModalClose_} onSubmit={this.onFeedbackSubmit_} /> : undefined}
        {modal.type === Modal.Type.FeedbackSuccess ? <FeedbackSuccessDialog theme={theme} onClose={this.onModalClose_} /> : undefined}
        {modal.type === Modal.Type.Exception ? <ExceptionDialog error={modal.error} theme={theme} onClose={this.onModalClose_} /> : undefined}
      </>

    );
  }
}

// All logic inside of index.tsx
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default withRouter(Root);
export { RootState };