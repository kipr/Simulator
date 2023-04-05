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
    export const SIZE = 1;

    export const serialize = (command: Start) => [command.type];
    export const deserialize = (buffer: number[]): Start => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 1;

    export const serialize = (command: Reset) => [command.type];
    export const deserialize = (buffer: number[]): Reset => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 1;

    export const serialize = (command: Stop) => [command.type];
    export const deserialize = (buffer: number[]): Stop => {
      if (buffer.length < SIZE) return undefined;
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

    export const SIZE = 2;

    export const serialize = (command: Baud) => [command.type, command.code];
    export const deserialize = (buffer: number[]): Baud => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 1;

    export const serialize = (command: Safe) => [command.type];
    export const deserialize = (buffer: number[]) => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 1;

    export const serialize = (command: Full) => [command.type];
    export const deserialize = (buffer: number[]): Full => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 1;

    export const serialize = (command: Clean) => [command.type];
    export const deserialize = (buffer: number[]): Clean => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 1;

    export const serialize = (command: Max) => [command.type];
    export const deserialize = (buffer: number[]): Max => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 1;

    export const serialize = (command: Spot) => [command.type];
    export const deserialize = (buffer: number[]): Spot => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 1;

    export const serialize = (command: SeekDock) => [command.type];
    export const deserialize = (buffer: number[]): SeekDock => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 1;

    export const serialize = (command: Power) => [command.type];
    export const deserialize = (buffer: number[]): Power => {
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 16;

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
      if (buffer.length < SIZE) return undefined;
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

    export const SIZE = 4;

    export const serialize = (command: SetDayTime) => [command.type, command.day, command.hour, command.minute];

    export const deserialize = (buffer: number[]): SetDayTime => {
      if (buffer.length < SIZE) return undefined;
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

    export const SIZE = 5;

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
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 5;

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
      if (buffer.length < SIZE) return undefined;
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
    export const SIZE = 5;

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
      if (buffer.length < SIZE) return undefined;
      const [type, rightPwmHigh, rightPwmLow, leftPwmHigh, leftPwmLow] = buffer;
      if (type !== Type.DrivePwm) throw new Error(`Expected type ${Type.DrivePwm} but got ${type}`);
      const rightPwm = (rightPwmHigh << 8) + rightPwmLow;
      const leftPwm = (leftPwmHigh << 8) + leftPwmLow;
      return { type, rightPwm, leftPwm };
    };
  }

  export const drivePwm = construct<DrivePwm>(Type.DrivePwm);

  export interface Leds {
    type: Type.Leds;
    checkRobot: boolean;
    dock: boolean;
    spot: boolean;
    debris: boolean;
    powerColor: number;
    powerIntensity: number;
  }

  export namespace Leds {
    export const SIZE = 4;

    export const serialize = (leds: Leds): number[] => {
      const ledBits = (
        (leds.checkRobot ? 1 : 0) << 3 |
        (leds.dock ? 1 : 0) << 2 |
        (leds.spot ? 1 : 0) << 1 |
        (leds.debris ? 1 : 0)
      );

      return [
        Type.Leds,
        ledBits,
        leds.powerColor,
        leds.powerIntensity,
      ];
    };

    export const deserialize = (buffer: number[]): Leds => {
      if (buffer.length < SIZE) return undefined;

      const [type, ledBits, powerColor, powerIntensity] = buffer;
      if (type !== Type.Leds) throw new Error(`Expected type ${Type.Leds} but got ${type}`);

      return {
        type,
        checkRobot: !!(ledBits & (1 << 3)),
        dock: !!(ledBits & (1 << 2)),
        spot: !!(ledBits & (1 << 1)),
        debris: !!(ledBits & 1),
        powerColor,
        powerIntensity,
      };
    };
  }

  export interface Sensors {
    type: Type.Sensors;
    packetId: number;
  }

  export namespace Sensors {
    export const SIZE = 2;

    export const serialize = (command: Sensors): number[] => [command.type, command.packetId];
    export const deserialize = (buffer: number[]): Sensors => {
      if (buffer.length < SIZE) return undefined;
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
      case Type.Leds: return Leds.serialize(command);
      case Type.Sensors: return Sensors.serialize(command);
    }
  };

  export interface DeserializeResult {
    command: Command;
    nextBuffer: number[];
  }

  export namespace DeserializeResult {
    export const from = <U extends Command, T extends { SIZE: number; deserialize: (buffer: number[]) => U; }>() => {
      return (buffer: number[], command: T): DeserializeResult => {
        if (buffer.length < command.SIZE) return undefined;
        return { command: command.deserialize(buffer), nextBuffer: buffer.slice(command.SIZE) };
      };
    }
  }

  export const deserialize = (buffer: number[]): DeserializeResult => {
    if (buffer.length === 0) return undefined;
    
    const [type] = buffer;
    switch (type) {
      case Type.Start: return DeserializeResult.from<Start, typeof Start>()(buffer, Start);
      case Type.Reset: return DeserializeResult.from<Reset, typeof Reset>()(buffer, Reset);
      case Type.Stop: return DeserializeResult.from<Stop, typeof Stop>()(buffer, Stop);
      case Type.Baud: return DeserializeResult.from<Baud, typeof Baud>()(buffer, Baud);
      case Type.Safe: return DeserializeResult.from<Safe, typeof Safe>()(buffer, Safe);
      case Type.Full: return DeserializeResult.from<Full, typeof Full>()(buffer, Full);
      case Type.Clean: return DeserializeResult.from<Clean, typeof Clean>()(buffer, Clean);
      case Type.Max: return DeserializeResult.from<Max, typeof Max>()(buffer, Max);
      case Type.Spot: return DeserializeResult.from<Spot, typeof Spot>()(buffer, Spot);
      case Type.SeekDock: return DeserializeResult.from<SeekDock, typeof SeekDock>()(buffer, SeekDock);
      case Type.Power: return DeserializeResult.from<Power, typeof Power>()(buffer, Power);
      case Type.Schedule: return DeserializeResult.from<Schedule, typeof Schedule>()(buffer, Schedule);
      case Type.SetDayTime: return DeserializeResult.from<SetDayTime, typeof SetDayTime>()(buffer, SetDayTime);
      case Type.Drive: return DeserializeResult.from<Drive, typeof Drive>()(buffer, Drive);
      case Type.DriveDirect: return DeserializeResult.from<DriveDirect, typeof DriveDirect>()(buffer, DriveDirect);
      case Type.DrivePwm: return DeserializeResult.from<DrivePwm, typeof DrivePwm>()(buffer, DrivePwm);
      case Type.Leds: return DeserializeResult.from<Leds, typeof Leds>()(buffer, Leds);
      case Type.Sensors: return DeserializeResult.from<Sensors, typeof Sensors>()(buffer, Sensors);
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
  Command.Leds |
  Command.Sensors
);