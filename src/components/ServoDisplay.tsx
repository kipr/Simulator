import React = require("react");
import { NumberDisplay } from "./NumberDisplay";

interface ServoDisplayProps {
  servoNumber: number;
  servoPosition: number;
}

interface ServoDisplayState { }

type Props = ServoDisplayProps;
type State = ServoDisplayState;

export class ServoDisplay extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <section style={{ textAlign: 'center' }}>
        <h3>Servo {this.props.servoNumber}</h3>
        <div><NumberDisplay value={Math.round(this.props.servoPosition)} readOnly width={4} /></div>
      </section>
    );
  }
}