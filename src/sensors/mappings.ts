import Sensor from './Sensor';
import Dict from '../Dict';

import * as Babylon from 'babylonjs';

// Maps object names to Sensors
export default {
  // Fake ET sensor
  'bodyCompoundMesh': {
    type: Sensor.Type.Et,
    forward: new Babylon.Vector3(0, 0, 18),
    origin: new Babylon.Vector3(0, 0, 18),
    output: Sensor.Output.analog(0),
    visible: true,
    maxUpdateFrequency: 15,
  },
  // Arm ET sensor
  'black satin finish plastic': {
    type: Sensor.Type.Et,
    forward: new Babylon.Vector3(0.0, 0.02, 0.0),
    origin: new Babylon.Vector3(0.02, 0.02, -0.015),
    output: Sensor.Output.analog(1),
    visible: true,
    maxUpdateFrequency: 15,
  },
  // Front touch sensor
  'collider_touch_front': {
    type: Sensor.Type.Touch,
    output: Sensor.Output.digital(0),
    maxUpdateFrequency: 15,
  },
  // Back left touch sensor
  'collider_touch_back_left': {
    type: Sensor.Type.Touch,
    output: Sensor.Output.digital(1),
    maxUpdateFrequency: 15,
  },
  // Back right touch sensor
  'collider_touch_back_right': {
    type: Sensor.Type.Touch,
    output: Sensor.Output.digital(2),
    maxUpdateFrequency: 15,
  },
} as Dict<Sensor>;