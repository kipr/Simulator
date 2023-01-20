import Dict from './Dict';
import LocalizedString from './util/LocalizedString';

export type I18n = Dict<Dict<LocalizedString>>;

const I18N = SIMULATOR_I18N as I18n;

export default (enUs: string, description?: string) => (I18N[description || ''] || {})[enUs] || {
  [LocalizedString.EN_US]: enUs,
};