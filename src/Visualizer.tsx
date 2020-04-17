import * as React from 'react';
import { RobotState } from './RobotState';
import { StyleProps } from './style';
//import { RegisterState } from './RegisterState';

export interface VisualizerProps extends StyleProps {
  robot: RobotState;
  //register: RegisterState;
}

type Props = VisualizerProps;

export class Visualizer extends React.Component<Props> {
  render() {
    const { props } = this;
    const {
      className,
      style,
      robot
      //register
    } = props;
    return (
      <svg className={className} style={style} width={1440} height={960} id="simulator-area">
        <rect width="100%" height="100%" fill="LightBlue" id="foam-border"/>
        <rect width="1420" height="920" fill="LightGray" y="20" id="ground"/>
        <svg width="960" height="480" x="240" y="240" id="mat-surface">
            <image width="100%" href="static/Surface-A.png"/>
        </svg>
        <svg width="225" height="135" x="255" y="530" id="demobot">
            <image height="100%" href="static/Demobot-Claw-Up-Closed.png"/>
        </svg>
      </svg>
    )
  }
}