import Robot from "../../../state/State/Robot";
import Geometry from "../../../state/State/Robot/Geometry";
import { DEMOBOT } from "./demobot";
import { MODELS } from '../models';

/**
 * Special demobot with no collision box over the reflectance sensor.
 * When it has the collider, it can't drive straight up the ramp because the
 * wheels always leave the ground.
 */
export const DEMOBOT_NO_REFLECTANCE: Robot = {
  ...DEMOBOT,
  geometry: {
    ...DEMOBOT.geometry,
    chassis_link: Geometry.remoteMesh({ uri: MODELS.robots.demobot.chassisNoReflectance }),
  },
};
