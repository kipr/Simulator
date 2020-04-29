// import Worker from "worker-loader!./worker";
import Protocol from './WorkerProtocol';
import Registers from './RegisterState'
import { RobotState } from './RobotState';
import { App } from './App';
import { callbackify } from 'util';

import deepNeq from './deepNeq';



class WorkerInstance {
  
  onStateChange:(state:RobotState) => void 

  private state_ = RobotState.empty
  private registers_ = new Array<number>(Registers.REG_ALL_COUNT).fill(0).fill(5,78,85).fill(220,79,80).fill(220,81,82).fill(220,83,84).fill(220,85,86);
  
  private time_ = Date.now() / 1000;
  private wheel_diameter_ = 55;
  private wheelSep_ = 64.05;

  private tick = ()=> {
    const nextState = { ...this.state_ };
    /*function returnInvert(answer:number){
      return ~answer
    }*/
    const new_time = Date.now()/1000
    const time_change = new_time - this.time_;
    this.time_ = new_time;
    function DirectionalValues(int1:number, int2:number){
      if(int1 > int2){
        return -((0xFF ^ int1)*256 + (0xFF ^ int2)) - 1;
      }
      else{
        return int1*256 + int2;
      }
    }

    nextState.motor0_speed = DirectionalValues(this.registers_[62], this.registers_[63]);
    nextState.motor1_speed = DirectionalValues(this.registers_[64], this.registers_[65]);
    nextState.motor2_speed = DirectionalValues(this.registers_[66], this.registers_[67]);
    nextState.motor3_speed = DirectionalValues(this.registers_[68], this.registers_[69]);

    const total_dist = (nextState.motor3_speed + nextState.motor0_speed)/1500;
    const diff_dist = (nextState.motor3_speed - nextState.motor0_speed)/1500;

    nextState.theta = nextState.theta + (this.wheel_diameter_/2)*diff_dist/this.wheelSep_*time_change;
    nextState.x = nextState.x + (this.wheel_diameter_/2)*(total_dist)*Math.cos(nextState.theta)*time_change;
    nextState.y = nextState.y + (this.wheel_diameter_/2)*(total_dist)*Math.sin(nextState.theta)*time_change;

    /*Test Kinematic Equations
    nextState.x = nextState.x + (this.wheel_diameter_/2)*total_dist/diff_dist*this.wheelSep_*Math.sin(diff_dist/this.wheelSep_*time_change) +250;
    nextState.y = nextState.y + (this.wheel_diameter_/2)*total_dist/diff_dist*this.wheelSep_*Math.cos(diff_dist/this.wheelSep_*time_change) + total_dist/diff_dist*this.wheelSep_/2 +310;
    nextState.theta = nextState.theta + (this.wheel_diameter_/2)*diff_dist/this.wheelSep_*time_change;*/
    
    nextState.motor0_position = nextState.motor0_position + nextState.motor0_speed*time_change;
    nextState.motor1_position = nextState.motor1_position + nextState.motor1_speed*time_change;
    nextState.motor2_position = nextState.motor2_position + nextState.motor2_speed*time_change;
    nextState.motor3_position = nextState.motor3_position + nextState.motor3_speed*time_change;
    function readServoRegister (reg1: number, reg2: number) {
      let val = reg1 << 8 | reg2;
      let degrees = (val - 1500.0) / 10.0;
      let dval = (degrees + 90.0)  * 2047.0 / 180.0;
      if (dval < 0.0) dval = 0.0;
      if (dval > 2047.0) dval = 2047.01;
      dval+=0.4;
      return dval;
    }
    nextState.servo0_position = readServoRegister(this.registers_[78], this.registers_[79]);
    nextState.servo1_position = readServoRegister(this.registers_[80], this.registers_[81]);
    nextState.servo2_position = readServoRegister(this.registers_[82], this.registers_[83]);
    nextState.servo3_position = readServoRegister(this.registers_[84], this.registers_[85]);

    if (deepNeq(nextState, this.state_)) {
      if (this.onStateChange) {
        this.onStateChange(nextState);
      }
      this.state_ = nextState;
    }

    
    requestAnimationFrame(this.tick);
  }
  
  private onMessage = (e)=> {
    const message:Protocol.Worker.Request = e.data;
    switch(message.type){
        case 'setregister':{
          console.log(`setregister ${message.address} ${message.value}`);
          this.registers_[message.address] = message.value;
          break;
        }
        case 'program-ended': {
          /*const x_end = this.state_.x;
          const y_end = this.state_.y;
          const theta_end = this.state_.theta;
          const motor0_position_end = this.state_.motor0_position;
          const motor1_position_end = this.state_.motor1_position;
          const motor2_position_end = this.state_.motor2_position;
          const motor3_position_end = this.state_.motor3_position;
          this.state_ = RobotState.empty;
          this.state_.x = x_end;
          this.state_.y = y_end;
          this.state_.theta = theta_end;
          this.state_.motor0_position = motor0_position_end;
          this.state_.motor1_position = motor1_position_end;
          this.state_.motor2_position = motor2_position_end;
          this.state_.motor3_position = motor3_position_end;*/
          this.state_.motor0_speed = 0;
          this.state_.motor1_speed = 0;
          this.state_.motor2_speed = 0;
          this.state_.motor3_speed = 0;
          this.registers_ = new Array<number>(Registers.REG_ALL_COUNT).fill(0);
          this.onStateChange(this.state_);
        }
    }
  }
  start(code: string) {
    this.worker_.postMessage({
      type: 'stop'
    });
    this.worker_.postMessage({
      type: 'start',
      code
    });
  }

  stop() {
    this.worker_.postMessage({
      type: 'stop'
    });
  }

  constructor(){
    this.worker_.onmessage = this.onMessage
    this.tick()
  }

  get registers() {
    return this.registers_;
  }

  get state(){
    return this.state_;
  }


  get worker() {
    return this.worker_;
  }

  private worker_ = new Worker('/js/worker.min.js');
}

export default new WorkerInstance();