import Sensor from './Sensor';
import Dict from '../Dict';

import * as Babylon from 'babylonjs';

// Maps object names to Sensors
export default {
  // Arm ET sensor
  'black satin finish plastic': {
    type: Sensor.Type.Et,
    forward: new Babylon.Vector3(0.0, 0.02, 0.0),
    origin: new Babylon.Vector3(0.02, 0.02, -0.015),
    output: Sensor.Output.analog(0),
    maxUpdateFrequency: 3,
  },
  // Front touch sensor
  'collider_touch_front': {
    type: Sensor.Type.Touch,
    output: Sensor.Output.digital(0),
    maxUpdateFrequency: 3,
  },
  // Back left touch sensor
  'collider_touch_back_left': {
    type: Sensor.Type.Touch,
    output: Sensor.Output.digital(1),
    maxUpdateFrequency: 3,
  },
  // Back right touch sensor
  'collider_touch_back_right': {
    type: Sensor.Type.Touch,
    output: Sensor.Output.digital(2),
    maxUpdateFrequency: 3,
  },
} as Dict<Sensor>;