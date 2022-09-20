enum MotorDirection {
  Idle,
  Forward,
  Backward,
  Brake,
}

namespace MotorDirection {
  export const fromBits = (bits: number): MotorDirection => {
    switch (bits) {
      case 0: return MotorDirection.Idle;
      case 1: return MotorDirection.Forward;
      case 2: return MotorDirection.Backward;
      case 3: return MotorDirection.Brake;
      default: throw new Error(`Invalid motor direction: ${bits}`);
    }
  };
}

export default MotorDirection;