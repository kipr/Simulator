import Dict from './objectOps/Dict';
import LocalizedString from './LocalizedString';

/**
 * Type definition for I18n. It is a dictionary where each key is mapped to another dictionary,
 * which in turn maps to LocalizedString objects.
 */
export type I18n = Dict<Dict<LocalizedString>>;

const I18N = SIMULATOR_I18N as I18n;

/**
 * Retrieves a localized string based on the provided English (US) text and an optional description.
 * If the translation for the given text and description is not found, it returns an object with the
 * original English text.
 * 
 * @param {string} enUs - The English (US) text to be localized.
 * @param {string} [description] - Optional description to further specify the localization context.
 * @returns {LocalizedString} - The localized string corresponding to the given English text and 
 *                              description, or the original English text if no localization is found.
 */
export default (enUs: string, description?: string) => (I18N[description || ''] || {})[enUs] || {
  [LocalizedString.EN_US]: enUs,
};