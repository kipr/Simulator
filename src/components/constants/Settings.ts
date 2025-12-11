export interface Settings {
  simulationSensorNoise: boolean;
  simulationRealisticSensors: boolean;
  editorAutoComplete: boolean;
  ideEditorDarkMode: boolean;
  classroomView: boolean;
  consoleLayout: "horizontal" | "vertical";
  interfaceMode: boolean;
}
export const DEFAULT_SETTINGS: Settings = {
  simulationSensorNoise: false,
  simulationRealisticSensors: false,
  editorAutoComplete: false,
  ideEditorDarkMode: true,
  classroomView: false,
  consoleLayout: "horizontal",
  interfaceMode: false //false = simple, true = advanced
};