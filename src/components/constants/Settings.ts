export interface Settings {
  simulationSensorNoise: boolean;
  simulationRealisticSensors: boolean;
  editorAutoComplete: boolean;
  showScripts: boolean;
  ideEditorDarkMode: boolean;
  classroomView: boolean;
  consoleLayout: "horizontal" | "vertical";
  interfaceMode: boolean;
}
export const DEFAULT_SETTINGS: Settings = {
  simulationSensorNoise: false,
  simulationRealisticSensors: false,
  editorAutoComplete: false,
  showScripts: false,
  ideEditorDarkMode: true,
  classroomView: false,
  consoleLayout: "horizontal",
  interfaceMode: false //false = simple, true = advanced
};