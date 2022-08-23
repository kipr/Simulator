import Protocol from './WorkerProtocol';
import Registers, { MotorControlMode } from './RegisterState';
import { RobotState } from './RobotState';

import deepNeq from './deepNeq';
import SharedRegisters from './SharedRegisters';


class WorkerInstance {
  
  onStateChange: (state: RobotState) => void;
  getRobotState: () => RobotState;
  
  onStdOutput: (s: string) => void;
  onStdError: (stderror: string) => void;
  
  onStopped: () => void;

  private readonly sharedRegister_ = new SharedRegisters();

  public setSensorValues = (analogValues: RobotState.AnalogValues, digitalValues: RobotState.DigitalValues) => {
    // Update analog registers
    this.sharedRegister_.setRegister16b(Registers.REG_RW_ADC_0_H, analogValues[0]);
    this.sharedRegister_.setRegister16b(Registers.REG_RW_ADC_1_H, analogValues[1]);

    // Update digital registers based on state
    let digitalRegisterValue = 0;
    for (let digitalPort = 0; digitalPort < digitalValues.length; ++digitalPort) {
      if (digitalValues[digitalPort]) {
        digitalRegisterValue = digitalRegisterValue | (1 << digitalPort);
      }
    }
    this.sharedRegister_.setRegister16b(Registers.REG_RW_DIG_IN_H, digitalRegisterValue);
  };

  public incrementMotorPositions = (motorPositionIncrements: [number, number, number, number]) => {
    // TODO: Truncating the increment value will be lossy
    this.sharedRegister_.incrementRegister32b(Registers.REG_RW_MOT_0_B3, Math.trunc(motorPositionIncrements[0]) * 250);
    this.sharedRegister_.incrementRegister32b(Registers.REG_RW_MOT_1_B3, Math.trunc(motorPositionIncrements[1]) * 250);
    this.sharedRegister_.incrementRegister32b(Registers.REG_RW_MOT_2_B3, Math.trunc(motorPositionIncrements[2]) * 250);
    this.sharedRegister_.incrementRegister32b(Registers.REG_RW_MOT_3_B3, Math.trunc(motorPositionIncrements[3]) * 250);
  };

  private servoRegisterToPosition = (val: number) => {
    const degrees = (val - 1500.0) / 10.0;
    let dval = (degrees + 90.0)  * 2047.0 / 180.0;
    if (dval < 0.0) dval = 0.0;
    if (dval > 2047.0) dval = 2047.01;
    return dval;
  };

  private tick: FrameRequestCallback = () => {
    if (!this.getRobotState) {
      requestAnimationFrame(this.tick);
      return;
    }

    const currentState = this.getRobotState();

    const nextState: RobotState = {
      ...currentState,
      motorSpeeds: [...currentState.motorSpeeds],
      motorPositions: [...currentState.motorPositions],
      servoPositions: [...currentState.servoPositions],
      analogValues: [...currentState.analogValues],
      digitalValues: [...currentState.digitalValues],
    };

    // NOTE: Scaling by 250 to account for libwallaby's "update Hz" scaling
    nextState.motorPositions = [
      this.sharedRegister_.getRegisterValue32b(Registers.REG_RW_MOT_0_B3, true) / 250,
      this.sharedRegister_.getRegisterValue32b(Registers.REG_RW_MOT_1_B3, true) / 250,
      this.sharedRegister_.getRegisterValue32b(Registers.REG_RW_MOT_2_B3, true) / 250,
      this.sharedRegister_.getRegisterValue32b(Registers.REG_RW_MOT_3_B3, true) / 250,
    ];

    // Update motor speed state based on registers, taking current motor modes into account
    const motorModes = this.sharedRegister_.getRegisterValue8b(Registers.REG_RW_MOT_MODES);
    for (let motorNum = 0; motorNum < 4; motorNum++) {
      // Get the 2 bits corresponding to this motor
      const motorMode = (motorModes >> (2 * motorNum)) & 0b11;
      if (motorMode === MotorControlMode.Inactive) {
        nextState.motorSpeeds[motorNum] = 0;
      } else if (motorMode === MotorControlMode.Speed) {
        nextState.motorSpeeds[motorNum] = this.sharedRegister_.getRegisterValue16b(Registers.REG_RW_MOT_0_SP_H + (2 * motorNum), true);
      } else if (motorMode === MotorControlMode.SpeedPosition) {
        const motorGoalPosition = this.sharedRegister_.getRegisterValue32b(Registers.REG_W_MOT_0_GOAL_B3 + (4 * motorNum), true) / 250;
        const motorVelocity = this.sharedRegister_.getRegisterValue16b(Registers.REG_RW_MOT_0_SP_H + (2 * motorNum), true);
        if (motorGoalPosition !== nextState.motorPositions[motorNum] && motorGoalPosition > nextState.motorPositions[motorNum] === motorVelocity > 0) {
          // Motor hasn't reached its goal position yet, so keep moving towards it
          nextState.motorSpeeds[motorNum] = motorVelocity;
        } else {
          nextState.motorSpeeds[motorNum] = 0;
        }
      }
    }
    
    // Set next state servo positions based on register values
    if (this.sharedRegister_.getRegisterValue8b(Registers.REG_RW_MOT_SRV_ALLSTOP) === 0) {
      nextState.servoPositions = [
        this.servoRegisterToPosition(this.sharedRegister_.getRegisterValue16b(Registers.REG_RW_SERVO_0_H)),
        this.servoRegisterToPosition(this.sharedRegister_.getRegisterValue16b(Registers.REG_RW_SERVO_1_H)),
        this.servoRegisterToPosition(this.sharedRegister_.getRegisterValue16b(Registers.REG_RW_SERVO_2_H)),
        this.servoRegisterToPosition(this.sharedRegister_.getRegisterValue16b(Registers.REG_RW_SERVO_3_H)),
      ];
    }

    // Only call onStateChange() if any state values have actually changed
    if (deepNeq(nextState, currentState)) {
      if (this.onStateChange) {
        this.onStateChange(nextState);
      }
    }

    requestAnimationFrame(this.tick);
  };
  
  private onMessage = (e: MessageEvent) => {
    const message = e.data as Protocol.Worker.Request;
    switch (message.type) {
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
      case 'workerready': {
        // Once worker is ready for messages, send the shared register array buffer
        this.worker_.postMessage({
          type: 'setsharedregisters',
          sharedArrayBuffer: this.sharedRegister_.getSharedArrayBuffer(),
        } as Protocol.Worker.SetSharedRegistersRequest);
        break;
      }
      case 'stopped': {
        if (this.onStopped) this.onStopped();
        break;
      }
    }
  };
  
  start(code: string) {
    this.worker_.postMessage({
      type: 'start',
      code
    });
  }

  stop() {
    this.worker_.terminate();

    // Reset specific registers to stop motors and disable servos
    this.sharedRegister_.setRegister8b(Registers.REG_RW_MOT_MODES, 0x00);
    this.sharedRegister_.setRegister8b(Registers.REG_RW_MOT_SRV_ALLSTOP, 0xF0);

    this.startWorker();
  }

  constructor() {
    // Set initial register values for servos
    this.sharedRegister_.setRegister8b(Registers.REG_RW_MOT_SRV_ALLSTOP, 0xF0);
    this.sharedRegister_.setRegister16b(Registers.REG_RW_SERVO_0_H, 1500);
    this.sharedRegister_.setRegister16b(Registers.REG_RW_SERVO_1_H, 1500);
    this.sharedRegister_.setRegister16b(Registers.REG_RW_SERVO_2_H, 1500);
    this.sharedRegister_.setRegister16b(Registers.REG_RW_SERVO_3_H, 2400);

    this.startWorker();
    requestAnimationFrame(this.tick);
  }

  private startWorker() {
    this.worker_ = new Worker(new URL('./worker.ts', import.meta.url));
    this.worker_.onmessage = this.onMessage;
  }

  private worker_: Worker;
}

export default new WorkerInstance();