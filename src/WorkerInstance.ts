// import Worker from "worker-loader!./worker";
import Protocol from './WorkerProtocol';
import Registers from './RegisterState'
import { RobotState } from './RobotState';
import { App } from './App';
import { callbackify } from 'util';



class WorkerInstance {
  
  onStateChange:(state:RobotState) => void 

  private state_:RobotState = {
    x: 250,
    y: 310,
    wheel_radius: 173,
    wheel_sep: 135,
    theta:0,
    motor0_speed: 0,
    motor1_speed: 0,
    motor2_speed: 0,
    motor3_speed: 0,
    motor0_position: 0,
    motor1_position: 0,
    motor2_position: 0,
    motor3_position: 0,
    servo0_position: 1024,
    servo1_position: 1024,
    servo2_position: 1024,
    servo3_position: 1024,
    time: Date.now()/1000
  }
  private registers = new Array<number>(Registers.REG_ALL_COUNT).fill(0);
  
  private tick = ()=> {
    this.state_.motor0_speed = this.registers[62]*256+this.registers[63];
    this.state_.motor1_speed = this.registers[64]*256+this.registers[65];
    this.state_.motor2_speed = this.registers[66]*256+this.registers[67];
    this.state_.motor3_speed = this.registers[68]*256+this.registers[69];
    const total_speed = (this.state_.motor0_speed + this.state_.motor3_speed)/1500;
    const new_time = Date.now()/1000
    const time_change = new_time - this.state_.time;
    this.state_.time = new_time;
    this.state_.x = this.state_.x + (this.state_.wheel_radius/2)*(total_speed)*Math.cos(this.state_.theta)*time_change;
    this.state_.y = this.state_.y - (this.state_.wheel_radius/2)*(total_speed)*Math.sin(this.state_.theta)*time_change;
    this.state_.theta = this.state_.theta + (this.state_.wheel_radius/2)*(this.state_.motor0_speed - this.state_.motor3_speed)/1500/this.state_.wheel_sep*time_change;

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
    requestAnimationFrame(this.tick);
  }
  
  private onMessage = (e)=> {
    const message:Protocol.Worker.Request = e.data;
    switch(message.type){
        case 'setregister':{
          console.log(`setregister ${message.address} ${message.value}`);
          this.registers[message.address] = message.value;
          break;
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

  get register() {
    return this.registers;
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