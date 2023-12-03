import Protocol from './WorkerProtocol';
import Registers from './RegisterState';
import SerialU32 from './SerialU32';
import SharedRegisters from './SharedRegisters';
import SharedRingBufferUtf32 from './SharedRingBufferUtf32';
import SharedRegistersRobot from './SharedRegistersRobot';
import AbstractRobot from '../AbstractRobot';
import WriteCommand from '../AbstractRobot/WriteCommand';

const SHARED_CONSOLE_LENGTH = 1024;


/**
 * Represents an instance of a worker that interfaces with the sharedRegistersRobot.
 * This class handles the interaction between the main thread and a worker thread,
 * managing shared resources and communication protocols.
 */
class WorkerInstance implements AbstractRobot {
  // Event handler for when the robot stops.
  onStopped: () => void;

  // Shared registers and console buffer.
  private sharedRegisters_ = new SharedRegisters();
  private sharedConsole_ = SharedRingBufferUtf32.create(SHARED_CONSOLE_LENGTH);
  private createSerial_ = SerialU32.create(1024);
  private sharedRegistersRobot_: SharedRegistersRobot;

  get createSerial() { return this.createSerial_; }

  // Worker instance for managing background tasks.
  private worker_: Worker;

  // Initialize shared registers and start the worker thread.
  constructor() {
    // Set initial register values for servos
    // console.log('WorkerInstance Constructor: initializing shared registers');
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_SRV_ALLSTOP, 0xF0);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_SERVO_0_H, 1500);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_SERVO_1_H, 1500);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_SERVO_2_H, 1500);
    this.sharedRegisters_.setRegister16b(Registers.REG_RW_SERVO_3_H, 2400);

    // console.log('WorkerInstance Constructor: new SharedRegistersRobot');
    this.sharedRegistersRobot_ = new SharedRegistersRobot(this.sharedRegisters_);

    this.startWorker();
  }

  /**
   * Retrieves the motor state from a specific port.
   * @param port - The port number to retrieve the motor state from.
   * @returns Motor state information.
   */
  getMotor(port: number) {
    return this.sharedRegistersRobot_.getMotor(port);
  }

  /**
   * Retrieves the servo state from a specific port.
   * @param port - The port number to retrieve the servo state from.
   * @returns Servo state information.
   */
  getServo(port: number) {
    return this.sharedRegistersRobot_.getServo(port);
  }

  /**
   * Retrieves the analog value from a specific port.
   * @param port - The port number to retrieve the analog value from.
   * @returns The analog value.
   */
  getAnalogValue(port: number): number {
    return this.sharedRegistersRobot_.getAnalogValue(port);
  }

  /**
   * Retrieves the digital value from a specific port.
   * @param port - The port number to retrieve the digital value from.
   * @returns The digital value.
   */
  getDigitalValue(port: number): boolean {
    return this.sharedRegistersRobot_.getDigitalValue(port);
  }

  /**
   * Applies a set of write commands to the robot.
   * @param writeCommands - An array of commands to be applied.
   */
  apply(writeCommands: WriteCommand[]) {
    // console.log('applying write commands', writeCommands);
    this.sharedRegistersRobot_.apply(writeCommands);
  }

  /**
   * Synchronizes the state of the robot with the provided stateless object.
   * @param stateless - An object representing the stateless configuration to synchronize.
   */
  sync(stateless: AbstractRobot.Stateless) {
    this.sharedRegistersRobot_.sync(stateless);
  }

  /**
   * Retrieves the shared console buffer.
   * @returns The shared console buffer.
   */
  get sharedConsole() { return this.sharedConsole_; }

  /**
   * Internal method to handle the 'stopped' event.
   * Resets specific registers and triggers the onStopped event if defined.
   */
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

  /**
   * Internal method to handle messages from the worker thread.
   * @param e - The message event received from the worker.
   */
  private onMessage = (e: MessageEvent) => {
    const message = e.data as Protocol.Worker.Request;
    console.log('WorkerInstance.onMessage - received message and posting to worker');
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
        this.worker_.postMessage(
          Protocol.Worker.SetCreateSerialRequest.fromSerialU32(
            SerialU32.flip(this.createSerial_)
          )
        );
        break;
      }
      case 'stopped': {
        this.onStopped_();
        break;
      }
    }
  };

  /**
   * Starts the worker with a given request configuration.
   * @param req - The request configuration to start the worker with, excluding the 'type' field.
   */
  start(req: Omit<Protocol.Worker.StartRequest, 'type'>) {
    console.log('WorkerInstance.start() - resetting registers and posting code to worker');
    // Reset specific registers to stop motors and disable servos
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_MODES, 0x00);
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_DIRS, 0x00);
    this.sharedRegisters_.setRegister8b(Registers.REG_RW_MOT_SRV_ALLSTOP, 0xF0);

    // Send start message to worker
    // Clones message and transmits it to worker's global environment. 
    // transfer can be passed as a list of objects that are to be transferred rather than cloned.
    this.worker_.postMessage({
      type: 'start',
      ...req
    });
  }

  /**
   * Stops the current worker and restarts it with a new set of registers.
   */
  stop() {
    // Recreate a new set of registers to cut off any communication with the worker
    this.sharedRegisters_ = this.sharedRegisters_.clone();
    this.sharedRegistersRobot_ = new SharedRegistersRobot(this.sharedRegisters_);
    this.sharedConsole_ = SharedRingBufferUtf32.create(SHARED_CONSOLE_LENGTH);
    SerialU32.popAll(this.createSerial_);
    this.worker_.terminate();

    this.onStopped_();

    this.startWorker();
  }

  /**
   * Initializes and starts the worker thread.
   */
  private startWorker() {
    console.log('WorkerInstance.startWorker() - Initializing worker and setting up onmessage handler');
    this.worker_ = new Worker(new URL('./worker.ts', import.meta.url));
    this.worker_.onmessage = this.onMessage;
  }
}

export default new WorkerInstance();