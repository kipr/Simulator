import * as React from 'react';
import { NumberDisplay } from "./NumberDisplay";

interface MotorDisplayProps {
  motorNumber: number;
  motorSpeed: number;
  motorPosition: number;
}

type Props = MotorDisplayProps;

export class MotorDisplay extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <section style={{ textAlign: 'center' }}>
        <h3>Motor {this.props.motorNumber}</h3>
        <div><NumberDisplay value={Math.round(this.props.motorSpeed)} readOnly width={4} /></div>
        <div><NumberDisplay value={Math.round(this.props.motorPosition)} readOnly width={4} /></div>
      </section>
    );
  }
}