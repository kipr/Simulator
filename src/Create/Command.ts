import construct from '../util/construct';

export namespace Command {
  export enum Type {
    Start = 128,
    Reset = 7,
    Stop = 173,
    Baud = 129,
    Safe = 131,
    Full = 132,
    Clean = 135,
    Max = 136,
    Spot = 134,
    SeekDock = 143,
    Power = 133,
    Schedule = 167,
    SetDayTime = 168,
    Drive = 137,
    DriveDirect = 145,
    DrivePwm = 146,
    Motors = 138,
    PwmMotors = 144,
    Leds = 139,
    SchedulingLeds = 162,
    DigitLedsRaw = 163,
    Buttons = 165,
    DigitLedsAscii = 164,
    Song = 140,
    Sensors = 142,
    QueryList = 149,
    Stream = 148,
    PauseResumeStream = 150,
  }

  export interface Start {
    type: Type.Start;
  }

  export namespace Start {
    export const serialize = (command: Start) => [command.type];
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.Start) throw new Error(`Expected type ${Type.Start} but got ${type}`);
      return START;
    };
  }

  export const START: Start = { type: Type.Start };

  export interface Reset {
    type: Type.Reset;
  }

  export namespace Reset {
    export const serialize = (command: Reset) => [command.type];
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.Reset) throw new Error(`Expected type ${Type.Reset} but got ${type}`);
      return RESET;
    };
  }

  export const RESET: Reset = { type: Type.Reset };

  export interface Stop {
    type: Type.Stop;
  }

  export namespace Stop {
    export const serialize = (command: Stop) => [command.type];
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.Stop) throw new Error(`Expected type ${Type.Stop} but got ${type}`);
      return STOP;
    };
  }

  export const STOP: Stop = { type: Type.Stop };

  export interface Baud {
    type: Type.Baud;
    code: Baud.Code;
  }

  export namespace Baud {
    export enum Code {
      B300 = 0,
      B600 = 1,
      B1200 = 2,
      B2400 = 3,
      B4800 = 4,
      B9600 = 5,
      B14400 = 6,
      B19200 = 7,
      B28800 = 8,
      B38400 = 9,
      B57600 = 10,
      B115200 = 11,
    }

    export const serialize = (command: Baud) => [command.type, command.code];
    export const deserialize = (buffer: number[]) => {
      const [type, code] = buffer;
      if (type !== Type.Baud) throw new Error(`Expected type ${Type.Baud} but got ${type}`);
      return { type, code };
    };
  }

  export const baud = construct<Baud>(Type.Baud);

  export interface Safe {
    type: Type.Safe;
  }

  export namespace Safe {
    export const serialize = (command: Safe) => [command.type];
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.Safe) throw new Error(`Expected type ${Type.Safe} but got ${type}`);
      return SAFE;
    };
  }

  export const SAFE: Safe = { type: Type.Safe };

  export interface Full {
    type: Type.Full;
  }

  export namespace Full {
    export const serialize = (command: Full) => [command.type];
  }

  export const FULL: Full = { type: Type.Full };

  export interface Clean {
    type: Type.Clean;
  }

  export namespace Clean {
    export const serialize = (command: Clean) => [command.type];
  }

  export const CLEAN: Clean = { type: Type.Clean };

  export interface Max {
    type: Type.Max;
  }

  export namespace Max {
    export const serialize = (command: Max) => [command.type];
  }

  export const MAX: Max = { type: Type.Max };

  export interface Spot {
    type: Type.Spot;
  }

  export namespace Spot {
    export const serialize = (command: Spot) => [command.type];
  }

  export const SPOT: Spot = { type: Type.Spot };

  export interface SeekDock {
    type: Type.SeekDock;
  }

  export namespace SeekDock {
    export const serialize = (command: SeekDock) => [command.type];
  }

  export const SEEK_DOCK: SeekDock = { type: Type.SeekDock };

  export interface Power {
    type: Type.Power;
  }

  export namespace Power {
    export const serialize = (command: Power) => [command.type];
  }

  export const POWER: Power = { type: Type.Power };

  export interface Schedule {
    type: Type.Schedule;
    days: number;
    sunHour: number;
    sunMinute: number;
    monHour: number;
    monMinute: number;
    tueHour: number;
    tueMinute: number;
    wedHour: number;
    wedMinute: number;
    thuHour: number;
    thuMinute: number;
    friHour: number;
    friMinute: number;
    satHour: number;
    satMinute: number;
  }

  export namespace Schedule {
    export const serialize = (command: Schedule) => [
      command.type,
      command.days,
      command.sunHour,
      command.sunMinute,
      command.monHour,
      command.monMinute,
      command.tueHour,
      command.tueMinute,
      command.wedHour,
      command.wedMinute,
      command.thuHour,
      command.thuMinute,
      command.friHour,
      command.friMinute,
      command.satHour,
      command.satMinute,
    ];
  }

  export const schedule = construct<Schedule>(Type.Schedule);

  export interface SetDayTime {
    type: Type.SetDayTime;
    day: SetDayTime.Day;
    hour: number;
    minute: number;
  }

  export namespace SetDayTime {
    export enum Day {
      Sunday = 0,
      Monday = 1,
      Tuesday = 2,
      Wednesday = 3,
      Thursday = 4,
      Friday = 5,
      Saturday = 6,
    }

    export const serialize = (command: SetDayTime) => [command.type, command.day, command.hour, command.minute];
  }

  export const setDayTime = construct<SetDayTime>(Type.SetDayTime);

  export interface Drive {
    type: Type.Drive;
    // -500 to 500 mm/s
    velocity: number;

    // -2000 to 2000 mm
    radius: number;
  }

  export namespace Drive {
    export const isRadiusStraight = (drive: Drive): boolean => drive.radius === 0x8000 || drive.radius === 0x7FFF;
    export const TURN_IN_PLACE_CLOCKWISE = 0xFFFF;
    export const TURN_IN_PLACE_COUNTER_CLOCKWISE = 1;
  }

  export const drive = construct<Drive>(Type.Drive);
  
  export interface DriveDirect {
    type: Type.DriveDirect;
    
    // -500 to 500 mm/s
    leftVelocity: number;

    // -500 to 500 mm/s
    rightVelocity: number;
  }

  export namespace DriveDirect {
    export const serialize = (drive: DriveDirect): number[] => {
      const leftVelocity = drive.leftVelocity < 0
        ? drive.leftVelocity + 0x10000
        : drive.leftVelocity;
      
      const rightVelocity = drive.rightVelocity < 0
        ? drive.rightVelocity + 0x10000
        : drive.rightVelocity;
        
      return [
        drive.type,
        rightVelocity >> 8,
        rightVelocity & 0xFF,
        leftVelocity >> 8,
        leftVelocity & 0xFF,
      ];
    }
  }

  export const driveDirect = construct<DriveDirect>(Type.DriveDirect);
}