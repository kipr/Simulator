import * as React from 'react';
import { GaugeComponent } from 'react-gauge-component';
import { ThemeProps } from "../constants/theme";
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { SubArc } from 'react-gauge-component';
interface DynamicGaugeProps extends ThemeProps, StyleProps {
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
  margins?: { top: number; bottom: number; left: number; right: number };
  arcColors?: string[];
  arcLimits?: { limit: number }[];
  changeValue?: number;
  subArcs?: SubArc[];
  customTickValueConfig?: {};
  customTickLineConfig?: {};
  onDialChange?: (value: number) => void;
  inputStyle?: React.CSSProperties;
}

interface DynamicGaugeState {
  value: number;
  isEditing: boolean;
  draftValue: number;
}
interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = DynamicGaugeProps;
type State = DynamicGaugeState;



const GaugeValue = styled('div', (props: ThemeProps & ClickProps) => ({
  fontSize: '2em',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverOptionBackground
  },
  backgroundColor: props.theme.unselectedBackground,

  width: '6ch',
  height: '100%',
  padding: '0.3em',
  boxShadow: props.theme.themeName === 'DARK' ? '0px 0px 15px 3px rgba(0,0,0,0.4)' : '0px 0px 15px 3px rgba(175, 80, 128, 0.2)',
  ':active': props.onClick && !props.disabled
    ? {
      boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
      transform: 'translateY(1px, 1px)',
    }
    : {},

  marginBottom: '3%'

}));

const GaugeInput = styled('input', {
  fontSize: '2.5em',
  marginBottom: '3%',
  width: '5ch',
  textAlign: 'center',
  height: '100%',
  backgroundColor: 'lightgrey'
});


export class DynamicGauge extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Initialize draftValue from changeValue if available, otherwise use initialValue
    const initialDraftValue = props.changeValue !== undefined && !isNaN(props.changeValue) 
      ? Math.round(props.changeValue) 
      : (props.initialValue !== undefined ? Math.round(props.initialValue) : 0);
    
    this.state = {
      value: props.initialValue,
      isEditing: false,
      draftValue: initialDraftValue
    };
  }

  componentDidMount(): void {
    // Update both value and draftValue if changeValue is provided
    if (this.props.changeValue !== undefined && !isNaN(this.props.changeValue)) {
      const roundedValue = Math.round(this.props.changeValue);
      this.setState({ value: roundedValue, draftValue: roundedValue });
    }
  }
  componentDidUpdate(prevProps: Readonly<DynamicGaugeProps>, prevState: Readonly<DynamicGaugeState>, snapshot?: any): void {
    // Update draftValue when changeValue changes, handling undefined/NaN cases
    // Only update if changeValue actually changed and is different from current draftValue
    // This prevents resetting the value while user is actively dragging the slider
    if (prevProps.changeValue !== this.props.changeValue) {
      const newValue = this.props.changeValue !== undefined && !isNaN(this.props.changeValue)
        ? Math.round(this.props.changeValue)
        : (this.props.initialValue !== undefined ? Math.round(this.props.initialValue) : 0);
      // Only update if the new value is actually different from current draftValue
      // This prevents resetting during user interaction
      if (Math.abs(newValue - this.state.draftValue) > 0.1) {
        this.setState({ draftValue: newValue });
      }
    }
  }
  handleChange = (e) => {
    const value = e.target.value;
    if (value <= this.props.maxValue && value >= this.props.minValue) {

      this.setState({ draftValue: value });
    }
  };

  handleSliderChange = (e) => {
    const newValue = e.target.value;
    const parsed = Number(newValue);
    // Update draftValue and immediately call onDialChange with the parsed value
    // This ensures the first change is registered even if componentDidUpdate resets it
    this.setState({ draftValue: parsed }, () => {
      if (!isNaN(parsed)) {
        this.props.onDialChange?.(parsed);
      }
    });
  }
  handleBlur = () => {
    const parsed = Number(this.state.draftValue);
    if (!isNaN(parsed)) {
      this.props.onDialChange?.(parsed);
    }
    this.setState({ isEditing: false });
  };

  handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  setIsEditing = (isEditing: boolean) => {

    this.setState({ isEditing });
  }
  handleClick = (e) => {
    e.stopPropagation();
    this.setState({ isEditing: true, draftValue: this.props.changeValue });
  }
  render() {
    const defaultMargins = { top: 0.07, bottom: 0.02, left: 0.07, right: 0.07 };
    const { isEditing, draftValue } = this.state;
    const {
      minValue = 0,
      maxValue = 100,
      margins,
      theme,
      inputStyle,
    } = this.props;

    return (
      <div style={{ ...this.props.style, display: 'flex', flexDirection: 'column', alignContent: 'center', width: '95%', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
        <GaugeComponent
          value={Number(draftValue)}
          minValue={minValue}
          maxValue={maxValue}
          type="semicircle"
          marginInPercent={this.props.margins ? margins : defaultMargins}
          arc={{
            padding: 0.005,
            cornerRadius: 1,
            subArcs: this.props.subArcs
          }}
          labels={{
            valueLabel: { hide: true },
            tickLabels: {
              ticks: [{ value: 0 }],
              defaultTickValueConfig: this.props.customTickValueConfig ? this.props.customTickValueConfig : {},
              defaultTickLineConfig: this.props.customTickLineConfig ? this.props.customTickLineConfig : {}
            }
          }}

          style={{ width: '100%', height: '100%' }}
        />


        {/* Input gauge value number */}
        {isEditing ? (
          <GaugeInput
            value={draftValue}
            onChange={this.handleChange}
            onKeyDown={this.handleEnterPress}
            onBlur={this.handleBlur}
            autoFocus
          />
        ) : (
          <GaugeValue theme={theme} onClick={this.handleClick}>
            {draftValue}
          </GaugeValue>
        )
        }

        {/* Dynamic Control for Moving the Pointer */}

        <input
          type="range"
          min={minValue}
          max={maxValue}
          value={draftValue}
          onChange={this.handleSliderChange}
          style={inputStyle ? inputStyle : { width: '80%' }}
        />


      </div>
    );
  }
}

export default DynamicGauge;