import { motorPwm } from '../../src/simulator/babylonBindings/motorPwm';

describe('motor PWM plug handling', () => {
  it.each([
    { plug: 1 as const, logical: 200, physical: 200 },
    { plug: -1 as const, logical: 200, physical: -200 },
  ])('keeps logical PWM stable for plug $plug', ({ plug, logical, physical }) => {
    expect(motorPwm(logical, plug)).toEqual({ logical, physical });
  });

  it('clamps before applying plug polarity', () => {
    expect(motorPwm(-500, -1)).toEqual({ logical: -400, physical: 400 });
  });
});
