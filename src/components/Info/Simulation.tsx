import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Angle, Distance, Value, StyledText } from '../../util';
import { ThemeProps } from '../theme';
import ValueEdit from '../ValueEdit';
import Field from '../Field';
import { Spacer } from '../common';
import { Switch } from '../Switch';
import Button from '../Button';

export interface SimulationProps extends ThemeProps, StyleProps {
  x: Distance;
  y: Distance;
  z: Distance;
  theta: Angle;
  sensorNoise: boolean;
  realisticSensors: boolean;

  onXChange: (x: Distance) => void;
  onYChange: (y: Distance) => void;
  onZChange: (z: Distance) => void;
  onThetaChange: (theta: Angle) => void;
  onSensorNoiseChange: (enabled: boolean) => void;
  onRealisticSensorsChange: (enabled: boolean) => void;
  onRobotPositionResetRequested: () => void;
}

type Props = SimulationProps;

const StyledValueEdit = styled(ValueEdit, (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  ':first-child': {
    marginTop: 0
  }
}));

const StyledField = styled(Field, (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  ':first-child': {
    marginTop: 0
  }
}));

const StyledButton = styled(Button, (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  flex: '1 1',
  borderRadius: `0px`,
  border: `1px solid ${props.theme.borderColor}`,
  padding: `${props.theme.itemPadding}`,
  overflow: 'hidden',
  alignItems: 'center',
  alignContent: 'center',
}));


const Container = styled('div', {

});

const NAME_STYLE: React.CSSProperties = {
  fontSize: '1.2em'
};

const SENSOR_NOISE = StyledText.text({
  text: 'Sensor Noise',
  style: NAME_STYLE
});

export class Simulation extends React.PureComponent<Props> {
  private onXChange_ = (x: Value) => {
    this.props.onXChange(Value.toDistance(x));
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

  private onSensorNoiseChanged_ = (enabled: boolean) => {
    this.props.onSensorNoiseChange(enabled);
  };

  private onRealisticSensorsChanged_ = (enabled: boolean) => {
    this.props.onRealisticSensorsChange(enabled);
  };

  private onRobotPositionResetRequested_ = () => {
    this.props.onRobotPositionResetRequested();
  };

  render() {
    const { props } = this;
    const { theme, style, className, x, y, z, theta, sensorNoise, realisticSensors } = props;
    return (
      <Container style={style} className={className}>
        <StyledButton theme={theme} children={['Reset']} onClick={this.onRobotPositionResetRequested_}></StyledButton>
        <StyledValueEdit value={Value.distance(x)} onValueChange={this.onXChange_} theme={theme} name='X' />
        <StyledValueEdit value={Value.distance(y)} onValueChange={this.onYChange_} theme={theme} name='Y' />
        <StyledValueEdit value={Value.distance(z)} onValueChange={this.onZChange_} theme={theme} name='Z' />
        <StyledValueEdit value={Value.angle(theta)} onValueChange={this.onThetaChange_} theme={theme} name='Rotation' />
        <StyledField theme={theme} name='Sensor Noise' nameWidth={160}>
          <Spacer />
          <Switch value={sensorNoise} onValueChange={this.onSensorNoiseChanged_} theme={theme} />
        </StyledField>
        <StyledField theme={theme} name='Realistic Sensors' nameWidth={160}>
          <Spacer />
          <Switch value={realisticSensors} onValueChange={this.onRealisticSensorsChanged_} theme={theme} />
        </StyledField>
      </Container>
    );
  }
}