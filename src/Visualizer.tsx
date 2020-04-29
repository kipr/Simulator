import * as React from 'react';
import { RobotState } from './RobotState';
import { StyleProps } from './style';
//import { RegisterState } from './RegisterState';

export interface VisualizerProps extends StyleProps {
  robot: RobotState;
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
    const rotateUpdate = 'rotate(' + ((robot.theta)*180/Math.PI).toString() + ',' + (robot.x+142.88).toString() + ',' + (robot.y+67.5).toString() + ')';
    return (
        <svg width="230.19" height="135" x={robot.x} y={robot.y} id="demobot" transform={rotateUpdate}>
            <image height="100%" href="static/Demobot-Claw-Up-Closed.png"/>
        </svg>
    )
  }
}