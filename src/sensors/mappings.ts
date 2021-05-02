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
    visible: true
  },
  // Arm ET sensor
  'black satin finish plastic': {
    type: Sensor.Type.Et,
    forward: new Babylon.Vector3(0.0, 0.02, 0.0),
    origin: new Babylon.Vector3(0.02, 0.02, -0.015),
    output: Sensor.Output.analog(1),
    visible: true
  },
  // Front touch sensor
  'brushed steel': {
    type: Sensor.Type.Touch,
    output: Sensor.Output.digital(0)
  },
} as Dict<Sensor>;