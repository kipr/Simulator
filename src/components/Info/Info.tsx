import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import ScrollArea from '../ScrollArea';
import Section from '../Section';
import { ThemeProps } from '../theme';
import SensorWidget from './SensorWidget';
import { StyledText } from '../../util';
import Location from './Location';
import { Fa } from '../Fa';
import { ReferenceFrame } from '../../unit-math';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import { SceneAction } from '../../state/reducer';


export interface InfoProps extends StyleProps, ThemeProps {
}

interface ReduxInfoProps {
  startingOrigin: ReferenceFrame;
  onOriginChange: (origin: ReferenceFrame, modifyReferenceScene: boolean) => void;
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
  marginBottom: `${props.theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0
  }
}));

const Container = styled('div', (props: ThemeProps) => ({
  flex: '1 1',
  color: props.theme.color,
  overflow: 'hidden'
}));

const StyledSection = styled(Section, {
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


const ICON_STYLE: React.CSSProperties = {
  marginRight: '5px'
};

const SIMULATION_NAME = StyledText.text({
  text: 'Simulation',
});

const SERVOS_NAME = StyledText.text({
  text: 'Servos',
});

const MOTOR_VELOCITIES_NAME = StyledText.text({
  text: 'Motor Velocities',
});

const MOTOR_POSITIONS_NAME = StyledText.compose({
  items: [
    StyledText.text({
      text: 'Motor Positions',
    }),
  ]
});

const ANALOG_NAME = StyledText.text({
  text: 'Analog Sensors',
});

const DIGITAL_NAME = StyledText.text({
  text: 'Digital Sensors',
});

const ResetIcon = styled(Fa, ({ theme }: ThemeProps) => ({
  marginLeft: `${theme.itemPadding * 2}px`,
  opacity: 0.5,
  ':hover': {
    opacity: 1.0
  },
  transition: 'opacity 0.2s'
}));

class Info extends React.PureComponent<Props & ReduxInfoProps, State> {
  constructor(props: Props & ReduxInfoProps) {
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

  private onResetLocationClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onOriginChange(this.props.startingOrigin, false);
  };

  render() {
    const { props, state } = this;
    const {
      style,
      className,
      theme,
    } = props;
    const { collapsed } = state;

    const locationName = StyledText.compose({
      items: [
        StyledText.text({
          text: 'Start Location',
        }),
        StyledText.component({
          component: ResetIcon,
          props: {
            icon: 'sync',
            onClick: this.onResetLocationClick_,
            theme
          }
        })
      ]
    });

    const servos: JSX.Element[] = [];
    for (let i = 0; i < 4; ++i) {
      servos.push(
        <Row key={`servo-pos-${i}`} theme={theme}>
          <SensorWidget valueSelector={robotState => robotState.servoPositions[i]} name={`get_servo_position(${i})`} plotTitle='Servo Position Plot' theme={theme} />
        </Row>
      );
    }

    const motorVelocities: JSX.Element[] = [];
    for (let i = 0; i < 4; ++i) {
      motorVelocities.push(
        <Row key={`motor-velocity-${i}`} theme={theme}>
          <SensorWidget valueSelector={robotState => robotState.motorSpeeds[i]} name={`motor ${i}`} plotTitle='Motor Velocity Plot' theme={theme} />
        </Row>
      );
    }

    const motorPositions: JSX.Element[] = [];
    for (let i = 0; i < 4; ++i) {
      motorPositions.push(
        <Row key={`motor-pos-${i}`} theme={theme}>
          <SensorWidget valueSelector={robotState => robotState.motorPositions[i]} name={`get_motor_position_counter(${i})`} plotTitle='Motor Position Plot' theme={theme} />
        </Row>
      );
    }

    const analogSensors: JSX.Element[] = [];
    for (let i = 0; i < 6; ++i) {
      analogSensors.push(
        <Row key={`analog-${i}`} theme={theme}>
          <SensorWidget valueSelector={robotState => robotState.analogValues[i]} name={`analog(${i})`} plotTitle='Analog Sensor Plot' theme={theme} />
        </Row>
      );
    }

    const digitalSensors: JSX.Element[] = [];
    for (let i = 0; i < 6; ++i) {
      digitalSensors.push(
        <Row key={`digital-${i}`} theme={theme}>
          <SensorWidget valueSelector={robotState => robotState.digitalValues[i]} name={`digital(${i})`} plotTitle='Digital Sensor Plot' theme={theme} />
        </Row>
      );
    }
    
    return (
      <ScrollArea theme={theme} style={{ flex: '1 1' }}>
        <Container theme={theme} style={style} className={className}>
          <StyledSection
            name={locationName}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('location')}
            collapsed={collapsed['location']}
          >
            <Location
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

export default connect<unknown, unknown, InfoProps, ReduxState>((state: ReduxState) => {
  const startingOrigin = state.scene.referenceScene.robot?.origin || ReferenceFrame.IDENTITY;
  return {
    startingOrigin,
  };
}, dispatch => ({
  onOriginChange: (origin: ReferenceFrame, modifyReferenceScene: boolean) => {
    dispatch(SceneAction.setRobotOrigin({ origin, modifyReferenceScene }));
  }
}))(Info) as React.ComponentType<InfoProps>;