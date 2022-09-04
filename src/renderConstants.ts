import { Distance } from './util';

export const RENDER_SCALE: Distance.Type = 'centimeters';
export const RENDER_SCALE_METERS_MULTIPLIER: number = Distance.toType(Distance.meters(1), RENDER_SCALE).value;