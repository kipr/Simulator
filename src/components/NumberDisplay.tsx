import React = require("react");

interface NumberDisplayProps {
  value: number,
  width: number,
  readOnly?: boolean,
  onChange?: (value: number) => void,
}

interface NumberDisplayState { }

type Props = NumberDisplayProps;
type State = NumberDisplayState;

export class NumberDisplay extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  onValueChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onChange(Number.parseInt(event.target.value));
  };

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
        readOnly={this.props.readOnly}
        onChange={!this.props.readOnly ? this.onValueChange : undefined} />
    );
  }
}