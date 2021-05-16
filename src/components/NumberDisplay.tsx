import * as React from 'react';

interface NumberDisplayProps {
  value: number,
  width: number,
  readOnly?: boolean,
  onChange?: (value: number) => void,
}

type Props = NumberDisplayProps;

export class NumberDisplay extends React.Component<Props> {
  private onValueChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const parsedNumber = event.target.value !== '' ? Number.parseInt(event.target.value) : 0;
    if (!Number.isNaN(parsedNumber)) {
      this.props.onChange(parsedNumber);
    }
  };

  render(): React.ReactNode {
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