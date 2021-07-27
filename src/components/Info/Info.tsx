import * as React from 'react';

import { styled } from 'styletron-react';
import { RobotState } from '../../RobotState';
import { StyleProps } from '../../style';
import ScrollArea from '../ScrollArea';
import Section from '../Section';
import { ThemeProps } from '../theme';
import SensorWidget from './SensorWidget';
import { StyledText } from '../../util';
import { Simulation } from './Simulation';
import { RobotPosition } from '../../RobotPosition';


export interface InfoProps extends StyleProps, ThemeProps {
  robotState: RobotState;
  robotStartPosition: RobotPosition;

  onSetRobotStartPosition: (position: RobotPosition) => void;
}

interface InfoState {
  collapsed: { [section: string]: boolean }
}

type Props = InfoProps;
type State = InfoState;

const Row = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  flexBasis: 0,
  alignItems: 'center',
  marginBottom: `${props.theme.itemPadding}px`,
  ':last-child': {
    marginBottom: 0
  }
}));

const Container = styled('div', (props: ThemeProps) => ({
  flex: '1 1',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  padding: `${props.theme.widget.padding}px`,
  overflow: 'hidden'
}));

const StyledSection = styled(Section, {
  marginTop: '10px',
  ':first-child': {
    marginTop: 0
  },
});

const ItemName = styled('label', (props: ThemeProps) => ({
  flex: '1 1 0',
  borderRight: `1px solid ${props.theme.borderColor}`
}));

const Input = styled('input', (props: ThemeProps) => ({
  flex: '1 1 0',
  borderRadius: `${props.theme.itemPadding}px`,
  font: 'inherit',
  border: 'none',
  backgroundColor: 'transparent',
  color: props.theme.color,
  ':focus': {
    outline: 'none'
  }
}));

const NAME_STYLE: React.CSSProperties = {
  fontSize: '1.2em'
};

const SIMULATION_NAME = StyledText.text({
  text: 'Simulation',
  style: NAME_STYLE
});

const SERVOS_NAME = StyledText.text({
  text: 'Servos',
  style: NAME_STYLE
});

const MOTOR_VELOCITIES_NAME = StyledText.text({
  text: 'Motor Velocities',
  style: NAME_STYLE
});

const MOTOR_POSITIONS_NAME = StyledText.text({
  text: 'Motor Positions',
  style: NAME_STYLE
});

const ANALOG_NAME = StyledText.text({
  text: 'Analog Sensors',
  style: NAME_STYLE
});

const DIGITAL_NAME = StyledText.text({
  text: 'Digital Sensors',
  style: NAME_STYLE
});

class Info extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      collapsed: {}
    };
  }

  private onCollapsedChange_ = (section: string) => (collapsed: boolean) => {
    this.setState({
      collapsed: {
        ...this.state.collapsed,
        [section]: collapsed
      }
    });
  };

  render() {
    const { props, state } = this;
    const {
      style,
      className,
      theme,
      robotState,
      robotStartPosition,
    } = props;
    const { collapsed } = state;

    const servos = robotState.servoPositions.map((value, i) => (
      <Row key={`servo-pos-${i}`} theme={theme}>
        <SensorWidget value={value} name={`get_servo_position(${i})`} plotTitle='Servo Position Plot' theme={theme} />
      </Row>
    ));

    const motorVelocities = robotState.motorSpeeds.map((value, i) => (
      <Row key={`motor-velocity-${i}`} theme={theme}>
        <SensorWidget value={value} name={`motor ${i}`} plotTitle='Motor Velocity Plot' theme={theme} />
      </Row>
    ));

    const motorPositions = robotState.motorPositions.map((value, i) => (
      <Row key={`motor-pos-${i}`} theme={theme}>
        <SensorWidget value={value} name={`get_motor_position_counter(${i})`} plotTitle='Motor Position Plot' theme={theme} />
      </Row>
    ));

    const analogSensors = robotState.analogValues.map((value, i) => (
      <Row key={`analog-${i}`} theme={theme}>
        <SensorWidget value={value} name={`analog(${i})`} plotTitle='Analog Sensor Plot' theme={theme} />
      </Row>
    ));

    const digitalSensors = robotState.digitalValues.map((value, i) => (
      <Row key={`digital-${i}`} theme={theme}>
        <SensorWidget value={value} name={`digital(${i})`} plotTitle='Digital Sensor Plot' theme={theme} />
      </Row>
    ));
    
    return (
      <ScrollArea theme={theme} style={{ flex: '1 1' }}>
        <Container theme={theme} style={style} className={className}>
          <StyledSection
            name={SIMULATION_NAME}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('simulation')}
            collapsed={collapsed['simulation']}
          >
            <Simulation
              robotStartPosition={robotStartPosition}
              onSetRobotStartPosition={this.props.onSetRobotStartPosition}
              theme={theme}
            />
          </StyledSection>
          <StyledSection
            name={SERVOS_NAME}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('servo_pos')}
            collapsed={collapsed['servo_pos']}
          >
            {servos}
          </StyledSection>
          <StyledSection
            name={MOTOR_VELOCITIES_NAME}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('motor_vel')}
            collapsed={collapsed['motor_vel']}
          >
            {motorVelocities}
          </StyledSection>
          <StyledSection
            name={MOTOR_POSITIONS_NAME}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('motor_pos')}
            collapsed={collapsed['motor_pos']}
          >
            {motorPositions}
          </StyledSection>
          <StyledSection
            name={ANALOG_NAME}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('analog')}
            collapsed={collapsed['analog']}
          >
            {analogSensors}
          </StyledSection>
          <StyledSection
            name={DIGITAL_NAME}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('digital')}
            collapsed={collapsed['digital']}
          >
            {digitalSensors}
          </StyledSection>
        </Container>
      </ScrollArea>
    );
  }
}

export default Info;