import React = require("react");
import { MotorDisplay } from "./MotorDisplay";

interface MotorsDisplayProps {
  motorSpeeds: number[],
  motorPositions: number[],
}

interface MotorsDisplayState { }

type Props = MotorsDisplayProps;
type State = MotorsDisplayState;

export class MotorsDisplay extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const sectionStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplate: 'auto / auto auto auto auto auto',
    };

    return (
      <section style={sectionStyle}>
        <section style={{textAlign: 'center'}}>
          <h3>Motor:</h3>
          <h3>Speed:</h3>
          <h3>Position:</h3>
        </section>
        {[...Array(4)].map((_, i) =>
          <MotorDisplay motorNumber={i} motorPosition={this.props.motorPositions[i]} motorSpeed={this.props.motorSpeeds[i]}></MotorDisplay>
        )}
      </section>
    );
  }
}