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
import { SceneAction, ScenesAction } from '../../state/reducer';
import Node from '../../state/State/Scene/Node';


export interface InfoProps extends StyleProps, ThemeProps {
  nodeId: string;
}

interface ReduxInfoProps {
  node: Node;
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
  text: 'Motor PWMs',
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
      node,
      startingOrigin
    } = props;

    if (!node || node.type !== 'robot') return null;

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
          <SensorWidget value={node.state.servos[i].position} name={`get_servo_position(${i})`} plotTitle='Servo Position Plot' theme={theme} />
        </Row>
      );
    }

    const motorVelocities: JSX.Element[] = [];
    const motorPositions: JSX.Element[] = [];

    for (let i = 0; i < 4; ++i) {
      const motor = node.state.getMotor(i);
      motorVelocities.push(
        <Row key={`motor-pwm-${i}`} theme={theme}>
          <SensorWidget value={motor.pwm} name={`motor ${i}`} plotTitle='Motor PWM Plot' theme={theme} />
        </Row>
      );

      motorPositions.push(
        <Row key={`motor-pos-${i}`} theme={theme}>
          <SensorWidget value={motor.position} name={`get_motor_position_counter(${i})`} plotTitle='Motor Position Plot' theme={theme} />
        </Row>
      );
    }

    const analogSensors: JSX.Element[] = [];
    for (let i = 0; i < 6; ++i) {
      analogSensors.push(
        <Row key={`analog-${i}`} theme={theme}>
          <SensorWidget value={node.state.analogValues[i]} name={`analog(${i})`} plotTitle='Analog Sensor Plot' theme={theme} />
        </Row>
      );
    }

    const digitalSensors: JSX.Element[] = [];
    for (let i = 0; i < 6; ++i) {
      digitalSensors.push(
        <Row key={`digital-${i}`} theme={theme}>
          <SensorWidget value={node.state.digitalValues[i]} name={`digital(${i})`} plotTitle='Digital Sensor Plot' theme={theme} />
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
              origin={startingOrigin}
              onOriginChange={props.onOriginChange}
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

export default connect<unknown, unknown, InfoProps, ReduxState>((state: ReduxState, ownProps: InfoProps) => {
  const refNode = state.scene.referenceScene.nodes[ownProps.nodeId];
  const node = state.scene.workingScene.nodes[ownProps.nodeId];
  return {
    startingOrigin: refNode.origin,
    node
  };
}, (dispatch, ownProps: InfoProps) => ({
  onOriginChange: (origin: ReferenceFrame, modifyReferenceScene: boolean) => {
    dispatch(SceneAction.setNodeOrigin({
      nodeId: ownProps.nodeId,
      origin,
      modifyReferenceScene
    }));
  }
}))(Info) as React.ComponentType<InfoProps>;