import Dict from '../Dict';
import LocalizedString from '../util/LocalizedString';

const I18N = SIMULATOR_I18N as Dict<LocalizedString>;

export default (id: string) => {
  const localizedString = I18N[id] || {
    [LocalizedString.EN_US]: id,
  };
  return (language: LocalizedString.Language) => LocalizedString.lookup(localizedString, language);
};