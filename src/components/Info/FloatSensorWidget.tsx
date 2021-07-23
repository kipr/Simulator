import * as React from 'react';
import * as ReactDom from 'react-dom';

import { Vector2 } from '../../math';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';
import SensorWidget from './SensorWidget';

export interface FloatSensorWidgetProps extends ThemeProps, StyleProps {
  name: string;
  sensor: string;
  value: number;
}

interface FloatSensorWidgetState {
  topLeft: Vector2;
}

type Props = FloatSensorWidgetProps;
type State = FloatSensorWidgetState;

const FLOATING = document.getElementById('floating');

class FloatSensorWidget extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.state = {
      topLeft: Vector2.ZERO
    };
  }

  render() {
    const { props, state } = this;

    const { name, sensor, value, theme, style, className } = props;
    const { topLeft } = state;

    const finalStyle: React.CSSProperties = {
      ...style,
      position: 'absolute',
      top: `${topLeft.y}px`,
      left: `${topLeft.x}px`,
    };


    const ret = (
      <SensorWidget style={finalStyle} className={className} name={name} value={value} theme={theme} />
    );

    return ReactDom.createPortal(ret, FLOATING);
  }
}

export default FloatSensorWidget;