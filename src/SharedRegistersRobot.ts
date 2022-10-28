import AbstractRobot from './AbstractRobot';
import Motor from './AbstractRobot/Motor';
import Servo from './AbstractRobot/Servo';
import WriteCommand from './AbstractRobot/WriteCommand';
import { clamp } from './math';
import RegisterState from './RegisterState';
import SharedRegisters from './SharedRegisters';

class SharedRegistersRobot implements AbstractRobot {
  private sharedResisters_: SharedRegisters;

  private static readonly POSITION_GOAL_SCALING = 250; 

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
    const position = this.sharedResisters_.getRegisterValue32b(RegisterState.REG_RW_MOT_0_B3 + port * 4, true) / SharedRegistersRobot.POSITION_GOAL_SCALING;
    const pwm = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_RW_MOT_0_PWM_H + port * 2);
    const done = this.getMotorDone_(port);
    const speedGoal = this.sharedResisters_.getRegisterValue16b(RegisterState.REG_RW_MOT_0_SP_H + port * 2, true);
    const positionGoal = this.sharedResisters_.getRegisterValue32b(RegisterState.REG_W_MOT_0_GOAL_B3 + port * 4, true) / SharedRegistersRobot.POSITION_GOAL_SCALING;

    return {
      mode,
      direction,
      position,
      pwm: direction === Motor.Direction.Backward ? -pwm : pwm,
      done,
      speedGoal,
      positionGoal,
      ...this.getMotorPid_(port),
    };
  }

  getDigitalValue(port: number): boolean {
    return (this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_DIG_IN_H) & (1 << port)) !== 0;
  }

  getAnalogValue(port: number): number {
    return this.sharedResisters_.getRegisterValue16b(RegisterState.REG_RW_ADC_0_H + port * 2);
  }

  private servoRegisterToPosition_ = (val: number) => {
    const degrees = (val - 1500.0) / 10.0;
    const dval = (degrees + 90.0)  * 2047.0 / 180.0;
    return clamp(0.0, dval, 2047.0);
  };

  private positionToServoRegister_ = (val: number) => {
    const degrees = val * 180.0 / 2047.0 - 90.0;
    return Math.round(degrees * 10.0 + 1500.0);
  };

  getServo(port: number): Servo {
    const position = this.servoRegisterToPosition_(this.sharedResisters_.getRegisterValue16b(RegisterState.REG_RW_SERVO_0_H + port * 2));
    const enabled = (this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_MOT_SRV_ALLSTOP) & (1 << (port + 4))) === 0;

    return {
      position,
      enabled,
    };
  }

  private readonly apply_ = (writeCommand: WriteCommand) => {
    switch (writeCommand.type) {
      case WriteCommand.Type.MotorDone: {
        const done = this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_MOT_DONE);
        this.sharedResisters_.setRegister8b(RegisterState.REG_RW_MOT_DONE, done | (1 << (3 - writeCommand.port)));
        break;
      }
      case WriteCommand.Type.MotorPosition: {
        this.sharedResisters_.setRegister32b(RegisterState.REG_RW_MOT_0_B3 + writeCommand.port * 4, writeCommand.position * SharedRegistersRobot.POSITION_GOAL_SCALING);
        break;
      }
      case WriteCommand.Type.AddMotorPosition: {
        this.sharedResisters_.incrementRegister32b(RegisterState.REG_RW_MOT_0_B3 + writeCommand.port * 4, writeCommand.positionDelta * SharedRegistersRobot.POSITION_GOAL_SCALING);
        break;
      }
      case WriteCommand.Type.MotorPwm: {
        const { pwm, port } = writeCommand;

        let directions = this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_MOT_DIRS);
        directions = directions & ~(0b11 << (port * 2));

        if (pwm === 0) {
          this.sharedResisters_.setRegister8b(RegisterState.REG_RW_MOT_DIRS, directions | (Motor.Direction.toBits(Motor.Direction.Idle) << (port * 2)));
          this.sharedResisters_.setRegister16b(RegisterState.REG_RW_MOT_0_PWM_H + port * 2, pwm);
        } else if (pwm > 0) {
          this.sharedResisters_.setRegister8b(RegisterState.REG_RW_MOT_DIRS, directions | (Motor.Direction.toBits(Motor.Direction.Forward) << (port * 2)));
          this.sharedResisters_.setRegister16b(RegisterState.REG_RW_MOT_0_PWM_H + port * 2, pwm);
        } else {
          this.sharedResisters_.setRegister8b(RegisterState.REG_RW_MOT_DIRS, directions | (Motor.Direction.toBits(Motor.Direction.Backward) << (port * 2)));
          this.sharedResisters_.setRegister16b(RegisterState.REG_RW_MOT_0_PWM_H + port * 2, -pwm);
        }
        break;
      }
      case WriteCommand.Type.DigitalIn: {
        let current = this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_DIG_IN_H);
        current = current & ~(1 << writeCommand.port);
        if (writeCommand.value) current = current | (1 << writeCommand.port);
        this.sharedResisters_.setRegister8b(RegisterState.REG_RW_DIG_IN_H, current);
        break;
      }
      case WriteCommand.Type.Analog: {
        this.sharedResisters_.setRegister16b(RegisterState.REG_RW_ADC_0_H + writeCommand.port * 2, writeCommand.value);
        break;
      }
      case WriteCommand.Type.MotorDirection: {
        let directions = this.sharedResisters_.getRegisterValue8b(RegisterState.REG_RW_MOT_DIRS);
        directions = directions & ~(0b11 << (writeCommand.port * 2));
        directions = directions | (Motor.Direction.toBits(writeCommand.direction) << (writeCommand.port * 2));
        this.sharedResisters_.setRegister8b(RegisterState.REG_RW_MOT_DIRS, directions);
      }
    }
  };

  apply(writeCommands: WriteCommand[]) {
    for (const writeCommand of writeCommands) this.apply_(writeCommand);
  }

  sync(stateless: AbstractRobot.Stateless) {

    let modes = 0;
    let directions = 0;

    for (let i = 0; i < 4; ++i) {
      const motor = stateless.motors[i];

      modes = (modes << 2) | Motor.Mode.toBits(motor.mode);
      directions = (directions << 2) | Motor.Direction.toBits(motor.direction);

      this.sharedResisters_.setRegister16b(RegisterState.REG_RW_MOT_0_PWM_H + i * 2, motor.direction === Motor.Direction.Backward ? -motor.pwm : motor.pwm);
      this.sharedResisters_.setRegister32b(RegisterState.REG_W_MOT_0_GOAL_B3 + i * 4, motor.positionGoal * SharedRegistersRobot.POSITION_GOAL_SCALING);
      this.sharedResisters_.setRegister16b(RegisterState.REG_RW_MOT_0_SP_H + i * 2, motor.speedGoal);
      this.sharedResisters_.setRegister32b(RegisterState.REG_RW_MOT_0_B3 + i * 4, motor.position);

      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_P_H + i * 12, Math.trunc(motor.kP * 1000));
      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_PD_H + i * 12, 1000);

      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_I_H + i * 12, Math.trunc(motor.kI * 1000));
      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_ID_H + i * 12, 1000);

      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_D_H + i * 12, Math.trunc(motor.kD * 1000));
      this.sharedResisters_.setRegister16b(RegisterState.REG_W_PID_0_DD_H + i * 12, 1000);
    }

    this.sharedResisters_.setRegister8b(RegisterState.REG_RW_MOT_MODES, modes);
    this.sharedResisters_.setRegister8b(RegisterState.REG_RW_MOT_DIRS, directions);

    let servoAllStop = 0;
    for (let i = 0; i < 4; ++i) {
      const servo = stateless.servos[i];
      this.sharedResisters_.setRegister16b(RegisterState.REG_RW_SERVO_0_H + i * 2, this.positionToServoRegister_(servo.position));
      servoAllStop |= (servo.enabled ? 0 : 1) << (i + 4);
    }

    this.sharedResisters_.setRegister8b(RegisterState.REG_RW_MOT_SRV_ALLSTOP, servoAllStop);
  }
}

export default SharedRegistersRobot;