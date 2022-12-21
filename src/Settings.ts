export interface Settings {
  simulationSensorNoise: boolean;
  simulationRealisticSensors: boolean;
  editorAutoComplete: boolean;
  darkModeToggle: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  simulationSensorNoise: false,
  simulationRealisticSensors: false,
  editorAutoComplete: false,
  darkModeToggle: true,
};