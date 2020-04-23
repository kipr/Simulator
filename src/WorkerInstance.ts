// import Worker from "worker-loader!./worker";
import Protocol from './WorkerProtocol';
import Registers from './RegisterState'
import { RobotState } from './RobotState';



class WorkerInstance {
  
  onStateChange:(state:RobotState) => void 

  private state:RobotState = {
    x:0,
    y:0,
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
    servo3_position: 1024
  }
  private registers = new Array<number>(Registers.REG_ALL_COUNT);
  
  private tick = ()=> {
    //Reading the registers nad computing the new robot state
    if (this.onStateChange) this.onStateChange(this.state)
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

  getRegister() {
    return this.registers;
  }

  getWorker_() {
    return this.worker_;
  }

  getRobotState() {
    return this.state;
  }

  private worker_ = new Worker('/js/worker.min.js');
}

export default new WorkerInstance();