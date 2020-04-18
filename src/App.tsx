
import * as React from 'react';
import { StyleProps } from "./style";

import compile from './compile';

import WorkerInstance from './WorkerInstance';

export interface AppProps extends StyleProps {

}

interface AppState {
  code: string;
  motor0_speed: string;
  motor1_speed: string;
  motor2_speed: string;
  motor3_speed: string;
  servo0_position: string;
  servo1_position: string;
  servo2_position: string;
  servo3_position: string;
}

type Props = AppProps;
type State = AppState;

export class App extends React.Component<Props, State> {
  constructor(props: Props, context?: any) {
    super(props, context);

    this.state = {
      code: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main() {\n  printf("Hello, World! %lf\\n", seconds());\n  return 0;\n}\n',
      motor0_speed: '0',
      motor1_speed: '0',
      motor2_speed: '0',
      motor3_speed: '0',
      servo0_position: '1024',
      servo1_position: '1024',
      servo2_position: '1024',
      servo3_position: '1024'
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

  private onMotor0Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      motor0_speed: event.currentTarget.value
    });
  };

  private onMotor1Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      motor1_speed: event.currentTarget.value
    });
  };

  private onMotor2Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      motor2_speed: event.currentTarget.value
    });
  };

  private onMotor3Change_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      motor3_speed: event.currentTarget.value
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
  };

  render() {
    const { props, state } = this;
    const { 
      code,
      motor0_speed,
      motor1_speed,
      motor2_speed,
      motor3_speed,
      servo0_position,
      servo1_position,
      servo2_position,
      servo3_position
    } = state;
    //console.log(this.props.children);
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
              <textarea rows={1} cols={4} draggable="false" readOnly/>
            </section>
            <section className="y">
              <h3>Y: </h3>
              <textarea rows={1} cols={4} draggable="false" readOnly/>
            </section>
            <section className="theta">
              <h3>Theta: </h3>
              <textarea rows={1} cols={4} draggable="false" readOnly/>
            </section>
          </section>
        </section>
        <section className="movers">
          <section className="motor0">
            <h3>Motor 0</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly onChange={this.onMotor0Change_} value={motor0_speed} />
          </section>
          <section className="motor1">
            <h3>Motor 1</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly onChange={this.onMotor1Change_} value={motor1_speed} />
          </section>
          <section className="motor2">
            <h3>Motor 2</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly onChange={this.onMotor2Change_} value={motor2_speed} />
          </section>
          <section className="motor3">
            <h3>Motor 3</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly onChange={this.onMotor3Change_} value={motor3_speed} />
          </section>
          <section className="servo0">
            <h3>Servo 0</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly onChange={this.onServo0Change_} value={servo0_position} />
          </section>
          <section className="servo1">
            <h3>Servo 1</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly onChange={this.onServo1Change_} value={servo1_position} />
          </section>
          <section className="servo2">
            <h3>Servo 2</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly onChange={this.onServo2Change_} value={servo2_position} />
          </section>
          <section className="servo3">
            <h3>Servo 3</h3>
            <textarea rows={1} cols={4} draggable="false" readOnly onChange={this.onServo3Change_} value={servo3_position} />
          </section>
        </section>
      </section>
    )
  }
}
