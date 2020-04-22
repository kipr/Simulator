// import Worker from "worker-loader!./worker";
import Protocol from './WorkerProtocol';
import Registers from './RegisterState'
import { RobotState } from './RobotState';



class WorkerInstance {
  private state:RobotState = {x:0, y:0, theta:0}
  private registers = new Array<number>(Registers.REG_ALL_COUNT);
  
  private tick = ()=> {
    
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
  private worker_ = new Worker('/js/worker.min.js');
}

export default new WorkerInstance();