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
import { ScenesAction } from '../../state/reducer';
import Node from '../../state/State/Scene/Node';
import Motor from '../../AbstractRobot/Motor';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import Async from '../../state/State/Async';

import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';


export interface InfoPublicProps extends StyleProps, ThemeProps {
  node: Node.Robot;

  onOriginChange: (origin: ReferenceFrame) => void;
}

interface InfoPrivateProps {
  locale: LocalizedString.Language;
}

interface InfoState {
  collapsed: { [section: string]: boolean }
}

type Props = InfoPublicProps & InfoPrivateProps;
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



const ResetIcon = styled(Fa, ({ theme }: ThemeProps) => ({
  marginLeft: `${theme.itemPadding * 2}px`,
  opacity: 0.5,
  ':hover': {
    opacity: 1.0
  },
  transition: 'opacity 0.2s'
}));

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

  private onResetLocationClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onOriginChange(this.props.node.startingOrigin);
  };

  render() {
    const { props, state } = this;
    const {
      style,
      className,
      theme,
      node,
      locale
    } = props;

    if (!node || node.type !== 'robot') return null;

    const { collapsed } = state;

    const locationName = StyledText.compose({
      items: [
        StyledText.text({
          text: LocalizedString.lookup(tr('Start Location'), locale),
        }),
        StyledText.component({
          component: ResetIcon,
          props: {
            icon: faSync,
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
          <SensorWidget value={node.state.servos[i].position} name={`get_servo_position(${i})`} plotTitle='Servo Position Plot' theme={theme} />
        </Row>
      );
    }

    const motorVelocities: JSX.Element[] = [];
    const motorPositions: JSX.Element[] = [];

    for (let i = 0; i < 4; ++i) {
      const motor = node.state.motors[i];
      motorVelocities.push(
        <Row key={`motor-velocity-${i}`} theme={theme}>
          <SensorWidget value={motor.mode !== Motor.Mode.Pwm ? motor.speedGoal : 0} name={`motor ${i}`} plotTitle={LocalizedString.lookup(tr('Motor Velocity Plot'), locale)} theme={theme} />
        </Row>
      );

      motorPositions.push(
        <Row key={`motor-pos-${i}`} theme={theme}>
          <SensorWidget value={motor.position} name={`get_motor_position_counter(${i})`} plotTitle={LocalizedString.lookup(tr('Motor Position Plot'), locale)} theme={theme} />
        </Row>
      );
    }

    const analogSensors: JSX.Element[] = [];
    for (let i = 0; i < 6; ++i) {
      analogSensors.push(
        <Row key={`analog-${i}`} theme={theme}>
          <SensorWidget value={node.state.analogValues[i]} name={`analog(${i})`} plotTitle={LocalizedString.lookup(tr('Analog Sensor Plot'), locale)} theme={theme} />
        </Row>
      );
    }

    const digitalSensors: JSX.Element[] = [];
    for (let i = 0; i < 6; ++i) {
      digitalSensors.push(
        <Row key={`digital-${i}`} theme={theme}>
          <SensorWidget value={node.state.digitalValues[i]} name={`digital(${i})`} plotTitle={LocalizedString.lookup(tr('Digital Sensor Plot'), locale)} theme={theme} />
        </Row>
      );
    }

    const analogName = StyledText.text({
      text: LocalizedString.lookup(tr('Analog Sensors'), locale),
    });
    
    const digitalName = StyledText.text({
      text: LocalizedString.lookup(tr('Digital Sensors'), locale),
    });

    const servosName = StyledText.text({
      text: LocalizedString.lookup(tr('Servos'), locale),
    });
    
    const motorVelocitiesName = StyledText.text({
      text: LocalizedString.lookup(tr('Motor Velocities'), locale),
    });
    
    const motorPositionsName = StyledText.compose({
      items: [
        StyledText.text({
          text: LocalizedString.lookup(tr('Motor Positions'), locale),
        }),
      ]
    });
    
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
              origin={node.startingOrigin}
              onOriginChange={props.onOriginChange}
              locale={locale}
            />
          </StyledSection>
          <StyledSection
            name={servosName}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('servo_pos')}
            collapsed={collapsed['servo_pos']}
          >
            {servos}
          </StyledSection>
          <StyledSection
            name={motorVelocitiesName}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('motor_vel')}
            collapsed={collapsed['motor_vel']}
          >
            {motorVelocities}
          </StyledSection>
          <StyledSection
            name={motorPositionsName}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('motor_pos')}
            collapsed={collapsed['motor_pos']}
          >
            {motorPositions}
          </StyledSection>
          <StyledSection
            name={analogName}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('analog')}
            collapsed={collapsed['analog']}
          >
            {analogSensors}
          </StyledSection>
          <StyledSection
            name={digitalName}
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

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}))(Info) as React.ComponentType<InfoPublicProps>;