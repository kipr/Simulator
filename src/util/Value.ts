import { TAU } from "../math";

export interface UnitlessValue {
  value: number;
}

export namespace UnitlessValue {

}

export namespace Angle {
  export enum Type {
    Radians,
    Degrees
  }

  export interface Radians extends UnitlessValue {
    type: Type.Radians;
  }

  export interface Degrees extends UnitlessValue {
    type: Type.Degrees;
  }

  export const degrees = (value: number): Degrees => ({ type: Type.Degrees, value });
  export const radians = (value: number): Radians => ({ type: Type.Radians, value });

  export const toRadians = (angle: Angle): Radians => {
    switch (angle.type) {
      case Type.Radians: return angle;
      case Type.Degrees: return {
        type: Type.Radians,
        value: angle.value / 360 * TAU
      };
    }
  };

  export const toDegrees = (angle: Angle): Degrees => {
    switch (angle.type) {
      case Type.Degrees: return angle;
      case Type.Radians: return {
        type: Type.Degrees,
        value: angle.value / TAU * 360
      };
    }
  };

  export const toDegreesValue = (angle: Angle) => toDegrees(angle).value;
  export const toRadiansValue = (angle: Angle) => toRadians(angle).value;

  export const unitName = (angle: Angle) => {
    switch (angle.type) {
      case Type.Degrees: return 'degrees';
      case Type.Radians: return 'radians';
    }
  };
}

export type Angle = Angle.Radians | Angle.Degrees;

export namespace Distance {
  export enum Type {
    Meters,
    Centimeters,
    Feet,
    Inches,
  }

  export interface Meters extends UnitlessValue {
    type: Type.Meters;
  }
  export const meters = (value: number): Meters => ({ type: Type.Meters, value });

  export interface Centimeters extends UnitlessValue {
    type: Type.Centimeters;
  }
  export const centimeters = (value: number): Centimeters => ({ type: Type.Centimeters, value });

  export interface Feet extends UnitlessValue {
    type: Type.Feet;
  }
  export const feet = (value: number): Feet => ({ type: Type.Feet, value });

  export interface Inches extends UnitlessValue {
    type: Type.Inches;
  }
  export const inches = (value: number): Inches => ({ type: Type.Inches, value });

  export const unitName = (distance: Distance) => {
    switch (distance.type) {
      case Type.Meters: return 'meters';
      case Type.Centimeters: return 'centimeters';
      case Type.Feet: return 'feet';
      case Type.Inches: return 'inches';
    }
  };
}

export type Distance = (
  Distance.Meters |
  Distance.Centimeters |
  Distance.Feet |
  Distance.Inches
);

import AngleValue = Angle;
import DistanceValue = Distance;


export namespace Value {
  export enum Type {
    Angle,
    Distance
  }

  export interface Angle {
    type: Type.Angle;
    angle: AngleValue;
  }

  export const angle = (angle: AngleValue): Angle => ({ type: Type.Angle, angle });


  export interface Distance {
    type: Type.Distance;
    distance: DistanceValue;
  }

  export const distance = (distance: DistanceValue): Distance => ({ type: Type.Distance, distance });

  export const value = (value: Value) => {
    switch (value.type) {
      case Type.Angle: return value.angle.value;
      case Type.Distance: return value.distance.value;
    }
  };

  export const unitName = (value: Value) => {
    switch (value.type) {
      case Type.Angle: return AngleValue.unitName(value.angle);
      case Type.Distance: return DistanceValue.unitName(value.distance);
    }
  };

  export const toAngle = (value: Value): AngleValue => (value as unknown as Angle).angle;
  export const toDistance = (value: Value): DistanceValue => (value as unknown as Distance).distance;

  export const copyValue = (value: Value, num: number): Value => {
    switch (value.type) {
      case Type.Angle: return {
        ...value,
        angle: {
          ...value.angle,
          value: num
        }
      };
      case Type.Distance: return {
        ...value,
        distance: {
          ...value.distance,
          value: num
        }
      };
    }
  };
}

export type Value = Value.Angle | Value.Distance;