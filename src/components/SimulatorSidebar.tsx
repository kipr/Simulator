import * as React from 'react';
import { StyleProps } from "../style";

import compile from '../compile';

// CodeMirror imports
import { Controlled as CodeMirror } from 'react-codemirror2';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/clike/clike');


import WorkerInstance from '../WorkerInstance';
import { RobotState } from '../RobotState';
import Collapsible from './Collapsible';
import { MotorsDisplay } from './MotorsDisplay';
import { ServosDisplay } from './ServosDisplay';
import { RobotPositionDisplay } from './RobotPositionDisplay';


export interface SimulatorSidebarProps extends StyleProps {
  robotState: RobotState;
  isCanChecked: boolean[];

  onRobotStateChange: (robotState: RobotState) => void;
  onCanChange: (canNumber: number, checked: boolean) => void;
  onRobotPositionSetRequested: () => void;
}

interface SimulatorSidebarState {
  code: string;
  console: string;
  isCompiling: boolean;
}

type Props = SimulatorSidebarProps;
type State = SimulatorSidebarState;

export class SimulatorSidebar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      code: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main()\n{\n  printf("Hello, World!\\n");\n  return 0;\n}\n',
      console: '',
      isCompiling: false,
    };

    // Set handlers for program output
    WorkerInstance.onStdOutput = this.onStdOutput_;
    WorkerInstance.onStdError = this.onStdError_;
  }

  private appendToConsole = (s: string) => {
    this.setState(prevState => ({
      console: `${prevState.console}\n${s}`,
    }));
  };

  private onStdOutput_ = (s: string) => {
    this.appendToConsole(s);
  };

  private onStdError_ = (stderror: string) => {
    this.appendToConsole(stderror);
  };

  private compileCurrentCode: () => Promise<string> = async () => {
    this.setState({
      isCompiling: true,
      console: `Compiling...`,
    });

    try {
      const compiled = await compile(this.state.code);
      this.appendToConsole('Compile succeeded\n');

      return compiled;
    } catch (e) {
      const compileError = e as { stdout: string, stderr: string };
      this.appendToConsole(`Compile Failed \n\n**********************************\n${compileError.stderr}`);

      return null;
    } finally {
      this.setState({ isCompiling: false });
    }
  };

  private onCompileClick_: React.MouseEventHandler<HTMLButtonElement> = async () => {
    await this.compileCurrentCode();
  };

  private onRunClick_: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const compiledCode = await this.compileCurrentCode();
    if (compiledCode === null) return;

    WorkerInstance.start(compiledCode);
  };

  private onDownloadClick_: React.MouseEventHandler<HTMLButtonElement> = () => {
    const date = new Date();
    const dateString = `${date.getUTCFullYear().toString()}-${date.getMonth().toString()}-${date.getDay().toString()}`;
    const file = `${dateString}-simulatorCode.c`;
    console.log(file);
    function download(filename, text) {
      const element = document.createElement('a');
      element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    }
    download(file,this.state.code);
    
  };

  private onSetClick_: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.props.onRobotPositionSetRequested();
  };

  private onResetClick_: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.props.onRobotStateChange({
      ...this.props.robotState,
      x: RobotState.empty.x,
      y: RobotState.empty.y,
      z: RobotState.empty.z,
      theta: RobotState.empty.theta,
    });

    this.props.onRobotPositionSetRequested();

    this.setState({
      console: ''
    });
  };

  private onCodeChange_ = (_editor, _data, code: string) => {
    this.setState({ code });
  };

  private onXChange_ = (x: number) => {
    this.props.onRobotStateChange({
      ...this.props.robotState,
      x,
    });
  };

  private onYChange_ = (y: number) => {
    this.props.onRobotStateChange({
      ...this.props.robotState,
      y,
    });
  };

  private onZChange_ = (z: number) => {
    this.props.onRobotStateChange({
      ...this.props.robotState,
      z,
    });
  };


  private onThetaChange_ = (theta: number) => {
    this.props.onRobotStateChange({
      ...this.props.robotState,
      theta,
    });
  };

  private onCheckBoxActivity = (event: React.ChangeEvent<HTMLInputElement>) => {
    const canNumber = Number.parseInt(event.target.value);
    const isTargetChecked = event.target.checked;
    this.props.onCanChange(canNumber, isTargetChecked);
  };

  render(): React.ReactNode {
    const { props, state } = this;
    const { robotState } = props;
    const { 
      code,
      console,
      isCompiling,
    } = state;
    const options = {
      lineNumbers: true,
      mode: 'text/x-csrc',
      theme: 'kiss',
    };
    
    return (
      <>
        <section className="app-area">
          <section className="app-header">
            <svg width="197" height="164" className="logo">
              <image height="100%" href="static/KIPR-Logo-bk.jpg"/>
            </svg>
            <h1 className="ide-title">KISS IDE<br/>Simulator</h1>
          </section>
          <p>
            <button onClick={this.onCompileClick_} disabled={isCompiling}>Compile</button>
            <button onClick={this.onRunClick_} disabled={isCompiling}>Run</button>
            <button onClick={this.onDownloadClick_}>Download</button>
          </p>
          <CodeMirror value={code} onBeforeChange={this.onCodeChange_} options={options} className="code" />
          <textarea rows={10} cols={70} value={console} readOnly />
          <section className="robotState">
            <h3 className="robotStateHead">Robot State</h3>
            <button onClick={this.onSetClick_} className="setButton">Set</button>
            <button onClick={this.onResetClick_} className="resetButton">Reset</button>
            <RobotPositionDisplay
              x={robotState.x}
              y={robotState.y}
              z={robotState.z}
              theta={robotState.theta}
              xChanged={this.onXChange_}
              yChanged={this.onYChange_}
              zChanged={this.onZChange_}
              thetaChanged={this.onThetaChange_}>
            </RobotPositionDisplay>
          </section>
          <MotorsDisplay
            motorSpeeds={robotState.motorSpeeds}
            motorPositions={robotState.motorPositions}>
          </MotorsDisplay>
          <ServosDisplay
            servoPositions={robotState.servoPositions} >
          </ServosDisplay>
        </section>
        <Collapsible title="Cans">
          <ul>
            {[...Array<unknown>(12)].map((_, i) =>
              <li key={i + 1}>
                <input type="checkbox" name="can" value={i} checked={this.props.isCanChecked[i]} onChange={this.onCheckBoxActivity} />
                <label>{`Can ${i + 1}`}</label>
              </li>
            )}
          </ul>
        </Collapsible>
      </>
    );
  }
}
