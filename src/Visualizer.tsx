import * as React from 'react';
import { RobotState } from './RobotState';
import { RobotPart } from './RobotPart';
import { StyleProps } from './style';
//import { RegisterState } from './RegisterState';

export interface VisualizerProps extends StyleProps {
  robot: RobotState;
}

type Props = VisualizerProps;

export class Visualizer extends React.Component<Props> {
  render(): React.ReactNode {
    const { props } = this;
    const { robot } = props;
    const thetaDeg = round2dec(robot.theta * 180 / Math.PI);
    const x = round2dec(robot.x);
    const y = round2dec(robot.y);

    const rotateRobot = `rotate(${thetaDeg} ${(x+142.88)} ${y+67.5})`;
    const rotateClaw = `rotate(${robot.servo3_position/11.37} ${(robot.x+262.5+5)} ${(robot.y+48.5+30)})`;

    const arm = new RobotPart;
    const claw = new RobotPart;

    if(robot.servo0_position<341)
    {
      arm.updatePart("71.2","static/Arm-Only-Horizontal.PNG",rotateRobot,194,24);
      claw.updatePart("35.22","static/Claw-Only-Horizontal.PNG",`${rotateRobot} ${rotateClaw}`,262.5,48.5);
    }
    else if(robot.servo0_position>=341 && robot.servo0_position<=683)
    {
      if(robot.servo3_position<341){
        arm.updatePart("71.2","static/Arm-Only-45.PNG",rotateRobot,194,24.3);
        claw.updatePart("35.22","static/Claw-Only-45-Closed.PNG",rotateRobot,233,48);
      }
      else if(robot.servo3_position>=341 && robot.servo3_position<=683){
        arm.updatePart("71.2","static/Arm-Only-45.PNG",rotateRobot,194,24.3);
        claw.updatePart("50","static/Claw-Only-45-Half-Open.PNG",rotateRobot,233,72.5);
      }
      else {
        arm.updatePart("71.2","static/Arm-Only-45.PNG",rotateRobot,194,24.3);
        claw.updatePart("89","static/Claw-Only-45-Open.PNG",rotateRobot,228,73);
      }
    }
    else
    {
      if(robot.servo3_position<341){
        arm.updatePart("71.2","static/Arm-Only-Vertical.PNG",rotateRobot,166.5,24.5);
        claw.updatePart("34","static/Claw-Only-Vertical-Closed.PNG",rotateRobot,165,50.5);
      }
      else if(robot.servo3_position>=341 && robot.servo3_position<=683){
        arm.updatePart("71.2","static/Arm-Only-Vertical.PNG",rotateRobot,166.5,24.5);
        claw.updatePart("57","static/Claw-Only-Vertical-Half-Open.PNG",rotateRobot,164,72.5);
      }
      else {
        arm.updatePart("71.2","static/Arm-Only-Vertical.PNG",rotateRobot,166.5,24.5);
        claw.updatePart("89.9","static/Claw-Only-Vertical-Open.PNG",rotateRobot,164,72.5);
      }
    }
    return (
      <svg>
        <image height="135" x={robot.x} y={robot.y} transform={rotateRobot} href="static/Sensor-Demobot-No-Claw.png"/>
        <image height={arm.height} x={robot.x+arm.xOff} y={robot.y+arm.yOff} transform={arm.transform} href={arm.href}/>
        <image height={claw.height} x={robot.x+claw.xOff} y={robot.y+claw.yOff} transform={claw.transform} href={claw.href}/>
      </svg>
    );
  }
}

function round2dec(num: number) {
  return Math.round((num+0.00001)*100)/100;
}