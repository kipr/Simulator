import Protocol from './WorkerProtocol';
import Registers from './RegisterState'
import { RobotState } from './RobotState';

import deepNeq from './deepNeq';

class WorkerInstance {
  
  onStateChange:(state:RobotState) => void 
  
  onStdOutput:(s: string) => void
  onStdError:(stderror: string) => void

  private state_ = RobotState.empty
  private registers_ = new Array<number>(Registers.REG_ALL_COUNT)
                                                                .fill(0)
                                                                .fill(240,61,62)
                                                                .fill(5,78,84)
                                                                .fill(220,79,80)
                                                                .fill(220,81,82)
                                                                .fill(220,83,84)
                                                                .fill(2,84,85)
                                                                .fill(88,85,86);
  
  private lastTickTime: number;
  // private wheel_diameter_ = 55;
  // private wheelSep_ = 64.05;
  public DirectionalValues = (int1:number, int2:number) => {
    if(int1 > int2){
      return -((0xFF ^ int1)*256 + (0xFF ^ int2)) - 1;
    }
    else{
      return int1*256 + int2;
    }
  }
  public readServoRegister = (reg1: number, reg2: number) => {
    let val = reg1 << 8 | reg2;
    let degrees = (val - 1500.0) / 10.0;
    let dval = (degrees + 90.0)  * 2047.0 / 180.0;
    if (dval < 0.0) dval = 0.0;
    if (dval > 2047.0) dval = 2047.01;
    return dval;
  }

  private tick: FrameRequestCallback = (time: number) => {
    const timeElapsedMs = this.lastTickTime !== undefined ? time - this.lastTickTime : 0;
    const timeElapsedSecs = timeElapsedMs / 1000;
    this.lastTickTime = time;

    const nextState = { ...this.state_ };
    
    // Set next state motor speeds based on register values
    nextState.motor0_speed = this.DirectionalValues(this.registers_[62], this.registers_[63]);
    nextState.motor1_speed = this.DirectionalValues(this.registers_[64], this.registers_[65]);
    nextState.motor2_speed = this.DirectionalValues(this.registers_[66], this.registers_[67]);
    nextState.motor3_speed = this.DirectionalValues(this.registers_[68], this.registers_[69]);

    //const total_dist = (nextState.motor3_speed + nextState.motor0_speed)/1500;
    //const diff_dist = (nextState.motor3_speed - nextState.motor0_speed)/1500;

    nextState.theta = nextState.theta;// + (this.wheel_diameter_/2)*diff_dist/this.wheelSep_*time_change;
    nextState.x = nextState.x;// + (this.wheel_diameter_/2)*(total_dist)*Math.cos(nextState.theta)*time_change;
    nextState.y = nextState.y;// + (this.wheel_diameter_/2)*(total_dist)*Math.sin(nextState.theta)*time_change;
    
    //Write the values to the registers and send those back to worker when updated.(Send the entire array to worker)

    nextState.motor0_position += nextState.motor0_speed*timeElapsedSecs;
    nextState.motor1_position += nextState.motor1_speed*timeElapsedSecs;
    nextState.motor2_position += nextState.motor2_speed*timeElapsedSecs;
    nextState.motor3_position += nextState.motor3_speed*timeElapsedSecs;

    // Set motor position registers based on next state
    this.registers_[42] = nextState.motor0_position;
    this.registers_[46] = nextState.motor1_position;
    this.registers_[50] = nextState.motor2_position;
    this.registers_[54] = nextState.motor3_position;
    
    //console.log(this.registers_[61])
    // Set next state servo positions based on register values
    if(this.registers_[61] == 0){
      nextState.servo0_position = this.readServoRegister(this.registers_[78], this.registers_[79]);
      nextState.servo1_position = this.readServoRegister(this.registers_[80], this.registers_[81]);
      nextState.servo2_position = this.readServoRegister(this.registers_[82], this.registers_[83]);
      nextState.servo3_position = this.readServoRegister(this.registers_[84], this.registers_[85]);
    }
    //console.log("setting servo");

    // Set analog registers based on next state
    this.setRegister(Registers.REG_RW_ADC_0_L, nextState.analog0_value);
    this.setRegister(Registers.REG_RW_ADC_1_L, nextState.analog1_value);

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
        case 'setmotorposition': {
          console.log(`motor number is: ${message.motor}`);
          if(message.motor == 0){
            this.state.motor0_position = 0;
          }
          else if(message.motor == 1){
            this.state.motor1_position = 0;
          }
          else if(message.motor == 2){
            this.state.motor2_position = 0;
          }
          else if(message.motor == 3){
            this.state.motor3_position = 0;
          }
          break;
        }
        case 'program-ended': {
          this.state_.motor0_speed = 0;
          this.state_.motor1_speed = 0;
          this.state_.motor2_speed = 0;
          this.state_.motor3_speed = 0;
          const servoPositions = this.registers_.slice(78,86);
          this.registers_ = new Array<number>(Registers.REG_ALL_COUNT)
                                                                      .fill(0)
                                                                      .fill(240,61,62)
                                                                      .fill(servoPositions[0],78,79)
                                                                      .fill(servoPositions[1],79,80)
                                                                      .fill(servoPositions[2],80,81)
                                                                      .fill(servoPositions[3],81,82)
                                                                      .fill(servoPositions[4],82,83)
                                                                      .fill(servoPositions[5],83,84)
                                                                      .fill(servoPositions[6],84,85)
                                                                      .fill(servoPositions[7],85,86);
          this.onStateChange(this.state_);
          break;
        }
        case 'programoutput': {
          message.stdoutput
          if(this.onStdOutput){
            this.onStdOutput(message.stdoutput)
          }
          break;
        }
        case 'programerror': {
          message.stderror
          if(this.onStdError){
            this.onStdError(message.stderror)
          }
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

  compile(code: string) {
    this.worker_.postMessage({
      type: 'stop'
    });
    this.worker_.postMessage({
      type: 'compile',
      code
    });
  }

  stop() {
    this.worker_.postMessage({
      type: 'stop'
    });
  }

  setRegister(address: number, value: number) {
    // Send 'setregister' message to worker
    this.worker_.postMessage({
      type: 'setregister',
      address: address,
      value: value,
    });

    // Update own registers
    this.registers_[address] = value;
  }

  constructor(){
    this.worker_.onmessage = this.onMessage
    requestAnimationFrame(this.tick);
  }

  get registers() {
    return this.registers_;
  }

  set state(state: RobotState) {
    this.state_ = state;
    this.onStateChange(this.state_);
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