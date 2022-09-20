enum MotorMode {
  Pwm,
  Position,
  Speed,
  SpeedPosition,
}

namespace MotorMode {
  export const fromBits = (bits: number): MotorMode => {
    switch (bits) {
      case 0: return MotorMode.Pwm;
      case 1: return MotorMode.Position;
      case 2: return MotorMode.Speed;
      case 3: return MotorMode.SpeedPosition;
      default: throw new Error(`Invalid motor mode: ${bits}`);
    }
  };
}

export default MotorMode;