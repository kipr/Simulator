import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Angle, Distance, Mass, Value } from '../../util';
import { ThemeProps } from '../theme';
import Field from '../Field';
import ComboBox from '../ComboBox';
import LocalizedString from '../../util/LocalizedString';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import tr from '@i18n';

export interface ValueEditPublicProps extends ThemeProps, StyleProps {
  name: string;
  long?: boolean;
  value: Value;
  onValueChange: (value: Value) => void;
}

interface ValueEditPrivateProps {
  locale: LocalizedString.Language;
}



interface ValueEditState {
  input: string;
  hasFocus: boolean;
  valid: boolean;
  unitFocus: boolean;
}

type Props = ValueEditPublicProps & ValueEditPrivateProps;
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
    const { theme, style, className, name, value, long, locale } = props;
    const { input, unitFocus } = state;
    const errorStyle: React.CSSProperties = {
      backgroundColor: !state.valid ? `rgba(255, 0, 0, 0.2)` : undefined,
    };

    const massOptions: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('grams'), locale), Mass.Type.Grams),
      ComboBox.option(LocalizedString.lookup(tr('kilograms'), locale), Mass.Type.Kilograms),
      ComboBox.option(LocalizedString.lookup(tr('pounds'), locale), Mass.Type.Pounds),
      ComboBox.option(LocalizedString.lookup(tr('ounces'), locale), Mass.Type.Ounces),
    ];
    
    const distanceOptions: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('meters'), locale), 'meters'),
      ComboBox.option(LocalizedString.lookup(tr('centimeters'), locale), 'centimeters'),
      ComboBox.option(LocalizedString.lookup(tr('feet'), locale), 'feet'),
      ComboBox.option(LocalizedString.lookup(tr('inches'), locale), 'inches'),
    ];
    
    const angleOptions: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('radians'), locale), Angle.Type.Radians),
      ComboBox.option(LocalizedString.lookup(tr('degrees'), locale), Angle.Type.Degrees),
    ];
    
    const VALUE_OPTIONS: { [key: number]: ComboBox.Option[] } = {
      [Value.Type.Angle]: angleOptions,
      [Value.Type.Distance]: distanceOptions,
      [Value.Type.Mass]: massOptions,
    };

    const unitOptions = VALUE_OPTIONS[value.type];

    return (
      <Field name={name} theme={theme} long={long} className={className} style={style}>
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
              index={unitOptions.findIndex(o => o.data === Value.subType(value))}
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

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(ValueEdit) as React.ComponentType<ValueEditPublicProps>;