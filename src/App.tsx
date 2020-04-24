
import * as React from 'react';
import { StyleProps } from "./style";

import compile from './compile';

import WorkerInstance from './WorkerInstance';
import Protocol from './WorkerProtocol';
import { RobotState } from './RobotState';

export interface AppProps extends StyleProps {
  robot: RobotState
}

interface AppState {
  code: string;
}

type Props = AppProps;
type State = AppState;

export class App extends React.Component<Props, State> {
  constructor(props: Props, context?: any) {
    super(props, context);
    this.state = {
      code: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main() {\n  printf("Hello, World! %lf\\n", seconds());\n  return 0;\n}\n'
    };
  }

  private onButtonClick_ = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const compiled = await compile(this.state.code);
      WorkerInstance.start(compiled);
    } catch (e) {
      console.log(e);
    }
    
  };

  private onCodeChange_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      code: event.currentTarget.value
    });
  };
/*  private onMotor0Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      motor0_speed: parseInt(event.currentTarget.value)
    });
  };

  private onMotor1Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      motor1_speed: parseInt(event.currentTarget.value)
    });
  };

  private onMotor2Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      motor2_speed: parseInt(event.currentTarget.value)
    });
  };

  private onMotor3Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      motor3_speed: parseInt(event.currentTarget.value)
    });
  };

  private onServo0Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      servo0_position: event.currentTarget.value
    });
  };

  private onServo1Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      servo1_position: event.currentTarget.value
    });
  };

  private onServo2Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      servo2_position: event.currentTarget.value
    });
  };

  private onServo3Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      servo3_position: event.currentTarget.value
    });
  };*/

  render() {
    const { props, state } = this;
    const { robot } = props;
    const { 
      code
    } = state;
    console.log("Rendering app");
    return (
      <section className="app-area">
        <header>
          <h1 className="ide-title">KISS IDE Simulator</h1>
          <h4 className="kipr">KISS Institute for Practical Robotics</h4>
        </header>
        <p><button onClick={this.onButtonClick_}>Compile</button></p>
        <textarea rows={10} cols={80} onChange={this.onCodeChange_} value={code} className="code"/>
        <section className="robotState">
          <h3>Robot State</h3>
          <section className="robotStateValues">
            <section className="x">
              <h3>X: </h3>
              <textarea rows={1} cols={4} draggable="false" readOnly value={robot.x}/>
            </section>
            <section className="y">
              <h3>Y: </h3>
              <textarea rows={1} cols={4} draggable="false" readOnly value={robot.y}/>
            </section>
            <section className="theta">
              <h3>Theta: </h3>
              <textarea rows={1} cols={4} draggable="false" readOnly  value={robot.theta}/>
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
            <div><textarea rows={1} cols={4} draggable="false" readOnly value={robot.motor0_speed} /></div>
            <div><textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onMotor0Change_}*/ value={robot.motor0_position} /></div>
          </section>
          <section className="motor1">
            <h3>Motor 1</h3>
            <div><textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onMotor0Change_}*/ value={robot.motor1_speed} /></div>
            <div><textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onMotor0Change_}*/ value={robot.motor1_position} /></div>
          </section>
          <section className="motor2">
            <h3>Motor 2</h3>
            <div><textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onMotor0Change_}*/ value={robot.motor2_speed} /></div>
            <div><textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onMotor0Change_}*/ value={robot.motor2_position} /></div>
          </section>
          <section className="motor3">
            <h3>Motor 3</h3>
            <div><textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onMotor0Change_}*/ value={robot.motor3_speed} /></div>
            <div><textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onMotor0Change_}*/ value={robot.motor3_position} /></div>
          </section>
        </section>
        <section className="servos">
          <section className="servo0">
            <h3>Servo 0</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onServo0Change_}*/ value={robot.servo0_position} />
          </section>
          <section className="servo1">
            <h3>Servo 1</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onServo1Change_}*/ value={robot.servo1_position} />
          </section>
          <section className="servo2">
            <h3>Servo 2</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onServo2Change_}*/ value={robot.servo2_position} />
          </section>
          <section className="servo3">
            <h3>Servo 3</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly /*onChange={this.onServo3Change_}*/ value={robot.servo3_position} />
          </section>
        </section>
      </section>
    )
  }
}
