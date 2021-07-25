import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Value, StyledText } from '../../util';
import { ThemeProps } from '../theme';
import ValueEdit from '../ValueEdit';
import Field from '../Field';
import { Spacer } from '../common';
import { Switch } from '../Switch';
import Button from '../Button';
import { RobotPosition } from '../../RobotPosition';

export interface SimulationProps extends ThemeProps, StyleProps {
  robotStartPosition: RobotPosition;

  onSetRobotStartPosition: (position: RobotPosition) => void;
}

type Props = SimulationProps;

const StyledValueEdit = styled(ValueEdit, (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding * 2}px`,
  ':first-child': {
    marginTop: 0
  }
}));


const Container = styled('div', {

});

const SENSOR_NOISE = StyledText.text({
  text: 'Sensor Noise',
});

export class Location extends React.PureComponent<Props> {
  private onXChange_ = (x: Value) => {
    const xDistance = Value.toDistance(x);
    if (xDistance.value === this.props.robotStartPosition.x.value) return;

    this.props.onSetRobotStartPosition({ ...this.props.robotStartPosition, x: xDistance });
  };

  private onYChange_ = (y: Value) => {
    const yDistance = Value.toDistance(y);
    if (yDistance.value === this.props.robotStartPosition.y.value) return;

    this.props.onSetRobotStartPosition({ ...this.props.robotStartPosition, y: yDistance });
  };

  private onZChange_ = (z: Value) => {
    const zDistance = Value.toDistance(z);
    if (zDistance.value === this.props.robotStartPosition.z.value) return;

    this.props.onSetRobotStartPosition({ ...this.props.robotStartPosition, z: zDistance });
  };

  private onThetaChange_ = (theta: Value) => {
    const angle = Value.toAngle(theta);
    if (angle.value === this.props.robotStartPosition.theta.value) return;

    this.props.onSetRobotStartPosition({ ...this.props.robotStartPosition, theta: angle });
  };
  
  render() {
    const { props } = this;
    const { theme, style, className, robotStartPosition: { x, y, z, theta } } = props;
    return (
      <Container style={style} className={className}>
        <StyledValueEdit value={Value.distance(x)} onValueChange={this.onXChange_} theme={theme} name='X' />
        <StyledValueEdit value={Value.distance(y)} onValueChange={this.onYChange_} theme={theme} name='Y' />
        <StyledValueEdit value={Value.distance(z)} onValueChange={this.onZChange_} theme={theme} name='Z' />
        <StyledValueEdit value={Value.angle(theta)} onValueChange={this.onThetaChange_} theme={theme} name='Rotation' />
      </Container>
    );
  }
}