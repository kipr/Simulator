export interface Settings {
  showScripts: boolean;
  simulationSensorNoise: boolean;
  simulationRealisticSensors: boolean;
  editorAutoComplete: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  showScripts: false,
  simulationSensorNoise: false,
  simulationRealisticSensors: false,
  editorAutoComplete: false,
};
