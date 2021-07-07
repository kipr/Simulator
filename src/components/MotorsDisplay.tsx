import * as React from 'react';
import { MotorDisplay } from "./MotorDisplay";

interface MotorsDisplayProps {
  motorSpeeds: number[],
  motorPositions: number[],
}

type Props = MotorsDisplayProps;

export class MotorsDisplay extends React.Component<Props> {
  render(): React.ReactNode {
    const sectionStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplate: 'auto / auto auto auto auto auto',
    };

    return (
      <section style={sectionStyle}>
        <section style={{ textAlign: 'center' }}>
          <h3>Motor:</h3>
          <h3>Speed:</h3>
          <h3>Position:</h3>
        </section>
        {[...Array<unknown>(4)].map((_, i) =>
          <MotorDisplay key={i} motorNumber={i} motorPosition={this.props.motorPositions[i]} motorSpeed={this.props.motorSpeeds[i]}></MotorDisplay>
        )}
      </section>
    );
  }
}