import { I18n } from '../State';
import construct from '../../util/redux/construct';
import LocalizedString from '../../util/LocalizedString';

export namespace I18nAction {
  export interface SetLocale {
    type: 'i18n/set-locale';
    locale: LocalizedString.Language;
  }

  export const setLocale = construct<SetLocale>('i18n/set-locale');
}

export type I18nAction = I18nAction.SetLocale;

export const reduceI18n = (state: I18n = { locale: LocalizedString.EN_US }, action: I18nAction): I18n => {
  switch (action.type) {
    case 'i18n/set-locale':
      return {
        ...state,
        locale: action.locale,
      };
    default:
      return state;
  }
};