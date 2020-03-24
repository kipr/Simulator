import * as React from 'react';
import { RobotState } from './RobotState';
import { StyleProps } from './style';

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
    return (
      <svg className={className} style={style}>
        <rect x={robot.x} y={robot.y} width={100} height={100}></rect>
      </svg>
    )
  }
}