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
    export const deserialize = (buffer: number[]): Baud => {
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
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.Full) throw new Error(`Expected type ${Type.Full} but got ${type}`);
      return FULL;
    };
  }

  export const FULL: Full = { type: Type.Full };

  export interface Clean {
    type: Type.Clean;
  }

  export namespace Clean {
    export const serialize = (command: Clean) => [command.type];
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.Clean) throw new Error(`Expected type ${Type.Clean} but got ${type}`);
      return CLEAN;
    };
  }

  export const CLEAN: Clean = { type: Type.Clean };

  export interface Max {
    type: Type.Max;
  }

  export namespace Max {
    export const serialize = (command: Max) => [command.type];
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.Max) throw new Error(`Expected type ${Type.Max} but got ${type}`);
      return MAX;
    };
  }

  export const MAX: Max = { type: Type.Max };

  export interface Spot {
    type: Type.Spot;
  }

  export namespace Spot {
    export const serialize = (command: Spot) => [command.type];
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.Spot) throw new Error(`Expected type ${Type.Spot} but got ${type}`);
      return SPOT;
    };
  }

  export const SPOT: Spot = { type: Type.Spot };

  export interface SeekDock {
    type: Type.SeekDock;
  }

  export namespace SeekDock {
    export const serialize = (command: SeekDock) => [command.type];
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.SeekDock) throw new Error(`Expected type ${Type.SeekDock} but got ${type}`);
      return SEEK_DOCK;
    };
  }

  export const SEEK_DOCK: SeekDock = { type: Type.SeekDock };

  export interface Power {
    type: Type.Power;
  }

  export namespace Power {
    export const serialize = (command: Power) => [command.type];
    export const deserialize = (buffer: number[]) => {
      const [type] = buffer;
      if (type !== Type.Power) throw new Error(`Expected type ${Type.Power} but got ${type}`);
      return POWER;
    };
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

    export const deserialize = (buffer: number[]): Schedule => {
      const [
        type,
        days,
        sunHour,
        sunMinute,
        monHour,
        monMinute,
        tueHour,
        tueMinute,
        wedHour,
        wedMinute,
        thuHour,
        thuMinute,
        friHour,
        friMinute,
        satHour,
        satMinute,
      ] = buffer;
      if (type !== Type.Schedule) throw new Error(`Expected type ${Type.Schedule} but got ${type}`);
      return { type, days, sunHour, sunMinute, monHour, monMinute, tueHour, tueMinute, wedHour, wedMinute, thuHour, thuMinute, friHour, friMinute, satHour, satMinute };
    };
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

    export const deserialize = (buffer: number[]): SetDayTime => {
      const [type, day, hour, minute] = buffer;
      if (type !== Type.SetDayTime) throw new Error(`Expected type ${Type.SetDayTime} but got ${type}`);
      return { type, day, hour, minute };
    };
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

    export const serialize = (drive: Drive): number[] => {
      const velocity = drive.velocity < 0
        ? drive.velocity + 0x10000
        : drive.velocity;
      
      const radius = drive.radius < 0
        ? drive.radius + 0x10000
        : drive.radius;
        
      return [
        drive.type,
        velocity >> 8,
        velocity & 0xFF,
        radius >> 8,
        radius & 0xFF,
      ];
    };

    export const deserialize = (buffer: number[]): Drive => {
      const [type, velocityHigh, velocityLow, radiusHigh, radiusLow] = buffer;
      if (type !== Type.Drive) throw new Error(`Expected type ${Type.Drive} but got ${type}`);
      const velocity = (velocityHigh << 8) + velocityLow;
      const radius = (radiusHigh << 8) + radiusLow;
      return { type, velocity, radius };
    };
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

    export const deserialize = (buffer: number[]): DriveDirect => {
      const [type, rightVelocityHigh, rightVelocityLow, leftVelocityHigh, leftVelocityLow] = buffer;
      if (type !== Type.DriveDirect) throw new Error(`Expected type ${Type.DriveDirect} but got ${type}`);
      const rightVelocity = (rightVelocityHigh << 8) + rightVelocityLow;
      const leftVelocity = (leftVelocityHigh << 8) + leftVelocityLow;
      return { type, rightVelocity, leftVelocity };
    };
  }

  export const driveDirect = construct<DriveDirect>(Type.DriveDirect);

  export interface DrivePwm {
    type: Type.DrivePwm;
    leftPwm: number;
    rightPwm: number;
  }

  export namespace DrivePwm {
    export const serialize = (drive: DrivePwm): number[] => {
      const leftPwm = drive.leftPwm < 0
        ? drive.leftPwm + 0x10000
        : drive.leftPwm;
      const rightPwm = drive.rightPwm < 0
        ? drive.rightPwm + 0x10000
        : drive.rightPwm;

      return [
        drive.type,
        rightPwm >> 8,
        rightPwm & 0xFF,
        leftPwm >> 8,
        leftPwm & 0xFF,
      ];
    };

    export const deserialize = (buffer: number[]): DrivePwm => {
      const [type, rightPwmHigh, rightPwmLow, leftPwmHigh, leftPwmLow] = buffer;
      if (type !== Type.DrivePwm) throw new Error(`Expected type ${Type.DrivePwm} but got ${type}`);
      const rightPwm = (rightPwmHigh << 8) + rightPwmLow;
      const leftPwm = (leftPwmHigh << 8) + leftPwmLow;
      return { type, rightPwm, leftPwm };
    };
  }

  export const drivePwm = construct<DrivePwm>(Type.DrivePwm);

  export interface Sensors {
    type: Type.Sensors;
    packetId: number;
  }

  export namespace Sensors {
    export const serialize = (command: Sensors): number[] => [command.type, command.packetId];
    export const deserialize = (buffer: number[]): Sensors => {
      const [type, packetId] = buffer;
      if (type !== Type.Sensors) throw new Error(`Expected type ${Type.Sensors} but got ${type}`);
      return { type, packetId };
    };
  }

  export const serialize = (command: Command): number[] => {
    switch (command.type) {
      case Type.Start: return Start.serialize(command);
      case Type.Reset: return Reset.serialize(command);
      case Type.Stop: return Stop.serialize(command);
      case Type.Baud: return Baud.serialize(command);
      case Type.Safe: return Safe.serialize(command);
      case Type.Full: return Full.serialize(command);
      case Type.Clean: return Clean.serialize(command);
      case Type.Max: return Max.serialize(command);
      case Type.Spot: return Spot.serialize(command);
      case Type.SeekDock: return SeekDock.serialize(command);
      case Type.Power: return Power.serialize(command);
      case Type.Schedule: return Schedule.serialize(command);
      case Type.SetDayTime: return SetDayTime.serialize(command);
      case Type.Drive: return Drive.serialize(command);
      case Type.DriveDirect: return DriveDirect.serialize(command);
      case Type.DrivePwm: return DrivePwm.serialize(command);
      case Type.Sensors: return Sensors.serialize(command);
    }
  };

  export const deserialize = (buffer: number[]): Command => {
    const [type] = buffer;
    switch (type) {
      case Type.Start: return Start.deserialize(buffer);
      case Type.Reset: return Reset.deserialize(buffer);
      case Type.Stop: return Stop.deserialize(buffer);
      case Type.Baud: return Baud.deserialize(buffer);
      case Type.Safe: return Safe.deserialize(buffer);
      case Type.Full: return Full.deserialize(buffer);
      case Type.Clean: return Clean.deserialize(buffer);
      case Type.Max: return Max.deserialize(buffer);
      case Type.Spot: return Spot.deserialize(buffer);
      case Type.SeekDock: return SeekDock.deserialize(buffer);
      case Type.Power: return Power.deserialize(buffer);
      case Type.Schedule: return Schedule.deserialize(buffer);
      case Type.SetDayTime: return SetDayTime.deserialize(buffer);
      case Type.Drive: return Drive.deserialize(buffer);
      case Type.DriveDirect: return DriveDirect.deserialize(buffer);
      case Type.DrivePwm: return DrivePwm.deserialize(buffer);
      case Type.Sensors: return Sensors.deserialize(buffer);
    }
  };
}

export type Command = (
  Command.Start |
  Command.Reset |
  Command.Stop |
  Command.Baud |
  Command.Safe |
  Command.Full |
  Command.Clean |
  Command.Max |
  Command.Spot |
  Command.SeekDock |
  Command.Power |
  Command.Schedule |
  Command.SetDayTime |
  Command.Drive |
  Command.DriveDirect |
  Command.DrivePwm |
  Command.Sensors
);