export interface Motor {
  mode: Motor.Mode;
  direction: Motor.Direction;

  position: number;
  pwm: number;

  done: boolean;

  positionGoal: number;
  speedGoal: number;

  kP: number;
  kI: number;
  kD: number;
}

export namespace Motor {
  export enum Direction {
    Idle,
    Forward,
    Backward,
    Brake,
  }
  
  export namespace rDirection {
    export const fromBits = (bits: number): Direction => {
      switch (bits) {
        case 0: return Direction.Idle;
        case 1: return Direction.Forward;
        case 2: return Direction.Backward;
        case 3: return Direction.Brake;
        default: throw new Error(`Invalid motor direction: ${bits}`);
      }
    };
  }

  export enum Mode {
    Pwm,
    Position,
    Speed,
    SpeedPosition,
  }
  
  export namespace Mode {
    export const fromBits = (bits: number): Mode => {
      switch (bits) {
        case 0: return Mode.Pwm;
        case 1: return Mode.Position;
        case 2: return Mode.Speed;
        case 3: return Mode.SpeedPosition;
        default: throw new Error(`Invalid motor mode: ${bits}`);
      }
    };
  }
  
  
  export const NIL: Motor = {
    mode: Mode.Pwm,
    direction: Direction.Idle,
    position: 0,
    pwm: 0,
    done: true,
    positionGoal: 0,
    speedGoal: 0,
    kP: 2000 / 1000,
    kI: 200 / 1000,
    kD: 1 / 1000
  };
}