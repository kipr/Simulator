import AbstractRobot from './AbstractRobot';
import { Motor } from './AbstractRobot/Motor';
import WriteCommand from './AbstractRobot/WriteCommand';
import RegisterState from './RegisterState';
import SharedRegisters from './SharedRegisters';

class SharedRegistersRobot implements AbstractRobot {
  private sharedResisters_: SharedRegisters;

  constructor(sharedRegisters: SharedRegisters) {
    this.sharedResisters_ = sharedRegisters;
  }

  private readonly getMotorDone_ = (port: number) => {
    const done = this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_MOT_DONE);
    return (done & (1 << (3 - port))) !== 0;
  };

  private readonly getMotorPid_ = (port: number): { kP: number; kI: number; kD: number; } => {
    const pNum = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_W_PID_0_P_H + port * 12);
    const pDen = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_W_PID_0_PD_H + port * 12);
    
    const iNum = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_W_PID_0_I_H + port * 12);
    const iDen = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_W_PID_0_ID_H + port * 12);

    const dNum = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_W_PID_0_D_H + port * 12);
    const dDen = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_W_PID_0_DD_H + port * 12);

    return {
      kP: pNum / pDen,
      kI: iNum / iDen,
      kD: dNum / dDen,
    };
  };

  getMotor(port: number): Motor {
    const modes = this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_MOT_MODES);
    const directions = this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_MOT_DIRS);
    const mode = Motor.Mode.fromBits((modes >> (port * 2)) & 0b11);
    const direction = Motor.Direction.fromBits((directions >> (port * 2)) & 0b11);
    const position = this.sharedResisters_.getRegisterValue32b(RegisterState.REG_RW_MOT_0_B3 + port * 4);
    const pwm = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_RW_MOT_0_PWM_H + port * 2);
    const done = this.getMotorDone_(port);
    const speedGoal = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_RW_MOT_0_SP_H + port * 2, true);
    const positionGoal = this.sharedResisters_.getRegisterValue32b(RegisterState.REG_W_MOT_0_GOAL_B3 + port * 4, true);

    return {
      mode,
      direction,
      position,
      pwm,
      done,
      speedGoal,
      positionGoal,
      ...this.getMotorPid_(port),
    };
  }

  getDigitalValue(port: number): boolean {
    return false;
  }

  getAnalogValue(port: number): number {
    return 0;
  }

  getServoPosition(port: number): number {
    return this.sharedResisters_.getRegisterValue16b(RegisterState.REG_RW_SERVO_0_H + port * 2);
  }

  private readonly apply_ = (writeCommand: WriteCommand) => {
    switch (writeCommand.type) {
      case WriteCommand.Type.MotorDone: {
        const done = this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_MOT_DONE);
        this.sharedResisters_.setRegister8b(RegisterState.REG_RW_MOT_DONE, done | (1 << (3 - writeCommand.port)));
        break;
      }
      case WriteCommand.Type.MotorPosition: {
        this.sharedResisters_.setRegister32b(RegisterState.REG_RW_MOT_0_B3 + writeCommand.port * 4, writeCommand.position);
        break;
      }
      case WriteCommand.Type.MotorPwm: {
        this.sharedResisters_.setRegister16b(RegisterState.REG_RW_MOT_0_PWM_H + writeCommand.port * 2, writeCommand.pwm);
        break;
      }
    }
  };

  apply(writeCommands: WriteCommand[]) {
    for (const writeCommand of writeCommands) this.apply_(writeCommand);
  }

  sync(stateless: AbstractRobot.Stateless) {
    for (let i = 0; i < 4; ++i) {
      const motor = stateless.getMotor(i);

      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_P_H + i * 12, Math.trunc(motor.kP * 1000));
      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_PD_H + i * 12, 1000);

      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_I_H + i * 12, Math.trunc(motor.kI * 1000));
      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_ID_H + i * 12, 1000);

      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_D_H + i * 12, Math.trunc(motor.kD * 1000));
      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_DD_H + i * 12, 1000);
    }
  }
}

export default SharedRegistersRobot;