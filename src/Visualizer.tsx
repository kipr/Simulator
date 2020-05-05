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
    } = props;
    let rotateUpdate = 'rotate(' + ((robot.theta)*180/Math.PI).toString() + ' ' + (robot.x+142.88).toString() + ' ' + (robot.y+67.5).toString() + ')';
    return (
        <svg>
            <image height="135" x={robot.x} y={robot.y} href="static/Demobot-Claw-Up-Closed.png" transform={rotateUpdate}/>
        </svg>
    )
  }
}