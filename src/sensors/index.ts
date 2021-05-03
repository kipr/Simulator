import * as Babylon from 'babylonjs';
import { EtSensor } from './EtSensor';

import Sensor from './Sensor';
import SensorObject from './SensorObject';
import { TouchSensor } from './TouchSensor';

import Dict from '../Dict';

export { default as Sensor } from './Sensor';
export { default as SensorObject } from './SensorObject';
export * from './EtSensor';
export * from './TouchSensor';
export { default as MAPPINGS } from './mappings';

const SENSOR_OBJECT_CONSTRUCTORS: Dict<SensorObject.Constructor<Sensor>> = {
  [Sensor.Type.Et]: EtSensor,
  [Sensor.Type.Touch]: TouchSensor
};

export const instantiate = <T extends Sensor>(scene: Babylon.Scene, id: string, sensor: T): SensorObject => {
  const mesh = scene.getMeshByID(id) || scene.getMeshByName(id);
  if (!mesh) throw new Error(`Failed to lookup mesh by ID or name (${id})`);
  
  const sensorObjectConstructor = SENSOR_OBJECT_CONSTRUCTORS[sensor.type];
  if (!sensorObjectConstructor) throw new Error(`No associated SensorObject constructor for Sensor type "${Sensor.Type.toString(sensor.type)}"`);

  return new sensorObjectConstructor({ scene, mesh, sensor });
};