
import * as React from 'react';
import { StyleProps } from "./style";

import compile from './compile';

//CodeMirror imports
const CodeMirror = require('react-codemirror');
require('codemirror/lib/codemirror.css');
require('codemirror/mode/clike/clike');


import WorkerInstance from './WorkerInstance';
import { RobotState } from './RobotState';

export interface AppProps extends StyleProps {
  robot : RobotState;

  onRobotChange: (robot: RobotState) => void;
}

interface AppState {
  code: string;
  console: string;
}

type Props = AppProps;
type State = AppState;



export class App extends React.Component<Props, State> {
  constructor(props: Props, context?: any) {
    super(props, context);
    this.state = {
      code: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}\n',
      console: ''
    };
  }

  private onStdOutput_ = (s: string) => {
    this.setState({
      console: `${this.state.console}\n${s}`
    });
  }

  private onStdCompOutput_ = (s: string) => {
    this.setState({
      console: `Compile Succeeded\n`
    });
  }

  private onStdError_ = (stderror: string) => {
    this.setState({
      console: `${stderror}\n Compiled`
    });
  }
  private onCompileClick_ = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const compiled = await compile(this.state.code);
      WorkerInstance.onStdOutput = this.onStdCompOutput_;
      WorkerInstance.onStdError = this.onStdError_;
      WorkerInstance.compile(compiled);
    } catch (e) {
      console.log(e);
      console.log(e.stderr);
      this.setState({
        console: `Compile Failed \n\n**********************************\n${e.stderr}\n`
      });
    }
    
  };

  private onRunClick_ = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const compiled = await compile(this.state.code);
      WorkerInstance.onStdOutput = this.onStdOutput_;
      WorkerInstance.onStdError = this.onStdError_;
      WorkerInstance.start(compiled);
    } catch (e) {
      console.log(e);
      console.log(e.stderr);
      this.setState({
        console: `Run Failed: Please Recompile\n\n**********************************\n${e.stderr}\n`
      });
    }
    
  };

  private onDownloadClick_ = (event: React.MouseEvent<HTMLButtonElement>) => {
    var date = new Date();
    var dateString = date.getUTCFullYear().toString() + "-" + date.getMonth().toString() + "-" + date.getDay().toString();
    var file= dateString+"-simulatorCode.c";
    console.log(file);
    function download(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    }
    download(file,this.state.code);
    
  };

  private onResetClick_ = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.props.robot.x = 220;
    this.props.robot.y = 400;
    this.props.robot.theta = 0;

    this.props.robot.motor0_position = 0;
    this.props.robot.motor1_position = 0;
    this.props.robot.motor2_position = 0;
    this.props.robot.motor3_position = 0;

    this.props.robot.servo0_position = 1024;
    this.props.robot.servo1_position = 1024;
    this.props.robot.servo2_position = 1024;
    this.props.robot.servo3_position = 0;

    this.props.onRobotChange({
      ...this.props.robot
    })
    this.setState({
      console: ''
    })
  };

  private onCodeChange_ = (newCode) => {
    this.setState({
      code: newCode
    });
  };

  private onXChange_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.props.onRobotChange({
      ...this.props.robot,
      x: parseInt(event.currentTarget.value)
    })
  };

  private onYChange_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.props.onRobotChange({
      ...this.props.robot,
      y: parseInt(event.currentTarget.value)
    })
  };

  private onThetaChange_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.props.onRobotChange({
      ...this.props.robot,
      theta: -1*parseInt(event.currentTarget.value)*Math.PI/180
    });
  };

  render() {
    //let codemirror = new CodeMirrorManager();
    const { props, state } = this;
    const { robot } = props;
    const { 
      code,
      console
    } = state;
    let options = {
      lineNumbers: true,
      mode: 'clike',
    }
    //console.log("Rendering app");
    return (
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
        <CodeMirror rows={20} cols={65} value={code} onChange={this.onCodeChange_} options={options} id="code" name="code" className="code" />
        <textarea rows={10} cols={71} value={console} contentEditable={false} />
        <section className="robotState">
          <h3 className="robotStateHead">Robot State</h3>
          <button onClick={this.onResetClick_} className="resetButton">Reset</button>
          <section className="robotStateValues">
            <section className="x">
              <h3>X: </h3>
              <textarea rows={1} cols={5} draggable="false" onChange={this.onXChange_} value={Math.round(robot.x)}/>
            </section>
            <section className="y">
              <h3>Y: </h3>
              <textarea rows={1} cols={5} draggable="false" onChange={this.onYChange_} value={Math.round(robot.y)}/>
            </section>
            <section className="theta">
              <h3>Theta: </h3>
              <textarea rows={1} cols={5} draggable="false" onChange={this.onThetaChange_} value={Math.round(-1*robot.theta/Math.PI*180)}/>
            </section>
          </section>
        </section>
        <section className="motors">
          <section className="motorValues">
            <h3>Motor:</h3>
            <h3>Speed:</h3>
            <h3>Position:</h3>
          </section>
          <section className="motor0">
            <h3>Motor 0</h3>
            <div><textarea rows={1} cols={4} draggable="false" readOnly value={Math.round(robot.motor0_speed)} /></div>
            <div><textarea rows={1} cols={4} draggable="false" readOnly value={Math.round(robot.motor0_position)} /></div>
          </section>
          <section className="motor1">
            <h3>Motor 1</h3>
            <div><textarea rows={1} cols={4} draggable="false" disabled={true} readOnly value={Math.round(robot.motor1_speed)} /></div>
            <div><textarea rows={1} cols={4} draggable="false" disabled={true} readOnly value={Math.round(robot.motor1_position)} /></div>
          </section>
          <section className="motor2">
            <h3>Motor 2</h3>
            <div><textarea rows={1} cols={4} draggable="false" disabled={true} readOnly value={Math.round(robot.motor2_speed)} /></div>
            <div><textarea rows={1} cols={4} draggable="false" disabled={true} readOnly value={Math.round(robot.motor2_position)} /></div>
          </section>
          <section className="motor3">
            <h3>Motor 3</h3>
            <div><textarea rows={1} cols={4} draggable="false" readOnly value={Math.round(robot.motor3_speed)} /></div>
            <div><textarea rows={1} cols={4} draggable="false" readOnly value={Math.round(robot.motor3_position)} /></div>
          </section>
        </section>
        <section className="servos">
          <section className="servo0">
            <h3>Servo 0</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onServo0Change_}*/ value={Math.round(robot.servo0_position)} />
            <p className="spacer"></p>
          </section>
          <section className="servo1">
            <h3>Servo 1</h3>
            <textarea rows={1} cols={4} draggable="false" disabled={true} readOnly /*onChange={this.onServo1Change_}*/ value={Math.round(robot.servo1_position)} />
            <div className="spacer"></div>
          </section>
          <section className="servo2">
            <h3>Servo 2</h3>
            <textarea rows={1} cols={4} draggable="false" disabled={true} readOnly /*onChange={this.onServo2Change_}*/ value={Math.round(robot.servo2_position)} />
            <div className="spacer"></div>
          </section>
          <section className="servo3">
            <h3>Servo 3</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onServo3Change_}*/ value={Math.round(robot.servo3_position)} />
            <div className="spacer"> </div>
          </section>
        </section>
      </section>
    )
  }
}
