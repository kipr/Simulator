import { StyleProps } from '../../util/style';
import { ThemeProps } from '../constants/theme';
import * as React from 'react';
import { styled } from 'styletron-react';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import ResizeableComboBox from '../../components/interface/ResizeableComboBox';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import DynamicGauge from '../../components/interface/DynamicGauge';
import Node from '../../state/State/Scene/Node';
import WorkerInstance from '../../programming/WorkerInstance';
import AbstractRobot from '../../programming/AbstractRobot';
import Motor from '../../programming/AbstractRobot/Motor';
import Button from '../../components/interface/Button';

export interface EffectorControlPublicProps extends StyleProps, ThemeProps {
  shownComponent: 'servo' | 'motor';
  node: Node.Robot;
}

interface EffectorControlPrivateProps {
  locale: LocalizedString.Language;
}

interface EffectorControlState {
  shownServo: number;
  shownMotor: number;
  customTickValueConfig?: {};
  customTickLineConfig?: {};

  servoInputStyle: React.CSSProperties;
  motorInputStyle: React.CSSProperties;


}
interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = EffectorControlPublicProps & EffectorControlPrivateProps;
type State = EffectorControlState;

const MotorStopButton = styled(Button, (props: ThemeProps & ClickProps) => ({
  backgroundColor: !props.disabled ? props.theme.noButtonColor.standard : 'lightgrey',
  border: !props.disabled ? `1px solid ${props.theme.noButtonColor.border}` : '1px solid lightgrey',
  ':hover':
    props.onClick && !props.disabled
      ? {
        pointer: 'cursor',
        backgroundColor: props.theme.noButtonColor.hover
      }
      : { pointer: 'not-allowed' },
  color: props.theme.noButtonColor.textColor,
  fontSize: '1.2em',
  fontWeight: 500,
  textShadow: props.theme.noButtonColor.textShadow,

}));

const EffectorContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  //padding: `${props.theme.itemPadding * 2}px`,
}));
const ServoControlContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  //padding: `${props.theme.itemPadding * 2}px`,
}));
const ControlContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '2.5em'
});
const SectionInfoText = styled('span', {
  paddingRight: '5px',
  fontSize: '1.2em',
});

const StyledResizeableComboBox = styled(ResizeableComboBox, {
  flex: '1 0',
  padding: '3px',
});
const SettingContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  justifyContent: 'center',
  padding: `${props.theme.itemPadding * 1}px`,
}));


class EffectorControl extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      shownServo: 0,
      shownMotor: 0,
      customTickValueConfig: {
        style: { fontSize: '1.2em', fill: this.props.theme.themeName === 'DARK' ? '#FFFFFF' : '#000000' },
      },
      customTickLineConfig: {
        color: this.props.theme.themeName === 'DARK' ? '#FFFFFF' : '#000000',
        length: 11
      },
      servoInputStyle: this.props.theme.themeName === 'DARK' ?
        {
          width: '80%',
          appearance: 'none',
          height: '6px',
          borderRadius: '3px',
          background: `linear-gradient(to right,#AD4C4B 0%,#AD4C4B 10%,#4aad52 10%,#4aad52 90%,#AD4C4B 90%,#AD4C4B 100%)`,
          outline: 'none'
        } : {
          width: '80%',
          appearance: 'none',
          height: '6px',
          borderRadius: '3px',
          background: `linear-gradient(to right,#FF4E4E 0%,#FF4E4E 10%,#2BDE3F 10%,#2BDE3F 90%,#FF4E4E 90%,#FF4E4E 100%)`,
          outline: 'none'
        },
      motorInputStyle: this.props.theme.themeName === 'DARK' ?
        {
          width: '80%',
          appearance: 'none',
          height: '6px',
          borderRadius: '3px',
          background: `linear-gradient(to right,#AD4C4B 0%,#AD4C4B 50%,#4aad52 50%,#4aad52 100%)`,
          outline: 'none'
        } : {
          width: '80%',
          appearance: 'none',
          height: '6px',
          borderRadius: '3px',
          background: `linear-gradient(to right,#FF4E4E 0%,#FF4E4E 50%,#2BDE3F 50%,#2BDE3F 100%)`,
          outline: 'none'
        },
    };
  }
  private onServoSelect_ = (index: number, option: ResizeableComboBox.Option) => {
    const shownServo = option.data as number;
    this.setState({ shownServo });

  }

  private onMotorSelect_ = (index: number, option: ResizeableComboBox.Option) => {
    const shownMotor = option.data as number;
    this.setState({ shownMotor });
  }

  // Get motor velocity value to display on gauge
  // Matches Info.tsx: motor.mode !== Motor.Mode.Pwm ? motor.speedGoal : 0
  private getMotorGaugeValue_ = (): number => {
    const motor = this.props.node.state.motors[this.state.shownMotor];
    // Return speedGoal if not in PWM mode, otherwise 0 (matching Info.tsx)
    const value = motor.mode !== Motor.Mode.Pwm ? motor.speedGoal : 0;
    // Ensure we return a valid number (not NaN or undefined)
    return isNaN(value) || value === undefined ? 0 : value;
  }

  // Get sub arcs for motor gauge (centered around 1024 for neutral)
  private getMotorSubArcs_ = () => {
    return [
      {
        limit: 512, // Backward range
        color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
      },
      {
        limit: 1536, // Forward range
        color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
      },
      {
        limit: 2047,
        color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
        tooltip: {
          text: 'Maximum forward speed'
        }
      }
    ];
  }

  private onServoChange_ = (value: number) => {
    // Clamp the value to valid servo range (0-2047)
    const clampedValue = Math.max(0, Math.min(2047, Math.round(value)));

    // Get the current robot state
    const currentState = this.props.node.state;

    // Create a new servos array with the updated position for the selected servo
    const updatedServos: AbstractRobot.Stateless.Servos = [
      ...currentState.servos
    ] as AbstractRobot.Stateless.Servos;

    // Update the selected servo's position while preserving its enabled state
    updatedServos[this.state.shownServo] = {
      ...updatedServos[this.state.shownServo],
      position: clampedValue
    };

    // Create a new Stateless object with the updated servo position
    const updatedState = new AbstractRobot.Stateless(
      currentState.motors,
      updatedServos,
      currentState.analogValues,
      currentState.digitalValues
    );

    // Sync the updated state to the WorkerInstance, which will update the shared registers
    WorkerInstance.sync(updatedState);
  };

  private onMotorChange_ = (value: number) => {
    // Clamp the value to valid velocity range (-1500 to 1500)
    // The gauge now uses -1500 to 1500 directly, matching Info.tsx display
    const velocityValue = Math.max(-1500, Math.min(1500, Math.round(value)));

    // Get the current robot state
    const currentState = this.props.node.state;

    // Create a new motors array with the updated velocity for the selected motor
    const updatedMotors: AbstractRobot.Stateless.Motors = [
      ...currentState.motors
    ] as AbstractRobot.Stateless.Motors;

    // Get the current motor to preserve its position and other state
    const currentMotor = currentState.motors[this.state.shownMotor];

    // Update the selected motor to use Speed mode with the target velocity
    // Speed mode will maintain a constant velocity
    updatedMotors[this.state.shownMotor] = {
      ...currentMotor,
      mode: Motor.Mode.Speed, // Set mode to Speed for velocity control
      speedGoal: velocityValue, // Set the target velocity (-1500 to 1500)
      positionGoal: currentMotor.position, // Preserve current position goal (not used in Speed mode)
      pwm: 0, // PWM is not used in Speed mode
      direction: velocityValue === 0 ? Motor.Direction.Idle :
        (velocityValue > 0 ? Motor.Direction.Forward : Motor.Direction.Backward),
      done: true// Mark as done when velocity is 0 (stopped)
    };

    // Create a new Stateless object with the updated motor values
    const updatedState = new AbstractRobot.Stateless(
      updatedMotors,
      currentState.servos,
      currentState.analogValues,
      currentState.digitalValues
    );

    console.log("Updated Motor State:", updatedMotors[this.state.shownMotor]);

    // Sync the updated state to the WorkerInstance, which will update the shared registers
    WorkerInstance.sync(updatedState);
  }

  private stopAllMotors_ = () => {
    const currentState = this.props.node.state;

    // Create a new motors array with all motors stopped
    const updatedMotors: AbstractRobot.Stateless.Motors = currentState.motors.map((motor) => ({
      ...motor,
      mode: Motor.Mode.Pwm, // Set mode to PWM for stopping
      speedGoal: 0,
      pwm: 0,
      direction: Motor.Direction.Idle,
      done: true
    })) as AbstractRobot.Stateless.Motors;

    // Create a new Stateless object with the updated motor values
    const updatedState = new AbstractRobot.Stateless(
      updatedMotors,
      currentState.servos,
      currentState.analogValues,
      currentState.digitalValues
    );

    console.log("Stopping All Motors. Updated States:", updatedMotors);
    // Sync the updated state to the WorkerInstance
    WorkerInstance.sync(updatedState);
  }

  render() {
    const { props, state } = this;
    const {
      style,
      shownComponent,
      locale,
      theme,
    } = props;
    const { servoInputStyle } = state;
    const servoSubArcs = [
      {
        limit: 100,
        //color: '#AD4C4B'
        color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
        tooltip: {
          text: 'Warning! Could damage servo in this range'
        }
      },
      {
        limit: 1947,
        color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
      },
      {
        limit: 2047,
        color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
        tooltip: {
          text: 'Warning! Could damage servo in this range'
        }
      }
    ];
    const motorSubArcs = [
      {
        limit: 0,
        color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
        tooltip: {
          text: 'Reverse'
        }
      },
      {
        limit: 1500,
        color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
        tooltip: {
          text: 'Forward'
        }
      }
    ]
    const SERVO_OPTIONS = [
      { text: LocalizedString.lookup(tr('Servo 0'), locale), data: 0 },
      { text: LocalizedString.lookup(tr('Servo 1'), locale), data: 1 },
      { text: LocalizedString.lookup(tr('Servo 2'), locale), data: 2 },
      { text: LocalizedString.lookup(tr('Servo 3'), locale), data: 3 },
    ]
    let servoControl = (
      <ServoControlContainer theme={theme}>
        <ControlContainer style={{ marginTop: '0.9em' }}>
          <SectionInfoText style={{ fontSize: '1.44em' }}>{LocalizedString.lookup(tr('Servo Port:'), locale)}</SectionInfoText>
          <StyledResizeableComboBox
            options={SERVO_OPTIONS}
            index={SERVO_OPTIONS.findIndex(opt => opt.data === this.state.shownServo)}
            onSelect={this.onServoSelect_}
            theme={theme}
            mainWidth={'8.3em'}
            mainHeight={'2em'}
            mainFontSize={'1em'}

          />

        </ControlContainer>
        <DynamicGauge
          minValue={0}
          maxValue={2047}
          initialValue={1024}
          theme={theme}
          onDialChange={this.onServoChange_}
          margins={{ top: 0.07, bottom: 0.02, left: 0.12, right: 0.12 }}
          changeValue={this.props.node.state.servos[this.state.shownServo].position}
          customTickValueConfig={this.state.customTickValueConfig}
          customTickLineConfig={this.state.customTickLineConfig}
          inputStyle={this.state.servoInputStyle}
          subArcs={servoSubArcs}
        />
      </ServoControlContainer>
    )

    const MOTOR_OPTIONS = [
      { text: LocalizedString.lookup(tr('Motor 0'), locale), data: 0 },
      { text: LocalizedString.lookup(tr('Motor 1'), locale), data: 1 },
      { text: LocalizedString.lookup(tr('Motor 2'), locale), data: 2 },
      { text: LocalizedString.lookup(tr('Motor 3'), locale), data: 3 },
    ]

    let motorControl = (
      <ServoControlContainer theme={theme}>
        <ControlContainer style={{ marginTop: '0.9em' }}>
          <SectionInfoText style={{ fontSize: '1.44em' }}>{LocalizedString.lookup(tr('Motor Port:'), locale)}</SectionInfoText>
          <StyledResizeableComboBox
            options={MOTOR_OPTIONS}
            index={MOTOR_OPTIONS.findIndex(opt => opt.data === this.state.shownMotor)}
            onSelect={this.onMotorSelect_}
            theme={theme}
            mainWidth={'8.3em'}
            mainHeight={'2em'}
            mainFontSize={'1em'}

          />

        </ControlContainer>
        <DynamicGauge
          minValue={-1500}
          maxValue={1500}
          initialValue={0}
          theme={theme}
          onDialChange={this.onMotorChange_}
          margins={{ top: 0.07, bottom: 0.02, left: 0.12, right: 0.12 }}
          changeValue={this.getMotorGaugeValue_()}
          customTickValueConfig={this.state.customTickValueConfig}
          customTickLineConfig={this.state.customTickLineConfig}
          inputStyle={this.state.motorInputStyle}
          subArcs={motorSubArcs}
        />
        <SettingContainer theme={theme}>
          <MotorStopButton onClick={() => this.stopAllMotors_()} theme={theme}>
            {LocalizedString.lookup(tr('Stop All Motors'), locale)}
          </MotorStopButton>
          {/* <MotorStopButton disabled={Number(this.state.shownMotorValue) === 0} onClick={() => this.stopCurrentMotor_()} theme={theme} >
            {LocalizedString.lookup(tr('Stop Current Motor'), locale)}
          </MotorStopButton> */}
        </SettingContainer>
      </ServoControlContainer>
    )



    return (
      <EffectorContainer theme={theme}>
        {shownComponent === 'servo' ? servoControl : motorControl}
      </EffectorContainer>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}))(EffectorControl) as React.ComponentType<EffectorControlPublicProps>;
