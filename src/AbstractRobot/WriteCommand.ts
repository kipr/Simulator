import construct from '../util/construct';
import Motor from './Motor';

namespace WriteCommand {
  export enum Type {
    DigitalIn = 'digital-in',
    Analog = 'analog',
    MotorPosition = 'motor-position',
    AddMotorPosition = 'add-motor-position',
    MotorPwm = 'motor-pwm',
    MotorDone = 'motor-done',
    MotorDirection = 'motor-direction',
  }

  export interface DigitalIn {
    type: Type.DigitalIn;
  
    port: number;

    value: boolean;
  }

  export const digitalIn = construct<DigitalIn>(Type.DigitalIn);

  export interface Analog {
    type: Type.Analog;

    port: number;

    value: number;
  }

  export const analog = construct<Analog>(Type.Analog);

  export interface MotorPosition {
    type: Type.MotorPosition;

    port: number;
    
    position: number;
  }

  export const motorPosition = construct<MotorPosition>(Type.MotorPosition);

  export interface AddMotorPosition {
    type: Type.AddMotorPosition;

    port: number;
    
    positionDelta: number;
  }

  export const addMotorPosition = construct<AddMotorPosition>(Type.AddMotorPosition);

  export interface MotorPwm {
    type: Type.MotorPwm;
  
    port: number;

    pwm: number;
  }

  export const motorPwm = construct<MotorPwm>(Type.MotorPwm);

  export interface MotorDone {
    type: Type.MotorDone;

    port: number;

    done: boolean;
  }

  export const motorDone = construct<MotorDone>(Type.MotorDone);

  export interface MotorDirection {
    type: Type.MotorDirection;

    port: number;

    direction: Motor.Direction;
  }
}

type WriteCommand = (
  WriteCommand.DigitalIn |
  WriteCommand.Analog |
  WriteCommand.MotorPosition |
  WriteCommand.AddMotorPosition |
  WriteCommand.MotorPwm |
  WriteCommand.MotorDone |
  WriteCommand.MotorDirection
);

export default WriteCommand;