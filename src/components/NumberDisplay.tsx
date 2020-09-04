import React = require("react");

interface NumberDisplayProps {
  value: number,
  width: number,
}

interface NumberDisplayState { }

type Props = NumberDisplayProps;
type State = NumberDisplayState;

export class NumberDisplay extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const textAreaStyle: React.CSSProperties = {
      resize: 'none',
      textAlign: 'center',
      fontSize: 'large',
    };

    return (
      <textarea
        value={this.props.value}
        style={textAreaStyle}
        rows={1}
        cols={this.props.width}
        draggable="false"
        readOnly />
    );
  }
}