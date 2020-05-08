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
    let rotateRobot = 'rotate(' + ((robot.theta)*180/Math.PI).toString() + ' ' + (robot.x+142.88).toString() + ' ' + (robot.y+67.5).toString() + ')';
    let rotateClaw= 'rotate(' + (robot.servo3_position/11.37).toString() + ' ' + (robot.x+262.5+5).toString() + ' ' + (robot.y+48.5+30).toString() + ')';
    if(robot.servo0_position<341)
    {
      return (
        <svg>
            <image height="135" x={robot.x} y={robot.y} transform={rotateRobot} href="static/Sensor-Demobot-No-Claw.png"/>
            <image height="71.2" x={robot.x+194} y={robot.y+24} transform={rotateRobot} href="static/Arm-Only-Horizontal.PNG"/>
            <image height="35.22" x={robot.x+262.5} y={robot.y+48.5} transform={rotateRobot+' '+rotateClaw} href="static/Claw-Only-Horizontal.PNG"/>
        </svg>
      )
    }
    else if(robot.servo0_position>=341 && robot.servo0_position<=683)
    {
      if(robot.servo3_position<341){
        return (
          <svg>
            <image height="135" x={robot.x} y={robot.y} transform={rotateRobot} href="static/Sensor-Demobot-No-Claw.png"/>
            <image height="71.2" x={robot.x+194} y={robot.y+24.3} transform={rotateRobot} href="static/Arm-Only-45.PNG"/>
            <image height="35.22" x={robot.x+233} y={robot.y+48} transform={rotateRobot} href={"static/Claw-Only-45-Closed.PNG"}/>
          </svg>
        )
      }
      else if(robot.servo3_position>=341 && robot.servo3_position<=683){
        return (
          <svg>
            <image height="135" x={robot.x} y={robot.y} transform={rotateRobot} href="static/Sensor-Demobot-No-Claw.png"/>
            <image height="71.2" x={robot.x+194} y={robot.y+24.3} transform={rotateRobot} href="static/Arm-Only-45.PNG"/>
            <image height="50" x={robot.x+233} y={robot.y+72.5} transform={rotateRobot} href={"static/Claw-Only-45-Half-Open.PNG"}/>
          </svg>
        )
      }
      else {
        return (
         <svg>
            <image height="135" x={robot.x} y={robot.y} transform={rotateRobot} href="static/Sensor-Demobot-No-Claw.png"/>
            <image height="71.2" x={robot.x+194} y={robot.y+24.3} transform={rotateRobot} href="static/Arm-Only-45.PNG"/>
            <image height="89" x={robot.x+228} y={robot.y+73} transform={rotateRobot} href={"static/Claw-Only-45-Open.PNG"}/>
         </svg>
        )
      }
    }
    else
    {
      if(robot.servo3_position<341){
        return (
          <svg>
              <image height="135" x={robot.x} y={robot.y} transform={rotateRobot} href="static/Sensor-Demobot-No-Claw.png"/>
              <image height="71.2" x={robot.x+166.5} y={robot.y+24.5} transform={rotateRobot} href="static/Arm-Only-Vertical.PNG"/>
              <image width="18.5" x={robot.x+165} y={robot.y+50.5} transform={rotateRobot} href={"static/Claw-Only-Vertical-Closed.PNG"}/>
          </svg>
        )
      }
      else if(robot.servo3_position>=341 && robot.servo3_position<=683){
        return (
          <svg>
              <image height="135" x={robot.x} y={robot.y} transform={rotateRobot} href="static/Sensor-Demobot-No-Claw.png"/>
              <image height="71.2" x={robot.x+166.5} y={robot.y+24.5} transform={rotateRobot} href="static/Arm-Only-Vertical.PNG"/>
              <image width="18.5" x={robot.x+164} y={robot.y+72.5} transform={rotateRobot} href={"static/Claw-Only-Vertical-Half-Open.PNG"}/>
          </svg>
        )
      }
      else {
        return (
          <svg>
              <image height="135" x={robot.x} y={robot.y} transform={rotateRobot} href="static/Sensor-Demobot-No-Claw.png"/>
              <image height="71.2" x={robot.x+166.5} y={robot.y+24.5} transform={rotateRobot} href="static/Arm-Only-Vertical.PNG"/>
              <image width="18.5" x={robot.x+164} y={robot.y+72.5} transform={rotateRobot} href={"static/Claw-Only-Vertical-Open.PNG"}/>
          </svg>
        )
      }
    }
  }
}