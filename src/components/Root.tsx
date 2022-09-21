import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { signOutOfApp } from '../firebase/modules/auth';
import WorkerInstance from '../WorkerInstance';

import SimMenu from './SimMenu';

import { styled } from 'styletron-react';
import { DARK, Theme } from './theme';
import { Layout, LayoutProps, BottomLayout, OverlayLayout, OverlayLayoutRedux, SideLayoutRedux  } from './Layout';

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
import SelectSceneDialog from './SelectSceneDialog';

import store from '../state';
import { SceneAction } from '../state/reducer';
import { Editor } from './Editor';
import Dict from '../Dict';
import ProgrammingLanguage from '../ProgrammingLanguage';

import Scene from '../state/State/Scene';

namespace Modal {
  export enum Type {
    Settings,
    About,
    Exception,
    SelectScene,
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

  export interface SelectScene {
    type: Type.SelectScene;
  }

  export const SELECT_SCENE: SelectScene = { type: Type.SelectScene };

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };
}

export type Modal = Modal.Settings | Modal.About | Modal.Exception | Modal.SelectScene | Modal.Feedback | Modal.FeedbackSuccess | Modal.None;


interface RootState {
  layout: Layout;

  activeLanguage: ProgrammingLanguage;

  // A map of language to code.
  code: Dict<string>;

  simulatorState: SimulatorState;

  modal: Modal;

  console: StyledText;
  messages: Message[];

  theme: Theme;

  settings: Settings;

  feedback: Feedback;

  windowInnerHeight: number;
}

type Props = Record<string, never>;
type State = RootState;

// We can't set innerheight statically, becasue the window can change
// but we also must use innerheight to fix mobile issues
interface ContainerProps {
  $windowInnerHeight: number
}
const Container = styled('div', (props: ContainerProps) => ({
  width: '100vw',
  height: `${props.$windowInnerHeight}px`, // fix for mobile, see https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'fixed'
}));

const STDOUT_STYLE = (theme: Theme) => ({
  color: theme.color
});

const STDERR_STYLE = (theme: Theme) => ({
  color: 'red'
});

export class Root extends React.Component<Props, State> {
  private editorRef: React.MutableRefObject<Editor>;
  private overlayLayoutRef:  React.MutableRefObject<OverlayLayout>;

  constructor(props: Props) {
    super(props);

    this.state = {
      layout: Layout.Side,
      activeLanguage: 'c',
      code: {
        'c': window.localStorage.getItem('code-c') || '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main()\n{\n  printf("Hello, World!\\n");\n  return 0;\n}\n',
        'python': window.localStorage.getItem('code-python') || 'from kipr import *\n\nprint(\'Hello, World!\')',
      },
      modal: Modal.NONE,
      simulatorState: SimulatorState.STOPPED,
      console: StyledText.text({ text: 'Welcome to the KIPR Simulator!\n', style: STDOUT_STYLE(DARK) }),
      theme: DARK,
      messages: [],
      settings: DEFAULT_SETTINGS,
      feedback: DEFAULT_FEEDBACK,
      windowInnerHeight: window.innerHeight,
    };

    this.editorRef = React.createRef();
    this.overlayLayoutRef = React.createRef();
  }

  componentDidMount() {
    WorkerInstance.onStopped = this.onStopped_;

    this.scheduleUpdateConsole_();
    window.addEventListener('resize', this.onWindowResize_);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize_);
    cancelAnimationFrame(this.updateConsoleHandle_);
  }

  private onWindowResize_ = () => {
    this.setState({ windowInnerHeight: window.innerHeight });
  };

  private onStopped_ = () => {
    this.setState({
      simulatorState: SimulatorState.STOPPED
    });
  };

  private onActiveLanguageChange_ = (language: ProgrammingLanguage) => {
    this.setState({
      activeLanguage: language
    });
  };

  private onCodeChange_ = (code: string) => {
    const { activeLanguage } = this.state;
    this.setState({
      code: {
        ...this.state.code,
        [activeLanguage]: code,
      }
    }, () => {
      window.localStorage.setItem(`code-${activeLanguage}`, code);
    });
  };

  private onShowAll_ = () => {
    if (this.overlayLayoutRef.current) this.overlayLayoutRef.current.showAll();
  };

  private onHideAll_ = () => {
    if (this.overlayLayoutRef.current) this.overlayLayoutRef.current.hideAll();
  };

  private onLayoutChange_ = (layout: Layout) => {
    this.setState({
      layout
    });
  };

  private onModalClick_ = (modal: Modal) => () => this.setState({ modal });

  private onModalClose_ = () => this.setState({ modal: Modal.NONE });
  
  private updateConsole_ = () => {
    const text = WorkerInstance.sharedConsole.popString();
    if (text.length > 0) {
      this.setState({
        console: StyledText.extend(this.state.console, StyledText.text({
          text,
          style: STDOUT_STYLE(this.state.theme)
        }), 300)
      });
    }
    

    this.scheduleUpdateConsole_();
  };

  private updateConsoleHandle_: number | undefined = undefined;
  private scheduleUpdateConsole_ = () => this.updateConsoleHandle_ = requestAnimationFrame(this.updateConsole_);

  private onErrorMessageClick_ = (line: number) => () => {
    if (this.editorRef.current) this.editorRef.current.ivygate.revealLineInCenter(line);
  };

  private onRunClick_ = () => {
    const { state } = this;
    const { activeLanguage, code, console, theme } = state;

    const activeCode = code[activeLanguage];

    switch (activeLanguage) {
      case 'c': {
        let nextConsole: StyledText = StyledText.extend(console, StyledText.text({
          text: `Compiling...\n`,
          style: STDOUT_STYLE(this.state.theme)
        }));
    
        this.setState({
          simulatorState: SimulatorState.COMPILING,
          console: nextConsole
        }, () => {
          compile(activeCode)
            .then(compileResult => {
              nextConsole = this.state.console;
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
    
                WorkerInstance.start({
                  language: 'c',
                  code: compileResult.result
                });
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
        break;
      }
      case 'python': {
        this.setState({
          simulatorState: SimulatorState.RUNNING,
        }, () => {
          WorkerInstance.start({
            language: 'python',
            code: activeCode
          });
        });
        break;
      }
    }

    
  };

  private onStopClick_ = () => {
    WorkerInstance.stop();
  };

  private onDownloadClick_ = () => {
    const { activeLanguage } = this.state;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(this.state.code[activeLanguage])}`);
    element.setAttribute('download', `program.${ProgrammingLanguage.fileExtension(activeLanguage)}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  private onResetWorldClick_ = () => {
    store.dispatch(SceneAction.RESET_SCENE);
  };

  private onClearConsole_ = () => {
    this.setState({
      console: StyledText.compose({ items: [] })
    });
  };

  private onIndentCode_ = () => {
    if (this.editorRef.current) this.editorRef.current.ivygate.formatCode();
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
    const nextSettings: Settings = {
      ...this.state.settings,
      ...changedSettings
    };

    if ('simulationRealisticSensors' in changedSettings) {
      Space.getInstance().realisticSensors = changedSettings.simulationRealisticSensors;
    }
    
    if ('simulationSensorNoise' in changedSettings) {
      Space.getInstance().noisySensors = changedSettings.simulationSensorNoise;
    }

    this.setState({ settings: nextSettings });
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

  private onSelectSceneClick_ = () => {
    this.setState({
      modal: Modal.SELECT_SCENE
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
      layout,
      activeLanguage,
      code,
      modal,
      simulatorState,
      console,
      messages,
      settings,
      feedback,
      windowInnerHeight,
    } = state;

    const theme = DARK;

    const commonLayoutProps: LayoutProps = {
      language: activeLanguage,
      code: code[activeLanguage],
      onLanguageChange: this.onActiveLanguageChange_,
      theme,
      console,
      onCodeChange: this.onCodeChange_,
      messages,
      settings,
      onClearConsole: this.onClearConsole_,
      onIndentCode: this.onIndentCode_,
      onDownloadCode: this.onDownloadClick_,
      onSelectScene: this.onSelectSceneClick_,
      editorRef: this.editorRef,
    };

    let impl: JSX.Element;
    switch (layout) {
      case Layout.Overlay: {
        impl = (
          <OverlayLayoutRedux ref={this.overlayLayoutRef} {...commonLayoutProps} />
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
          <SideLayoutRedux {...commonLayoutProps} />
        );
        break;
      }
      default: {
        return null;
      }

    }

    return (

      <>
        <Container $windowInnerHeight={windowInnerHeight}>
          <SimMenu
            layout={layout}
            onLayoutChange={this.onLayoutChange_}
            theme={theme}
            onShowAll={this.onShowAll_}
            onHideAll={this.onHideAll_}
            onSettingsClick={this.onModalClick_(Modal.SETTINGS)}
            onAboutClick={this.onModalClick_(Modal.ABOUT)}
            onResetWorldClick={this.onResetWorldClick_}
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
        {modal.type === Modal.Type.SelectScene ? <SelectSceneDialog theme={theme} onClose={this.onModalClose_} /> : undefined}
      </>

    );
  }
}

// All logic inside of index.tsx
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default withRouter(Root);
export { RootState };