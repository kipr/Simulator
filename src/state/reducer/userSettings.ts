import { UserSettings } from '../State';
import { Space } from '../../simulator/Space';
import { DEFAULT_SETTINGS, Settings } from '../../components/constants/Settings';
import construct from '../../util/redux/construct';

export namespace SettingsAction {
  export interface UpdateSettings {
    type: 'settings/updateSettings';
    newVal: Partial<Settings>;
  }

  export const updateSettings = construct<UpdateSettings>('settings/updateSettings');
}

export type SettingsAction = SettingsAction.UpdateSettings;

export const reduceUserSettings = (state: UserSettings = { settings: DEFAULT_SETTINGS }, action: SettingsAction): UserSettings => {
  const nextSettings: Settings = {
    ...state.settings,
    ...action.newVal,
  };

  // I hate making this impure, but it has to go somewhere
  if ('simulationRealisticSensors' in action) {
    Space.getInstance().realisticSensors = nextSettings.simulationRealisticSensors;
  }

  if ('simulationSensorNoise' in action) {
    Space.getInstance().noisySensors = nextSettings.simulationSensorNoise;
  }

  switch (action.type) {
    case 'settings/updateSettings':
      return {
        ...state,
        settings: nextSettings,
      };
    default:
      return state;
  }
};
