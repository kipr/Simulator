import Protocol from './WorkerProtocol';
import Registers from './RegisterState';

import SharedRegisters from './SharedRegisters';
import SharedRingBufferUtf32 from './SharedRingBufferUtf32';
import SharedRegistersRobot from './SharedRegistersRobot';
import AbstractRobot from './AbstractRobot';
import WriteCommand from './AbstractRobot/WriteCommand';

const SHARED_CONSOLE_LENGTH = 1024;

class WorkerInstance implements AbstractRobot {
  onStopped: () => void;

  private sharedRegisters_ = new SharedRegisters();
  private sharedConsole_ = SharedRingBufferUtf32.create(SHARED_CONSOLE_LENGTH);

  private sharedRegistersRobot_: SharedRegistersRobot;

  getMotor(port: number) {
    return this.sharedRegistersRobot_.getMotor(port);
  }

  getServo(port: number) {
    return this.sharedRegistersRobot_.getServo(port);
  }

  getAnalogValue(port: number): number {
    return this.sharedRegistersRobot_.getAnalogValue(port);
  }

  getDigitalValue(port: number): boolean {
    return this.sharedRegistersRobot_.getDigitalValue(port);
  }

  apply(writeCommands: WriteCommand[]) {
    this.sharedRegistersRobot_.apply(writeCommands);
  }

  sync(stateless: AbstractRobot.Stateless) {
    console.log('stateless', stateless);
    this.sharedRegistersRobot_.sync(stateless);
  }

  get sharedConsole() { return this.sharedConsole_; }

  private onStopped_ = () => {
    // Reset specific registers to stop motors and disable servos
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_MODES, 0x00);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_MOT_0_PWM_H, 0);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_MOT_1_PWM_H, 0);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_MOT_2_PWM_H, 0);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_MOT_3_PWM_H, 0);
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_DIRS, 0xFF);
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_DONE, 0);
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_SRV_ALLSTOP, 0xF0);

    if (this.onStopped) {
      this.onStopped();
    }
  };

  private onMessage = (e: MessageEvent) => {
    const message = e.data as Protocol.Worker.Request;
    switch (message.type) {
      case 'worker-ready': {
        // Once worker is ready for messages, send the shared register array buffer
        this.worker_.postMessage({
          type: 'set-shared-registers',
          sharedArrayBuffer: this.sharedRegisters_.getSharedArrayBuffer(),
        } as Protocol.Worker.SetSharedRegistersRequest);
        this.worker_.postMessage({
          type: 'set-shared-console',
          sharedArrayBuffer: this.sharedConsole_.sharedArrayBuffer,
        } as Protocol.Worker.SetSharedConsoleRequest);
        break;
      }
      case 'stopped': {
        this.onStopped_();
        break;
      }
    }
  };
  
  start(req: Omit<Protocol.Worker.StartRequest, 'type'>) {
    // Reset specific registers to stop motors and disable servos
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_MODES, 0x00);
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_DIRS, 0x00);
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_SRV_ALLSTOP, 0xF0);

    // Send start message to worker
    this.worker_.postMessage({
      type: 'start',
      ...req
    });
  }

  stop() {
    // Recreate a new set of registers to cut off any communication with the worker
    this.sharedRegisters_ = this.sharedRegisters_.clone();
    this.sharedRegistersRobot_ = new SharedRegistersRobot(this.sharedRegisters_);
    this.sharedConsole_ = SharedRingBufferUtf32.create(SHARED_CONSOLE_LENGTH);
    this.worker_.terminate();

    this.onStopped_();

    this.startWorker();
  }

  constructor() {
    // Set initial register values for servos
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_SRV_ALLSTOP, 0xF0);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_SERVO_0_H, 1500);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_SERVO_1_H, 1500);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_SERVO_2_H, 1500);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_SERVO_3_H, 2400);

    this.sharedRegistersRobot_ = new SharedRegistersRobot(this.sharedRegisters_);

    this.startWorker();
  }

  private startWorker() {
    this.worker_ = new Worker(new URL('./worker.ts', import.meta.url));
    this.worker_.onmessage = this.onMessage;
  }

  private worker_: Worker;
}

export default new WorkerInstance();