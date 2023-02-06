import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Value, StyledText, Angle, Distance } from '../../util';
import { ThemeProps } from '../theme';
import ValueEdit from '../ValueEdit';
import deepNeq from '../../deepNeq';
import { ReferenceFrame, Rotation, Vector3 } from '../../unit-math';
import LocalizedString from '../../util/LocalizedString';

import tr from '@i18n';

export interface LocationProps extends ThemeProps, StyleProps {
  origin?: ReferenceFrame;
  onOriginChange: (origin: ReferenceFrame, modifyReferenceScene: boolean) => void;
  locale: LocalizedString.Language;
}

type Props = LocationProps;

const IDENTITY_ORIGIN: ReferenceFrame = {
  position: Vector3.zero('centimeters'),
  orientation: Rotation.Euler.identity(Angle.Type.Degrees),
};

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

export default class Location extends React.PureComponent<Props> {
  private onXChange_ = (x: Value) => {
    const origin = this.props.origin;
    const xDistance = Value.toDistance(x);
    if (origin.position && !deepNeq(xDistance, origin.position.x)) return;


    this.props.onOriginChange({
      ...origin,
      position: {
        ...origin.position || Vector3.zero('centimeters'),
        x: xDistance
      }
    }, true);
  };

  private onYChange_ = (y: Value) => {
    const origin = this.props.origin;

    const yDistance = Value.toDistance(y);
    if (origin.position && !deepNeq(yDistance, origin.position.y)) return;

    this.props.onOriginChange({
      ...origin,
      position: {
        ...(origin.position || Vector3.zero('centimeters')),
        y: yDistance
      }
    }, true);
  };

  private onZChange_ = (z: Value) => {
    const origin = this.props.origin;

    const zDistance = Value.toDistance(z);
    if (origin.position && !deepNeq(zDistance, origin.position.z)) return;

    this.props.onOriginChange({
      ...origin,
      position: {
        ...(origin.position || Vector3.zero('centimeters')),
        z: zDistance
      }
    }, true);
  };

  private onThetaChange_ = (theta: Value) => {
    const origin = this.props.origin;

    const thetaAngle = Value.toAngle(theta);

    const nextOrientation: Rotation.Euler = {
      type: 'euler',
      x: Angle.degrees(0),
      z: Angle.degrees(0),
      y: thetaAngle,
      order: 'yzx'
    };
    
    if (origin.orientation && Rotation.angle(origin.orientation, nextOrientation).value === 0) return;


    this.props.onOriginChange({
      ...origin,
      orientation: nextOrientation
    }, true);
  };
  
  render() {
    const { props } = this;
    const { theme, style, className, origin, locale } = props;

    if (!origin) return null;

    let euler = Rotation.Euler.identity(Angle.Type.Degrees);
    if (origin.orientation) {
      if (origin.orientation.type === 'euler') {
        euler = origin.orientation;
      } else {
        euler = Rotation.toType(origin.orientation, 'euler') as Rotation.Euler;
      }
    }

    return (
      <Container style={style} className={className}>
        <StyledValueEdit value={Value.distance(origin?.position?.x || Distance.centimeters(0))} onValueChange={this.onXChange_} theme={theme} name={LocalizedString.lookup(tr('X'), locale)} />
        <StyledValueEdit value={Value.distance(origin?.position?.y || Distance.centimeters(0))} onValueChange={this.onYChange_} theme={theme} name={LocalizedString.lookup(tr('Y'), locale)} />
        <StyledValueEdit value={Value.distance(origin?.position?.z || Distance.centimeters(0))} onValueChange={this.onZChange_} theme={theme} name={LocalizedString.lookup(tr('Z'), locale)} />
        <StyledValueEdit value={Value.angle(euler.y)} onValueChange={this.onThetaChange_} theme={theme} name={LocalizedString.lookup(tr('Rotation'), locale)} />
      </Container>
    );
  }
}