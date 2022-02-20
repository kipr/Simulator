import * as Babylon from 'babylonjs';
import { EtSensor } from './EtSensor';
import { IrSensor } from './IrSensor';

import Sensor from './Sensor';
import SensorObject from './SensorObject';
import { TouchSensor } from './TouchSensor';

export { default as Sensor } from './Sensor';
export { default as SensorObject } from './SensorObject';
export * from './EtSensor';
export * from './TouchSensor';
export { default as MAPPINGS } from './mappings';

export const instantiate = (scene: Babylon.Scene, id: string, sensor: Sensor): SensorObject => {
  const mesh = scene.getMeshByID(id) || scene.getMeshByName(id);
  if (!mesh) throw new Error(`Failed to lookup mesh by ID or name (${id})`);

  switch (sensor.type) {
    case Sensor.Type.Et:
      return new EtSensor({ scene, mesh, sensor });
    case Sensor.Type.Ir:
      return new IrSensor({ scene, mesh, sensor });
    case Sensor.Type.Touch:
      return new TouchSensor({ scene, mesh, sensor });
  }
};