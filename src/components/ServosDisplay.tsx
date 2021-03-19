import React = require("react");
import { ServoDisplay } from "./ServoDisplay";

interface ServosDisplayProps {
  servoPositions: number[],
}

type Props = ServosDisplayProps;

export class ServosDisplay extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): React.ReactNode {
    const sectionStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplate: 'auto / auto auto auto auto',
    };

    return (
      <section style={sectionStyle}>
        {[...Array<unknown>(4)].map((_, i) =>
          <ServoDisplay key={i} servoNumber={i} servoPosition={this.props.servoPositions[i]}></ServoDisplay>
        )}
      </section>
    );
  }
}