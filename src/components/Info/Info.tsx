import * as React from 'react';

import { styled } from 'styletron-react';
import { RobotState } from '../../RobotState';
import { StyleProps } from '../../style';
import ScrollArea from '../ScrollArea';
import Section from '../Section';
import { ThemeProps } from '../theme';
import SensorWidget from './SensorWidget';
import { Angle, Distance, StyledText } from '../../util';
import { Simulation } from './Simulation';


export interface InfoProps extends StyleProps, ThemeProps {
  robotState: RobotState;
  sensorNoise: boolean;

  onRobotStateChange: (robotState: RobotState) => void;
  onSensorNoiseChange: (enabled: boolean) => void;
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

const MOTORS_NAME = StyledText.text({
  text: 'Motors',
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

  private onXChange_ = (x: Distance) => {
    const { props } = this;
    const { robotState } = props;
    const nextRobotState = { ...robotState };
    nextRobotState.x = x.value;
    console.log(nextRobotState, x);
    this.props.onRobotStateChange(nextRobotState);
  };

  private onYChange_ = (y: Distance) => {
    const { props } = this;
    const { robotState } = props;
    const nextRobotState = { ...robotState };
    nextRobotState.y = y.value;
    this.props.onRobotStateChange(nextRobotState);
  };

  private onZChange_ = (z: Distance) => {
    const { props } = this;
    const { robotState } = props;
    const nextRobotState = { ...robotState };
    nextRobotState.z = z.value;
    this.props.onRobotStateChange(nextRobotState);
  };

  private onThetaChange_ = (theta: Angle) => {
    const { props } = this;
    const { robotState } = props;
    const nextRobotState = { ...robotState };
    nextRobotState.theta = theta.value;
    this.props.onRobotStateChange(nextRobotState);
  };

  private onSensorNoiseChange_ = (enabled: boolean) => {
    this.props.onSensorNoiseChange(enabled);
  };

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
      sensorNoise,
      onRobotStateChange
    } = props;
    const { collapsed } = state;

    const motorPositions = robotState.motorPositions.map((value, i) => (
      <Row key={`motor-pos-${i}`} theme={theme}>
        <SensorWidget value={value} name={`get_motor_position_counter(${i})`} theme={theme} />
      </Row>
    ));

    const analogSensors = robotState.analogValues.map((value, i) => (
      <Row key={`analog-${i}`} theme={theme}>
        <SensorWidget value={value} name={`analog(${i})`} theme={theme} />
      </Row>
    ));

    const digitalSensors = robotState.digitalValues.map((value, i) => (
      <Row key={`digital-${i}`} theme={theme}>
        <SensorWidget value={value} name={`digital(${i})`} theme={theme} />
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
              x={Distance.meters(robotState.x)}
              y={Distance.meters(robotState.y)}
              z={Distance.meters(robotState.z)}
              theta={Angle.degrees(robotState.theta)}
              sensorNoise={sensorNoise}
              onXChange={this.onXChange_}
              onYChange={this.onYChange_}
              onZChange={this.onZChange_}
              onThetaChange={this.onThetaChange_}
              onSensorNoiseChange={this.onSensorNoiseChange_}
              theme={theme}
            />
          </StyledSection>
          <StyledSection
            name={MOTORS_NAME}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('motor')}
            collapsed={collapsed['motor']}
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