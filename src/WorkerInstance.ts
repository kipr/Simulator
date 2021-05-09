import Protocol from './WorkerProtocol';
import Registers, { MotorControlMode } from './RegisterState';
import { RobotState } from './RobotState';

import deepNeq from './deepNeq';

class WorkerInstance {
  
  onStateChange: (state: RobotState) => void;
  
  onStdOutput: (s: string) => void;
  onStdError: (stderror: string) => void;

  private state_ = RobotState.empty;
  private registers_ = new Array<number>(Registers.REG_ALL_COUNT)
    .fill(0)
    .fill(240,61,62)
    .fill(5,78,84)
    .fill(220,79,80)
    .fill(220,81,82)
    .fill(220,83,84)
    .fill(2,84,85)
    .fill(88,85,86);
  
  private didMotorPositionRegistersChange = false;
  
  public readServoRegister = (reg1: number, reg2: number) => {
    const val = reg1 << 8 | reg2;
    const degrees = (val - 1500.0) / 10.0;
    let dval = (degrees + 90.0)  * 2047.0 / 180.0;
    if (dval < 0.0) dval = 0.0;
    if (dval > 2047.0) dval = 2047.01;
    return dval;
  };

  private tick: FrameRequestCallback = () => {

    const nextState: RobotState = {
      ...this.state_,
      motorSpeeds: [...this.state_.motorSpeeds],
      motorPositions: [...this.state_.motorPositions],
      servoPositions: [...this.state_.servoPositions],
      analogValues: [...this.state_.analogValues],
    };

    // Motor positions can be changed from simulator or from worker, so changes may conflict
    // We give precedence to changes coming from the worker (i.e. register changes), so...
    //   If motor position registers changed (from worker), update state based on registers
    //   Otherwise, update registers based on state
    // NOTE: Scaling by 250 to account for libwallaby's "update Hz" scaling
    if (this.didMotorPositionRegistersChange) {
      nextState.motorPositions = [
        this.getRegisterValue32b(Registers.REG_RW_MOT_0_B3) / 250,
        this.getRegisterValue32b(Registers.REG_RW_MOT_1_B3) / 250,
        this.getRegisterValue32b(Registers.REG_RW_MOT_2_B3) / 250,
        this.getRegisterValue32b(Registers.REG_RW_MOT_3_B3) / 250,
      ];
      this.didMotorPositionRegistersChange = false;
    } else {
      this.setRegister32b(Registers.REG_RW_MOT_0_B3, nextState.motorPositions[0] * 250);
      this.setRegister32b(Registers.REG_RW_MOT_1_B3, nextState.motorPositions[1] * 250);
      this.setRegister32b(Registers.REG_RW_MOT_2_B3, nextState.motorPositions[2] * 250);
      this.setRegister32b(Registers.REG_RW_MOT_3_B3, nextState.motorPositions[3] * 250);
    }    

    // Update motor speed state based on registers, taking current motor modes into account
    const motorModes = this.registers_[Registers.REG_RW_MOT_MODES];
    for (let motorNum = 0; motorNum < 4; motorNum++) {
      // Get the 2 bits corresponding to this motor
      const motorMode = (motorModes >> (2 * motorNum)) & 0b11;
      if (motorMode === MotorControlMode.Inactive) {
        nextState.motorSpeeds[motorNum] = 0;
      } else if (motorMode === MotorControlMode.Speed) {
        nextState.motorSpeeds[motorNum] = this.getRegisterValue16b(Registers.REG_RW_MOT_0_SP_H + (2 * motorNum));
      } else if (motorMode === MotorControlMode.SpeedPosition) {
        const motorGoalPosition = this.getRegisterValue32b(Registers.REG_W_MOT_0_GOAL_B3 + (4 * motorNum)) / 250;
        const motorVelocity = this.getRegisterValue16b(Registers.REG_RW_MOT_0_SP_H + (2 * motorNum));
        if (motorGoalPosition !== nextState.motorPositions[motorNum] && motorGoalPosition > nextState.motorPositions[motorNum] === motorVelocity > 0) {
          // Motor hasn't reached its goal position yet, so keep moving towards it
          nextState.motorSpeeds[motorNum] = motorVelocity;
        } else {
          nextState.motorSpeeds[motorNum] = 0;
        }
      }
    }
    
    // Set next state servo positions based on register values
    if (this.registers_[61] === 0) {
      nextState.servoPositions = [
        this.readServoRegister(this.registers_[78], this.registers_[79]),
        this.readServoRegister(this.registers_[80], this.registers_[81]),
        this.readServoRegister(this.registers_[82], this.registers_[83]),
        this.readServoRegister(this.registers_[84], this.registers_[85]),
      ];
    }

    // Update analog registers based on state
    this.setRegister16b(Registers.REG_RW_ADC_0_H, nextState.analogValues[0]);
    this.setRegister16b(Registers.REG_RW_ADC_1_H, nextState.analogValues[1]);

    // Update digital registers based on state
    let digitalRegisterValue = 0;
    for (let digitalPort = 0; digitalPort < nextState.digitalValues.length; ++digitalPort) {
      if (nextState.digitalValues[digitalPort]) {
        digitalRegisterValue = digitalRegisterValue | (1 << digitalPort);
      }
    }
    this.setRegister16b(Registers.REG_RW_DIG_IN_H, digitalRegisterValue);

    // Only call onStateChange() if any state values have actually changed
    if (deepNeq(nextState, this.state_)) {
      if (this.onStateChange) {
        this.onStateChange(nextState);
      }
      this.state_ = nextState;
    }

    
    requestAnimationFrame(this.tick);
  };
  
  private onMessage = (e: MessageEvent) => {
    const message = e.data as Protocol.Worker.Request;
    switch (message.type) {
      case 'setregister': {
        // console.log(`setregister ${message.address} ${message.value}`);
        this.registers_[message.address] = message.value;

        // Set "dirty" flag for motor position registers
        if (Registers.REG_RW_MOT_0_B3 <= message.address && message.address <= Registers.REG_RW_MOT_3_B3) {
          this.didMotorPositionRegistersChange = true;
        }
        break;
      }
      case 'program-ended': {
        this.state_.motorSpeeds = [0, 0, 0, 0];
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
        if (this.onStdOutput) {
          this.onStdOutput(message.stdoutput);
        }
        break;
      }
      case 'programerror': {
        if (this.onStdError) {
          this.onStdError(message.stderror);
        }
        break;
      }
    }
  };
  
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
    this.worker_.terminate();

    // Reset specific registers to stop motors and disable servos
    this.registers_[Registers.REG_RW_MOT_MODES] = 0x00;
    this.registers_[Registers.REG_RW_MOT_SRV_ALLSTOP] = 0xF0;

    this.startWorker();

    this.worker_.postMessage({
      type: 'stop'
    });
  }

  // TODO: consider only calling postMessage() if register value is different
  // TODO: consider batching multiple related setRegister() calls into one postMessage()
  private setRegister(address: number, value: number) {
    // Send 'setregister' message to worker
    this.worker_.postMessage({
      type: 'setregister',
      address: address,
      value: value,
    });

    // Update own registers
    this.registers_[address] = value;
  }

  private setRegister16b(startAddress: number, value: number) {
    const bytes = this.valueTo4Bytes(value);
    for (let offset = 0; offset < 2; offset++) {
      this.setRegister(startAddress + offset, bytes[offset + 2]);
    }
  }

  private setRegister32b(startAddress: number, value: number) {
    const bytes = this.valueTo4Bytes(value);
    for (let offset = 0; offset < 4; offset++) {
      this.setRegister(startAddress + offset, bytes[offset]);
    }
  }

  private getRegisterValue16b = (startAddress: number): number => {
    // This accounts for negative numbers by taking advantage of JS's "sign-propagating" right shift operator
    // If the first byte starts with 1, then ">> 16" will result in 16 leading 1s (a negative number)
    return (this.registers_[startAddress] << 24 | this.registers_[startAddress + 1] << 16) >> 16;
  };

  private getRegisterValue32b = (startAddress: number): number => {
    return this.registers_[startAddress] << 24 | this.registers_[startAddress + 1] << 16 | this.registers_[startAddress + 2] << 8 | this.registers_[startAddress + 3];
  };

  // Helper for converting number -> 4 separate bytes
  private valueTo4Bytes(value: number): [number, number, number, number] {
    return [
      (value >> 24) & 0xFF,
      (value >> 16) & 0xFF,
      (value >> 8) & 0xFF,
      (value) & 0xFF,
    ];
  }

  constructor() {
    this.startWorker();
    requestAnimationFrame(this.tick);
  }

  set state(state: RobotState) {
    this.state_ = state;
    this.onStateChange(this.state_);
  }

  get state() {
    return this.state_;
  }

  private startWorker() {
    this.worker_ = new Worker('/js/worker.min.js');
    this.worker_.onmessage = this.onMessage;
  }

  private worker_: Worker;
}

export default new WorkerInstance();