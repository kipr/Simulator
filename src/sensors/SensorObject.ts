import Sensor from './Sensor';
import * as Babylon from 'babylonjs';
import { RobotState } from '../RobotState';

interface SensorObject {
  readonly sensor: Sensor;
  
  update(): boolean;
  dispose(): void;
  getValue(): SensorObject.Value;
  isVisible: boolean;
  updateVisual(): boolean;
  isNoiseEnabled: boolean;
  isRealisticEnabled: boolean;
}

namespace SensorObject {
  export interface Config<T extends Sensor> {
    scene: Babylon.Scene;
    mesh: Babylon.AbstractMesh;
    sensor: T
  }

  export interface Constructor<T extends Sensor> {
    new(config: Config<T>): SensorObject;
  }

  export namespace Value {
    export enum Type {
      U12,
      Bool
    }

    export namespace Type {
      export const toString = (type: Type): string => {
        switch (type) {
          case Type.U12: return 'U12';
          case Type.Bool: return 'Boolean';
          default: return `Unknown (${JSON.stringify(type)})`;
        }
      };
    }
  
    export interface U12 {
      type: Type.U12;
      value: number;
    }

    export namespace U12 {
      export const from = (value: Value): U12 => {
        switch (value.type) {
          case Type.U12: return value;
          case Type.Bool: return u12(value.value ? 4095 : 0);
        }
      };
    }

    export const u12 = (value: number): U12 => ({
      type: Type.U12,
      value
    });
  
    export interface Bool {
      type: Type.Bool;
      value: boolean;
    }

    export namespace Bool {
      export const from = (value: Value): Bool => {
        switch (value.type) {
          case Type.Bool: return value;
          case Type.U12: return bool(value.value > 0);
        }
      };
    }

    export const bool = (value: boolean): Bool => ({
      type: Type.Bool,
      value
    });

    export const TRUE: Bool = bool(true);
    export const FALSE: Bool = bool(false);
  }
  
  export type Value = Value.U12 | Value.Bool;

  export const apply = (self: SensorObject, state: Partial<RobotState>): Partial<RobotState> => {
    const { output } = self.sensor;
    const value = self.getValue();

    const ret: Partial<RobotState> = { ...state };

    switch (output.type) {
      case Sensor.Output.Type.Digital: {
        const booleanValue = Value.Bool.from(value);

        ret.digitalValues = [
          ...ret.digitalValues.slice(0, output.port),
          booleanValue.value,
          ...ret.digitalValues.slice(output.port + 1)  
        ] as RobotState.DigitalValues;
        break;
      }

      case Sensor.Output.Type.Analog: {
        const u12Value = Value.U12.from(value);

        ret.analogValues = [
          ...ret.analogValues.slice(0, output.port),
          u12Value.value,
          ...ret.analogValues.slice(output.port + 1)  
        ] as RobotState.AnalogValues;
        break;
      }
    }

    return ret;
  };

  export const applyMut = (self: SensorObject, state: Partial<RobotState>): void => {
    const { output } = self.sensor;
    const value = self.getValue();

    switch (output.type) {
      case Sensor.Output.Type.Digital: {
        const booleanValue = Value.Bool.from(value);
        state.digitalValues[output.port] = booleanValue.value;
        break;
      }
      case Sensor.Output.Type.Analog: {
        const u12Value = Value.U12.from(value);
        state.analogValues[output.port] = u12Value.value;
        break;
      }
    }
  };
}

export default SensorObject;
