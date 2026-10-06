export interface Settings {
  showSettingsDialog?: boolean;
  simulationSensorNoise: boolean;
  simulationRealisticSensors: boolean;
  editorAutoComplete: boolean;
  showScripts: boolean;
  darkMode: boolean;
  classroomView: boolean;
  consoleLayout: "horizontal" | "vertical";
  interfaceMode: boolean;
}
export const DEFAULT_SETTINGS: Settings = {
  showSettingsDialog: false,
  simulationSensorNoise: false,
  simulationRealisticSensors: false,
  editorAutoComplete: false,
  showScripts: false,
  darkMode: true,
  classroomView: false,
  consoleLayout: "horizontal",
  interfaceMode: false // false = simple, true = advanced
};