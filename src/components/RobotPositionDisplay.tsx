import React = require("react");
import { NumberDisplay } from "./NumberDisplay";

interface RobotPositionDisplayProps {
  x: number,
  y: number,
  z: number,
  theta: number,

  xChanged: (x: number) => void,
  yChanged: (y: number) => void,
  zChanged: (z: number) => void,
  thetaChanged: (theta: number) => void,
}

type Props = RobotPositionDisplayProps;

export class RobotPositionDisplay extends React.Component<Props> {
  render(): React.ReactNode {
    const sectionStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplate: 'auto / auto auto auto auto',
    };

    return (
      <section style={sectionStyle}>
        <section style={{ textAlign: 'center' }}>
          <h3>X:</h3>
          <NumberDisplay value={Math.round(this.props.x)} onChange={(val) => this.props.xChanged(val)} width={5} />
        </section>
        <section style={{ textAlign: 'center' }}>
          <h3>Y:</h3>
          <NumberDisplay value={Math.round(this.props.y)} onChange={(val) => this.props.yChanged(val)} width={5} />
        </section>
        <section style={{ textAlign: 'center' }}>
          <h3>Z:</h3>
          <NumberDisplay value={Math.round(this.props.z)} onChange={(val) => this.props.zChanged(val)} width={5} />
        </section>
        <section style={{ textAlign: 'center' }}>
          <h3>Theta:</h3>
          <NumberDisplay value={Math.round(this.props.theta)} onChange={(val) => this.props.thetaChanged(val)} width={5} />
        </section>
      </section>
    );
  }
}