import * as React from 'react';
import * as ReactDom from 'react-dom';

import { RawVector2 } from '../../util/math/math';
import SensorWidget, { SensorWidgetProps } from './SensorWidget';

export interface FloatSensorWidgetProps extends SensorWidgetProps {
}

interface FloatSensorWidgetState {
  topLeft: RawVector2;
}

type Props = FloatSensorWidgetProps;
type State = FloatSensorWidgetState;

const FLOATING = document.getElementById('floating');

class FloatSensorWidget extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.state = {
      topLeft: RawVector2.ZERO
    };
  }

  render() {
    const { props, state } = this;

    const { style } = props;
    const { topLeft } = state;

    const finalStyle: React.CSSProperties = {
      ...style,
      position: 'absolute',
      top: `${topLeft.y}px`,
      left: `${topLeft.x}px`,
    };

    const ret = (
      <SensorWidget {...props} style={finalStyle}  />
    );

    return ReactDom.createPortal(ret, FLOATING);
  }
}

export default FloatSensorWidget;