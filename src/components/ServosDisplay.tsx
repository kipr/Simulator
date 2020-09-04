import React = require("react");
import { ServoDisplay } from "./ServoDisplay";

interface ServosDisplayProps {
  servoPositions: number[],
}

interface ServosDisplayState { }

type Props = ServosDisplayProps;
type State = ServosDisplayState;

export class ServosDisplay extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const sectionStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplate: 'auto / auto auto auto auto',
    };

    return (
      <section style={sectionStyle}>
        {[...Array(4)].map((_, i) =>
          <ServoDisplay key={i} servoNumber={i} servoPosition={this.props.servoPositions[i]}></ServoDisplay>
        )}
      </section>
    );
  }
}