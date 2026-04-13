import construct from '../../util/redux/construct';
import { Settings } from 'state/State';

export namespace SettingsAction {
  export interface UpdateSettings {
    type: 'settings/update-settings';
    settings: Partial<Settings>;
  }

  export const updateSettings = construct<UpdateSettings>('settings/update-settings');

}

export type SettingsAction = SettingsAction.UpdateSettings;

export const reduceSettings = (state: Settings = initialSettings, action: SettingsAction): Settings => {
  switch (action.type) {
    case 'settings/update-settings':
      return {
        ...state,
        ...action.settings,
      };
    default:
      return state;
  }
};

export const initialSettings: Settings = {
  simulationSensorNoise: false,
  simulationRealisticSensors: false,
  editorAutoComplete: false,
  showScripts: false,
  ideEditorDarkMode: true,
  classroomView: false,
  consoleLayout: "horizontal",
  interfaceMode: false // false = simple, true = advanced
};

