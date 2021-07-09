import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Value } from '../../util';
import { ThemeProps } from '../theme';
import Field from '../Field';

export interface ValueEditProps extends ThemeProps, StyleProps {
  name: string;
  value: Value;
  onValueChange: (value: Value) => void;
  // onRobotPositionSetRequested: () => void;
}

interface ValueEditState {
  input: string;
  hasFocus: boolean;
  valid: boolean;
}

type Props = ValueEditProps;
type State = ValueEditState;

const SubContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  flex: '1 1',
  borderRadius: `${props.theme.itemPadding}px`,
  border: `1px solid ${props.theme.borderColor}`,
  overflow: 'hidden',
  alignItems: 'center',
}));

const Input = styled('input', (props: ThemeProps) => ({
  flex: '1 1 0',
  minWidth: 0,
  font: 'inherit',
  display: 'block',
  backgroundColor: 'transparent',
  color: props.theme.color,
  ':focus': {
    outline: 'none'
  },
  padding: `${props.theme.itemPadding}px`,
  borderRight: `1px solid ${props.theme.borderColor}`,
  borderLeft: 'none',
  borderTop: 'none',
  borderBottom: 'none'
}));

const UnitLabel = styled('span', (props: ThemeProps) => ({
  fontSize: '0.9em',
  userSelect: 'none',
  minWidth: '80px',
  textAlign: 'center',
  
  padding: `${props.theme.itemPadding}px`,
}));

export class ValueEdit extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      input: `${Value.value(props.value)}`,
      hasFocus: false,
      valid: true,
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (state.hasFocus && state.valid) {
      console.log(`Old State is ${state.input}, old Props is ${Value.value(props.value)}`);
      return { input: `${Value.value(props.value)}` };
    }
  }

  private onInputChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);
    if (!Number.isNaN(value) && value !== undefined) {
      this.setState({
        input: event.currentTarget.value,
        hasFocus: true,
        valid: true,
      });
      console.log(`Valid and input is ${this.state.input}`);
    } else {
      this.setState({
        valid: false,
      });
      console.log("Not Valid");
    }
  };

  private update(): void {
    const value = Value.copyValue(this.props.value, Number(this.state.input));
    console.log(`Value is ${value.type}`);
    this.props.onValueChange(value);
    // this.props.onRobotPositionSetRequested();
  }

  private onBlur_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.update();
    this.setState({
      hasFocus: false,
    });
  };

  private onKeyDown_ = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      this.update();
    }
  };
  
  render() {
    const { props, state } = this;
    const { theme, style, className, name, value } = props;
    const { input } = state;
    const errorStyle: React.CSSProperties = {
      border: `${state.valid ? '1px' : '5px'} solid ${state.valid ? props.theme.borderColor : 'red'}`,
    };
    
    return (
      <Field name={name} theme={theme} className={className} style={style}>
        <SubContainer theme={theme}>
          <Input type='text' style={errorStyle} onBlur={this.onBlur_} onChange={this.onInputChange_} value={input} theme={theme} onKeyDown={this.onKeyDown_} />
          <UnitLabel theme={theme}>{Value.unitName(value)}</UnitLabel>
        </SubContainer>
      </Field>
    );
  }
}

export default ValueEdit;