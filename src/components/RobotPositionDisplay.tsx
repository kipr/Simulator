import React = require("react");
import { NumberDisplay } from "./NumberDisplay";

interface RobotPositionDisplayProps {
  x: number,
  y: number,
  theta: number,

  xChanged: (x: number) => void,
  yChanged: (y: number) => void,
  thetaChanged: (theta: number) => void,
}

interface RobotPositionDisplayState { }

type Props = RobotPositionDisplayProps;
type State = RobotPositionDisplayState;

export class RobotPositionDisplay extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const sectionStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplate: 'auto / auto auto auto',
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
          <h3>Theta:</h3>
          <NumberDisplay value={Math.round(this.props.theta)} onChange={(val) => this.props.thetaChanged(val)} width={5} />
        </section>
      </section>
    );
  }
}