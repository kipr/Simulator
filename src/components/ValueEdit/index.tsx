import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { EMPTY_OBJECT, Slow, Value } from '../../util';
import { ThemeProps } from '../theme';
import Field from '../Field';

export interface ValueEditProps extends ThemeProps, StyleProps {
  name: string;
  value: Value;
  onValueChange: (value: Value) => void;
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
  borderBottom: 'none',
  transition: 'background-color 0.2s'
}));

const UnitLabel = styled('span', (props: ThemeProps) => ({
  fontSize: '0.9em',
  userSelect: 'none',
  minWidth: '80px',
  textAlign: 'center',
  
  padding: `${props.theme.itemPadding}px`,
}));

const NUMBER_REGEX = /^[+-]?([0-9]*[.])?[0-9]+$/;

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
    if (state.hasFocus || !state.valid) return { input: state.input };
    return { input: `${Value.value(props.value)}` };
  }

  private onInputChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    
    this.setState({
      input: value,
      valid: NUMBER_REGEX.test(value)
    });
  };

  private update_ = () => {
    const { input } = this.state;
    if (!NUMBER_REGEX.test(input)) return;
    this.props.onValueChange(Value.copyValue(this.props.value, Number.parseFloat(input)));
  };

  private onFocus_ = (event: React.SyntheticEvent<HTMLInputElement>) => this.setState({
    hasFocus: true,
  });

  private onBlur_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.update_();
    this.setState({
      hasFocus: false,
    });
  };
  

  private onKeyDown_ = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return false;
    this.update_();
  };
  
  render() {
    const { props, state } = this;
    const { theme, style, className, name, value } = props;
    const { input } = state;
    const errorStyle: React.CSSProperties = {
      backgroundColor: !state.valid ? `rgba(255, 0, 0, 0.2)` : undefined,
    };

    
    return (
      <Field name={name} theme={theme} className={className} style={style}>
        <SubContainer theme={theme}>
          <Input
            type='text'
            style={errorStyle}
            onFocus={this.onFocus_}
            onBlur={this.onBlur_}
            onChange={this.onInputChange_}
            value={input}
            theme={theme}
            onKeyDown={this.onKeyDown_}
          />
          <UnitLabel theme={theme}>{Value.unitName(value)}</UnitLabel>
        </SubContainer>
      </Field>
    );
  }
}

export default ValueEdit;