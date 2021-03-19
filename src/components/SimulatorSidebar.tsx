
import * as React from 'react';
import { StyleProps } from "../style";

import compile from '../compile';

//CodeMirror imports
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
}

interface SimulatorSidebarState {
  code: string;
  console: string;
}

type Props = SimulatorSidebarProps;
type State = SimulatorSidebarState;

export class SimulatorSidebar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      code: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main()\n{\n  printf("Hello, World!\\n");\n  return 0;\n}\n',
      console: '',
    };
  }

  private onStdOutput_ = (s: string) => {
    this.setState(prevState => ({
      console: `${prevState.console}\n${s}`,
    }));
  }

  private onStdCompOutput_ = () => {
    this.setState({
      console: `Compile Succeeded\n`
    });
  }

  private onStdError_ = (stderror: string) => {
    this.setState({
      console: `${stderror}\n Compiled`
    });
  }
  private onCompileClick_: React.MouseEventHandler<HTMLButtonElement> = async () => {    
    try {
      const compiled = await compile(this.state.code);
      WorkerInstance.onStdOutput = this.onStdCompOutput_;
      WorkerInstance.onStdError = this.onStdError_;
      WorkerInstance.compile(compiled);
    } catch (e) {
      const compileError = e as { stdout: string, stderr: string };
      console.log(compileError);
      console.log(compileError.stderr);
      this.setState({
        console: `Compile Failed \n\n**********************************\n${compileError.stderr}\n`
      });
    }
    
  };

  private onRunClick_: React.MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      const compiled = await compile(this.state.code);
      WorkerInstance.onStdOutput = this.onStdOutput_;
      WorkerInstance.onStdError = this.onStdError_;
      WorkerInstance.start(compiled);
    } catch (e) {
      const compileError = e as { stdout: string, stderr: string };
      console.log(compileError);
      console.log(compileError.stderr);
      this.setState({
        console: `Run Failed: Please Recompile\n\n**********************************\n${compileError.stderr}\n`
      });
    }
    
  };

  private onDownloadClick_: React.MouseEventHandler<HTMLButtonElement> = () => {
    const date = new Date();
    const dateString = date.getUTCFullYear().toString() + "-" + date.getMonth().toString() + "-" + date.getDay().toString();
    const file= dateString+"-simulatorCode.c";
    console.log(file);
    function download(filename, text) {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    }
    download(file,this.state.code);
    
  };

  private onResetClick_: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.props.onRobotStateChange({
      ...this.props.robotState,
      x: RobotState.empty.x,
      y: RobotState.empty.y,
      theta: RobotState.empty.theta,
    });

    this.setState({
      console: ''
    })
  };

  private onCodeChange_ = (_editor, _data, code: string) => {
    this.setState({ code });
  };

  private onXChange_ = (x: number) => {
    this.props.onRobotStateChange({
      ...this.props.robotState,
      x,
    })
  };

  private onYChange_ = (y: number) => {
    this.props.onRobotStateChange({
      ...this.props.robotState,
      y,
    })
  };

  private onThetaChange_ = (theta: number) => {
    this.props.onRobotStateChange({
      ...this.props.robotState,
      theta: -1*theta*Math.PI/180,
    });
  };

  private onCheckBoxActivity = (event: React.ChangeEvent<HTMLInputElement>) => {
		const canNumber = Number.parseInt(event.target.value);
    const isTargetChecked = event.target.checked;
    this.props.onCanChange(canNumber, isTargetChecked);
	}

  render(): React.ReactNode {
    //let codemirror = new CodeMirrorManager();
    const { props, state } = this;
    const { robotState } = props;
    const { 
      code,
      console
    } = state;
    const options = {
      lineNumbers: true,
      mode: 'text/x-csrc',
      theme: 'kiss',
    }
    //console.log("Rendering app");
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
            <button onClick={this.onCompileClick_}>Compile</button>
            <button onClick={this.onRunClick_}>Run</button>
            <button onClick={this.onDownloadClick_}>Download</button>
          </p>
          <CodeMirror value={code} onBeforeChange={this.onCodeChange_} options={options} className="code" />
          <textarea rows={10} cols={70} value={console} readOnly />
          <section className="robotState">
            <h3 className="robotStateHead">Robot State</h3>
            <button onClick={this.onResetClick_} className="resetButton">Reset</button>
            <RobotPositionDisplay
              x={robotState.x}
              y={robotState.y}
              theta={robotState.theta}
              xChanged={this.onXChange_}
              yChanged={this.onYChange_}
              thetaChanged={this.onThetaChange_}>
            </RobotPositionDisplay>
          </section>
          <MotorsDisplay
            motorSpeeds={[robotState.motor0_speed, robotState.motor1_speed, robotState.motor2_speed, robotState.motor3_speed]}
            motorPositions={[robotState.motor0_position, robotState.motor1_position, robotState.motor2_position, robotState.motor3_position]}>
          </MotorsDisplay>
          <ServosDisplay
            servoPositions={[robotState.servo0_position, robotState.servo1_position, robotState.servo2_position, robotState.servo3_position]} >
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
    )
  }
}
