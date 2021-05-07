import * as React from 'react';

import { styled } from 'styletron-react';
import { RobotState } from '../../RobotState';
import { StyleProps } from '../../style';
import ScrollArea from '../ScrollArea';
import SensorPlot from '../SensorPlot';
import { ThemeProps } from '../theme';
import SensorWidget from './SensorWidget';


export interface InfoProps extends StyleProps, ThemeProps {
  robotState: RobotState;

  onRobotStateChange: (robotState: RobotState) => void;
}

interface InfoState {
  
}

type Props = InfoProps;
type State = InfoState;

const Row = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  flexBasis: 0,
  alignItems: 'center',
  marginBottom: `${props.theme.itemPadding}px`,
  ':bottom-child': {
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

const Section = styled(Row, {
  fontWeight: 400,
  marginTop: '10px',
  ':first-child': {
    marginTop: 0
  }
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

class Info extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const {
      style,
      className,
      theme,
      robotState,
      onRobotStateChange
    } = props;

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

    return (
      <ScrollArea theme={theme}>
        <Container theme={theme} style={style} className={className}>
          <Section theme={theme}>Position</Section>

          <Section theme={theme}>Motors</Section>
          {motorPositions}

          <Section theme={theme}>Analog Sensors</Section>
          {analogSensors}
        </Container>
      </ScrollArea>
    );
  }
}

export default Info;