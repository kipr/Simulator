import Dict from './Dict';
import LocalizedString from './util/LocalizedString';

const I18N = SIMULATOR_I18N as Dict<LocalizedString>;

export default (id: string, description?: string) => I18N[id] || {
  [LocalizedString.EN_US]: id,
};