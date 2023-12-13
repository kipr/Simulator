import SerialU32 from '../buffers/SerialU32';
import construct from '../../util/redux/construct';

export namespace SensorPacket {
  export enum Type {
    BumpsAndWheelDrops = 7,
    Wall = 8,
    CliffLeft = 9,
    CliffFrontLeft = 10,
    CliffFrontRight = 11,
    CliffRight = 12,
    VirtualWall = 13,
    WheelOvercurrents = 14,
    DirtDetect = 15,
    InfraredCharacterOmni = 17,
    InfraredCharacterLeft = 52,
    InfraredCharacterRight = 53,
    Buttons = 18,
    Distance = 19,
    Angle = 20,
    ChargingState = 21,
    Voltage = 22,
    Current = 23,
    Temperature = 24,
    BatteryCharge = 25,
    BatteryCapacity = 26,
    WallSignal = 27,
    CliffLeftSignal = 28,
    CliffFrontLeftSignal = 29,
    CliffFrontRightSignal = 30,
    CliffRightSignal = 31,
    ChargingSourcesAvailable = 34,
    OiMode = 35,
    SongNumber = 36,
    SongPlaying = 37,
    NumberOfStreamPackets = 38,
    RequestedVelocity = 39,
    RequestedRadius = 40,
    RequestedRightVelocity = 41,
    RequestedLeftVelocity = 42,
    LeftEncoderCounts = 43,
    RightEncoderCounts = 44,
    LightBumper = 45,
    LightBumpLeftSignal = 46,
    LightBumpFrontLeftSignal = 47,
    LightBumpCenterLeftSignal = 48,
    LightBumpCenterRightSignal = 49,
    LightBumpFrontRightSignal = 50,
    LightBumpRightSignal = 51,
    LeftMotorCurrent = 54,
    RightMotorCurrent = 55,
    MainBrushMotorCurrent = 56,
    SideBrushMotorCurrent = 57,
    Stasis = 58,
  }

  export interface BumpsAndWheelDrops {
    type: Type.BumpsAndWheelDrops;

    wheelDropLeft: boolean;
    wheelDropRight: boolean;
    bumpLeft: boolean;
    bumpRight: boolean;
  }

  export namespace BumpsAndWheelDrops {
    export const serialize = (data: BumpsAndWheelDrops): number[] => {
      let byte = 0;
      if (data.wheelDropLeft) byte |= 1 << 3;
      if (data.wheelDropRight) byte |= 1 << 2;
      if (data.bumpLeft) byte |= 1 << 1;
      if (data.bumpRight) byte |= 1 << 0;
      return [byte];
    };

    export const deserialize = (data: number[]): BumpsAndWheelDrops => ({
      type: Type.BumpsAndWheelDrops,
      wheelDropLeft: (data[0] & (1 << 3)) !== 0,
      wheelDropRight: (data[0] & (1 << 2)) !== 0,
      bumpLeft: (data[0] & (1 << 1)) !== 0,
      bumpRight: (data[0] & (1 << 0)) !== 0,
    });
  }

  export interface Wall {
    type: Type.Wall;
    value: number;
  }

  export namespace Wall {
    export const serialize = (data: Wall): number[] => [data.value];
    export const deserialize = (data: number[]): Wall => ({
      type: Type.Wall,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<Wall, typeof Wall>(Wall, Type.Wall);
  }

  export interface CliffLeft {
    type: Type.CliffLeft;
    value: number;
  }

  export namespace CliffLeft {
    export const serialize = (data: CliffLeft): number[] => [data.value];
    export const deserialize = (data: number[]): CliffLeft => ({
      type: Type.CliffLeft,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<CliffLeft, typeof CliffLeft>(CliffLeft, Type.CliffLeft);
  }

  export interface CliffFrontLeft {
    type: Type.CliffFrontLeft;
    value: number;
  }

  export namespace CliffFrontLeft {
    export const serialize = (data: CliffFrontLeft): number[] => [data.value];
    export const deserialize = (data: number[]): CliffFrontLeft => ({
      type: Type.CliffFrontLeft,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<CliffFrontLeft, typeof CliffFrontLeft>(CliffFrontLeft, Type.CliffFrontLeft);
  }

  export interface CliffFrontRight {
    type: Type.CliffFrontRight;
    value: number;
  }

  export namespace CliffFrontRight {
    export const serialize = (data: CliffFrontRight): number[] => [data.value];
    export const deserialize = (data: number[]): CliffFrontRight => ({
      type: Type.CliffFrontRight,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<CliffFrontRight, typeof CliffFrontRight>(CliffFrontRight, Type.CliffFrontRight);
  }

  export interface CliffRight {
    type: Type.CliffRight;
    value: number;
  }

  export namespace CliffRight {
    export const serialize = (data: CliffRight): number[] => [data.value];
    export const deserialize = (data: number[]): CliffRight => ({
      type: Type.CliffRight,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<CliffRight, typeof CliffRight>(CliffRight, Type.CliffRight);
  }

  export interface VirtualWall {
    type: Type.VirtualWall;
    value: number;
  }

  export namespace VirtualWall {
    export const serialize = (data: VirtualWall): number[] => [data.value];
    export const deserialize = (data: number[]): VirtualWall => ({
      type: Type.VirtualWall,
      value: data[0],
    });
  }

  export interface WheelOvercurrents {
    type: Type.WheelOvercurrents;
    leftWheel: boolean;
    rightWheel: boolean;
    mainBrush: boolean;
    sideBrush: boolean;
  }

  export namespace WheelOvercurrents {
    export const serialize = (data: WheelOvercurrents): number[] => {
      let byte = 0;
      if (data.leftWheel) byte |= 1 << 4;
      if (data.rightWheel) byte |= 1 << 3;
      if (data.mainBrush) byte |= 1 << 2;
      if (data.sideBrush) byte |= 1 << 0;
      return [byte];
    };

    export const deserialize = (data: number[]): WheelOvercurrents => ({
      type: Type.WheelOvercurrents,
      leftWheel: (data[0] & (1 << 4)) !== 0,
      rightWheel: (data[0] & (1 << 3)) !== 0,
      mainBrush: (data[0] & (1 << 2)) !== 0,
      sideBrush: (data[0] & (1 << 0)) !== 0,
    });
  }

  export interface DirtDetect {
    type: Type.DirtDetect;
    value: number;
  }

  export namespace DirtDetect {
    export const serialize = (data: DirtDetect): number[] => [data.value];
    export const deserialize = (data: number[]): DirtDetect => ({
      type: Type.DirtDetect,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<DirtDetect, typeof DirtDetect>(DirtDetect, Type.DirtDetect);
  }

  export interface InfraredCharacterOmni {
    type: Type.InfraredCharacterOmni;
    value: number;
  }

  export namespace InfraredCharacterOmni {
    export const serialize = (data: InfraredCharacterOmni): number[] => [data.value];
    export const deserialize = (data: number[]): InfraredCharacterOmni => ({
      type: Type.InfraredCharacterOmni,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<InfraredCharacterOmni, typeof InfraredCharacterOmni>(InfraredCharacterOmni, Type.InfraredCharacterOmni);
  }

  export interface InfraredCharacterLeft {
    type: Type.InfraredCharacterLeft;
    value: number;
  }

  export namespace InfraredCharacterLeft {
    export const serialize = (data: InfraredCharacterLeft): number[] => [data.value];
    export const deserialize = (data: number[]): InfraredCharacterLeft => ({
      type: Type.InfraredCharacterLeft,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<InfraredCharacterLeft, typeof InfraredCharacterLeft>(InfraredCharacterLeft, Type.InfraredCharacterLeft);
  }

  export interface InfraredCharacterRight {
    type: Type.InfraredCharacterRight;
    value: number;
  }

  export namespace InfraredCharacterRight {
    export const serialize = (data: InfraredCharacterRight): number[] => [data.value];
    export const deserialize = (data: number[]): InfraredCharacterRight => ({
      type: Type.InfraredCharacterRight,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<InfraredCharacterRight, typeof InfraredCharacterRight>(InfraredCharacterRight, Type.InfraredCharacterRight);
  }

  export interface Buttons {
    type: Type.Buttons;
    clock: boolean;
    schedule: boolean;
    day: boolean;
    hour: boolean;
    minute: boolean;
    dock: boolean;
    spot: boolean;
    clean: boolean;
  }

  export namespace Buttons {
    export const serialize = (data: Buttons): number[] => {
      let byte = 0;
      if (data.clock) byte |= 1 << 7;
      if (data.schedule) byte |= 1 << 6;
      if (data.day) byte |= 1 << 5;
      if (data.hour) byte |= 1 << 4;
      if (data.minute) byte |= 1 << 3;
      if (data.dock) byte |= 1 << 2;
      if (data.spot) byte |= 1 << 1;
      if (data.clean) byte |= 1 << 0;
      return [byte];
    };

    export const deserialize = (data: number[]): Buttons => ({
      type: Type.Buttons,
      clock: (data[0] & (1 << 7)) !== 0,
      schedule: (data[0] & (1 << 6)) !== 0,
      day: (data[0] & (1 << 5)) !== 0,
      hour: (data[0] & (1 << 4)) !== 0,
      minute: (data[0] & (1 << 3)) !== 0,
      dock: (data[0] & (1 << 2)) !== 0,
      spot: (data[0] & (1 << 1)) !== 0,
      clean: (data[0] & (1 << 0)) !== 0,
    });
  }

  export interface Distance {
    type: Type.Distance;
    // -32768 – 32767
    value: number;
  }

  export namespace Distance {
    export const serialize = (data: Distance): number[] => [
      data.value >> 8,
      data.value & 0xff,
    ];

    export const deserialize = (data: number[]): Distance => ({
      type: Type.Distance,
      value: (data[0] << 8) | data[1],
    });

    export const write = SerialU32.writeConstruct<Distance, typeof Distance>(Distance, Type.Distance);
  }

  export interface Angle {
    type: Type.Angle;
    // -32768 – 32767
    value: number;
  }

  export namespace Angle {
    export const serialize = (data: Angle): number[] => [
      data.value >> 8,
      data.value & 0xff,
    ];

    export const deserialize = (data: number[]): Angle => ({
      type: Type.Angle,
      value: (data[0] << 8) | data[1],
    });

    export const write = SerialU32.writeConstruct<Angle, typeof Angle>(Angle, Type.Angle);
  }

  export interface ChargingState {
    type: Type.ChargingState;
    value: ChargingState.Value;
  }

  export namespace ChargingState {
    export enum Value {
      NotCharging = 0,
      ReconditioningCharging = 1,
      FullCharging = 2,
      TrickleCharging = 3,
      Waiting = 4,
      ChargingFaultCondition = 5,
    }

    export const serialize = (data: ChargingState): number[] => [data.value];
    export const deserialize = (data: number[]): ChargingState => ({
      type: Type.ChargingState,
      value: data[0],
    });
  }

  export interface Voltage {
    type: Type.Voltage;
    // 0 – 65535
    value: number;
  }

  export namespace Voltage {
    export const serialize = (data: Voltage): number[] => [
      data.value >> 8,
      data.value & 0xff,
    ];

    export const deserialize = (data: number[]): Voltage => ({
      type: Type.Voltage,
      value: (data[0] << 8) | data[1],
    });
  }

  export interface Current {
    type: Type.Current;
    // -32768 – 32767
    value: number;
  }

  export namespace Current {
    export const serialize = (data: Current): number[] => [
      data.value >> 8,
      data.value & 0xff,
    ];

    export const deserialize = (data: number[]): Current => ({
      type: Type.Current,
      value: (data[0] << 8) | data[1],
    });
  }

  export interface Temperature {
    type: Type.Temperature;
    // -128 – 127
    value: number;
  }

  export namespace Temperature {
    export const serialize = (data: Temperature): number[] => [data.value];
    export const deserialize = (data: number[]): Temperature => ({
      type: Type.Temperature,
      value: data[0],
    });
  }

  export interface BatteryCharge {
    type: Type.BatteryCharge;
    // 0 – 65535
    value: number;
  }

  export namespace BatteryCharge {
    export const serialize = (data: BatteryCharge): number[] => [
      data.value >> 8,
      data.value & 0xff,
    ];

    export const deserialize = (data: number[]): BatteryCharge => ({
      type: Type.BatteryCharge,
      value: (data[0] << 8) | data[1],
    });
  }

  export interface BatteryCapacity {
    type: Type.BatteryCapacity;
    // 0 – 65535
    value: number;
  }

  export namespace BatteryCapacity {
    export const serialize = (data: BatteryCapacity): number[] => [
      data.value >> 8,
      data.value & 0xff,
    ];

    export const deserialize = (data: number[]): BatteryCapacity => ({
      type: Type.BatteryCapacity,
      value: (data[0] << 8) | data[1],
    });
  }

  export interface WallSignal {
    type: Type.WallSignal;
    // 0 – 1023
    value: number;
  }

  export namespace WallSignal {
    export const serialize = (data: WallSignal): number[] => [
      data.value >> 8,
      data.value & 0xff,
    ];

    export const deserialize = (data: number[]): WallSignal => ({
      type: Type.WallSignal,
      value: (data[0] << 8) | data[1],
    });
  }

  /** BatteryCharge = 25,
    BatteryCapacity = 26,
    WallSignal = 27,
    CliffLeftSignal = 28,
    CliffFrontLeftSignal = 29,
    CliffFrontRightSignal = 30,
    CliffRightSignal = 31,
    ChargingSourcesAvailable = 34,
    OiMode = 35,
    SongNumber = 36,
    SongPlaying = 37,
    NumberOfStreamPackets = 38,
    RequestedVelocity = 39,
    RequestedRadius = 40,
    RequestedRightVelocity = 41,
    RequestedLeftVelocity = 42,
    LeftEncoderCounts = 43,
    RightEncoderCounts = 44,
    LightBumper = 45,
    LightBumpLeftSignal = 46,
    LightBumpFrontLeftSignal = 47,
    LightBumpCenterLeftSignal = 48,
    LightBumpCenterRightSignal = 49,
    LightBumpFrontRightSignal = 50,
    LightBumpRightSignal = 51,
    LeftMotorCurrent = 54,
    RightMotorCurrent = 55,
    MainBrushMotorCurrent = 56,
    SideBrushMotorCurrent = 57,
    Stasis = 58,*/

  export interface OiMode {
    type: Type.OiMode;
    value: OiMode.Mode;
  }

  export namespace OiMode {
    export enum Mode {
      Off = 0,
      Passive = 1,
      Safe = 2,
      Full = 3
    }

    export const serialize = (data: OiMode): number[] => [
      data.value
    ];

    export const deserialize = (data: number[]): OiMode => ({
      type: Type.OiMode,
      value: data[0],
    });

    export const write = SerialU32.writeConstruct<OiMode, typeof OiMode>(OiMode, Type.OiMode);
  }

  export const oiMode = construct<OiMode>(Type.OiMode);


}