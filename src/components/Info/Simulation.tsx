import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Angle, Distance, Value } from '../../util';
import { ThemeProps } from '../theme';
import ValueEdit from '../ValueEdit';

export interface SimulationProps extends ThemeProps, StyleProps {
  x: Distance;
  y: Distance;
  z: Distance;
  theta: Angle;

  onXChange: (x: Distance) => void;
  onYChange: (y: Distance) => void;
  onZChange: (z: Distance) => void;
  onThetaChange: (theta: Angle) => void;
}

type Props = SimulationProps;

const StyledValueEdit = styled(ValueEdit, (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  ':first-child': {
    marginTop: 0
  }
}));

const Container = styled('div', {

});

export class Simulation extends React.PureComponent<Props> {
  private onXChange_ = (x: Value) => {
    this.props.onXChange(Value.toDistance(x));
    console.log(`Input changed to ${JSON.stringify(x)}`);
  };

  private onYChange_ = (y: Value) => {
    this.props.onYChange(Value.toDistance(y));
  };

  private onZChange_ = (z: Value) => {
    this.props.onZChange(Value.toDistance(z));
  };

  private onThetaChange_ = (theta: Value) => {
    this.props.onThetaChange(Value.toAngle(theta));
  };

  render() {
    const { props } = this;
    const { theme, style, className, x, y, z, theta } = props;
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