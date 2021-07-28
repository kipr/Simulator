import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Angle, Distance, EMPTY_OBJECT, Mass, Slow, Value } from '../../util';
import { ThemeProps } from '../theme';
import Field from '../Field';
import ComboBox from '../ComboBox';

export interface ValueEditProps extends ThemeProps, StyleProps {
  name: string;
  value: Value;
  onValueChange: (value: Value) => void;
}

interface ValueEditState {
  input: string;
  hasFocus: boolean;
  valid: boolean;
  unitFocus: boolean;
}

type Props = ValueEditProps;
type State = ValueEditState;

const SubContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  flex: '1 1',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  border: `1px solid ${props.theme.borderColor}`,
  overflowX: 'hidden',
  overflowY: 'visible',
  alignItems: 'center',
}));

const Input = styled('input', (props: ThemeProps) => ({
  flex: '1 1 0',
  minWidth: 0,
  font: 'inherit',
  display: 'block',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  color: props.theme.color,
  ':focus': {
    outline: 'none'
  },
  padding: `${props.theme.itemPadding * 2}px`,
  borderRight: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderRight: 'none'
  },
  borderLeft: 'none',
  borderTop: 'none',
  borderBottom: 'none',
  transition: 'background-color 0.2s',
  userSelect: 'auto'
  
}));

const UnitContainer = styled('div', (props: ThemeProps) => ({
  display: 'relative',
  width: '120px',
  overflow: 'visible'
}));

const StyledComboBox = styled(ComboBox, (props: ThemeProps) => ({
  width: '120px',
}));

const NUMBER_REGEX = /^[+-]?([0-9]*[.])?[0-9]+$/;

const MASS_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('grams', Mass.Type.Grams),
  ComboBox.option('kilograms', Mass.Type.Kilograms),
  ComboBox.option('pounds', Mass.Type.Pounds),
  ComboBox.option('ounces', Mass.Type.Ounces),
];

const DISTANCE_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('meters', Distance.Type.Meters),
  ComboBox.option('centimeters', Distance.Type.Centimeters),
  ComboBox.option('feet', Distance.Type.Feet),
  ComboBox.option('inches', Distance.Type.Inches),
];

const ANGLE_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('radians', Angle.Type.Radians),
  ComboBox.option('degrees', Angle.Type.Degrees),
];

const VALUE_OPTIONS: { [key: number]: ComboBox.Option[] } = {
  [Value.Type.Angle]: ANGLE_OPTIONS,
  [Value.Type.Distance]: DISTANCE_OPTIONS,
  [Value.Type.Mass]: MASS_OPTIONS,
};



export class ValueEdit extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      input: `${Value.value(props.value)}`,
      hasFocus: false,
      valid: true,
      unitFocus: false
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (state.hasFocus || !state.valid) return { input: state.input };
    return { input: `${Math.round(Value.value(props.value) * 1000) / 1000}` };
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

  private onUnitSelect_ = (index: number, option: ComboBox.Option) => {
    const { value } = this.props;

    let nextValue = value;
    switch (value.type) {
      case Value.Type.Angle: {
        nextValue = Value.angle(Angle.toType(value.angle, option.data as Angle.Type));
        break;
      }
      case Value.Type.Distance: {
        nextValue = Value.distance(Distance.toType(value.distance, option.data as Distance.Type));
        break;
      }
      case Value.Type.Mass: {
        nextValue = Value.mass(Mass.toType(value.mass, option.data as Mass.Type));
        break;
      }
      default: break;
    }


    this.props.onValueChange(nextValue);
  };

  private onUnitFocusChange_ = (focus: boolean) => {
    this.setState({
      unitFocus: focus,
    });
  };

  private unitRef_: ComboBox;
  private bindUnitRef_ = (ref: ComboBox) => {
    if (this.unitRef_) this.unitRef_.onFocusChange = undefined;
    this.unitRef_ = ref;
    if (this.unitRef_) this.unitRef_.onFocusChange = this.onUnitFocusChange_;
  };
  
  render() {
    const { props, state } = this;
    const { theme, style, className, name, value } = props;
    const { input, unitFocus } = state;
    const errorStyle: React.CSSProperties = {
      backgroundColor: !state.valid ? `rgba(255, 0, 0, 0.2)` : undefined,
    };

    const unitOptions = VALUE_OPTIONS[value.type];

    return (
      <Field name={name} theme={theme} className={className} style={style}>
        <SubContainer theme={theme} style={{ borderBottomRightRadius: unitFocus ? 0 : undefined }}>
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
          {value.type !== Value.Type.Unitless
            ? <StyledComboBox
              innerRef={this.bindUnitRef_}
              theme={theme}
              options={unitOptions}
              onSelect={this.onUnitSelect_}
              index={Value.subType(value)}
              minimal
              widthTweak={2}
            />
            : undefined
          }
        </SubContainer>
      </Field>
    );
  }
}

export default ValueEdit;