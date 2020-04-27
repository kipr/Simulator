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
  private registers_ = new Array<number>(Registers.REG_ALL_COUNT).fill(0);
  
  private time_ = Date.now() / 1000;
  private wheel_radius_ = 173;
  private wheelSep_ = 135;
  private tick = ()=> {
    const nextState = { ...this.state_ };

    nextState.motor0_speed = this.registers_[62]*256+this.registers_[63];
    nextState.motor1_speed = this.registers_[64]*256+this.registers_[65];
    nextState.motor2_speed = this.registers_[66]*256+this.registers_[67];
    nextState.motor3_speed = this.registers_[68]*256+this.registers_[69];
    const total_speed = (this.wheel_radius_/2)*(nextState.motor3_speed + nextState.motor0_speed)/1500;
    const new_time = Date.now()/1000
    const time_change = new_time - this.time_;
    this.time_ = new_time;
    nextState.x = nextState.x + (total_speed)*Math.cos(nextState.theta)*time_change;
    nextState.y = nextState.y - (total_speed)*Math.sin(nextState.theta)*time_change;
    nextState.theta = nextState.theta + (this.wheel_radius_/2)*(nextState.motor0_speed - nextState.motor3_speed)/1500/this.wheelSep_*time_change;

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
          const x_end = this.state_.x;
          const y_end = this.state_.y;
          const theta_end = this.state_.theta;
          this.state_ = RobotState.empty;
          this.state_.x = x_end;
          this.state_.y = y_end;
          this.state_.theta = theta_end;
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