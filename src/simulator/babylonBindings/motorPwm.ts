import { clamp } from '../../util/math/math';

export interface MotorPwm {
  /** The logical PWM retained in the shared motor registers. */
  logical: number;
  /** The PWM sent to the physics constraint after applying plug polarity. */
  physical: number;
}

export const motorPwm = (requested: number, plug: 1 | -1): MotorPwm => {
  const logical = clamp(-400, requested, 400);
  return {
    logical,
    physical: plug * logical,
  };
};
