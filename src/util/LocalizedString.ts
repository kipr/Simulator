interface LocalizedString {
  [locale: string]: string;
}

namespace LocalizedString {
  // English
  export const EN_US = 'en-US';
  export const EN_UK = 'en-UK';
  // Chinese
  export const ZH_CN = 'zh-CN';
  export const ZH_TW = 'zh-TW';
  // Japanese
  export const JA_JP = 'ja-JP';
  // Korean
  export const KO_KR = 'ko-KR';
  // Hindi
  export const HI_IN = 'hi-IN';
  // Spanish
  export const ES_ES = 'es-ES';
  export const ES_MX = 'es-MX';
  // French
  export const FR_FR = 'fr-FR';
  // German
  export const DE_DE = 'de-DE';
  // Italian
  export const IT_IT = 'it-IT';
  // Portuguese
  export const PT_BR = 'pt-BR';
  export const PT_PT = 'pt-PT';
  // Russian
  export const RU_RU = 'ru-RU';
  // Arabic
  export const AR_SA = 'ar-SA';
  // Turkish
  export const TR_TR = 'tr-TR';
  // Polish
  export const PL_PL = 'pl-PL';
  // Dutch
  export const NL_NL = 'nl-NL';
  // Swedish
  export const SV_SE = 'sv-SE';
  // Danish
  export const DA_DK = 'da-DK';
  // Norwegian
  export const NO_NO = 'no-NO';
  // Finnish
  export const FI_FI = 'fi-FI';
  // Hungarian
  export const HU_HU = 'hu-HU';
  // Czech
  export const CS_CZ = 'cs-CZ';
  // Slovak
  export const SK_SK = 'sk-SK';
  // Romanian
  export const RO_RO = 'ro-RO';
  // Bulgarian
  export const BG_BG = 'bg-BG';
  // Greek
  export const EL_GR = 'el-GR';
  // Hebrew
  export const HE_IL = 'he-IL';
  // Thai
  export const TH_TH = 'th-TH';
  // Vietnamese
  export const VI_VN = 'vi-VN';
  // Indonesian
  export const ID_ID = 'id-ID';
  // Malay
  export const MS_MY = 'ms-MY';
  // Persian
  export const FA_IR = 'fa-IR';
  // Urdu
  export const UR_PK = 'ur-PK';

  export type Language = (
    typeof EN_US | typeof EN_UK |
    typeof ZH_CN | typeof ZH_TW |
    typeof JA_JP |
    typeof KO_KR |
    typeof HI_IN |
    typeof ES_ES | typeof ES_MX |
    typeof FR_FR |
    typeof DE_DE |
    typeof IT_IT |
    typeof PT_BR | typeof PT_PT |
    typeof RU_RU |
    typeof AR_SA |
    typeof TR_TR |
    typeof PL_PL |
    typeof NL_NL |
    typeof SV_SE |
    typeof DA_DK |
    typeof NO_NO |
    typeof FI_FI |
    typeof HU_HU |
    typeof CS_CZ |
    typeof SK_SK |
    typeof RO_RO |
    typeof BG_BG |
    typeof EL_GR |
    typeof HE_IL |
    typeof TH_TH |
    typeof VI_VN |
    typeof ID_ID |
    typeof MS_MY |
    typeof FA_IR |
    typeof UR_PK
  );

  export const FALLBACKS: { [locale in Language]: Language[] } = {
    [EN_US]: [],
    [EN_UK]: [EN_US],
    [ZH_CN]: [EN_US],
    [ZH_TW]: [ZH_CN, EN_US],
    [JA_JP]: [EN_US],
    [KO_KR]: [EN_US],
    [HI_IN]: [EN_US],
    [ES_ES]: [EN_US],
    [ES_MX]: [ES_ES, EN_US],
    [FR_FR]: [EN_US],
    [DE_DE]: [EN_US],
    [IT_IT]: [EN_US],
    [PT_BR]: [EN_US],
    [PT_PT]: [PT_BR, EN_US],
    [RU_RU]: [EN_US],
    [AR_SA]: [EN_US],
    [TR_TR]: [EN_US],
    [PL_PL]: [EN_US],
    [NL_NL]: [EN_US],
    [SV_SE]: [EN_US],
    [DA_DK]: [EN_US],
    [NO_NO]: [EN_US],
    [FI_FI]: [EN_US],
    [HU_HU]: [EN_US],
    [CS_CZ]: [EN_US],
    [SK_SK]: [EN_US],
    [RO_RO]: [EN_US],
    [BG_BG]: [EN_US],
    [EL_GR]: [EN_US],
    [HE_IL]: [EN_US],
    [TH_TH]: [EN_US],
    [VI_VN]: [EN_US],
    [ID_ID]: [EN_US],
    [MS_MY]: [EN_US],
    [FA_IR]: [EN_US],
    [UR_PK]: [EN_US]
  };

  export const lookup = (localizedString: LocalizedString, locale: Language) => {
    let currentLocale = locale;
    const fallbacks = FALLBACKS[locale] || [];
    let fallbackIndex = 0;

    while (!(currentLocale in localizedString)) {
      if (fallbackIndex >= fallbacks.length) return '?';
      currentLocale = fallbacks[fallbackIndex++];
    }

    return localizedString[currentLocale];
  };

  export const SUPPORTED_LANGUAGES = [
    LocalizedString.AR_SA,
    LocalizedString.BG_BG,
    LocalizedString.CS_CZ,
    LocalizedString.DA_DK,
    LocalizedString.DE_DE,
    LocalizedString.EL_GR,
    LocalizedString.EN_UK,
    LocalizedString.EN_US,
    LocalizedString.ES_ES,
    LocalizedString.ES_MX,
    LocalizedString.FA_IR,
    LocalizedString.FI_FI,
    LocalizedString.FR_FR,
    LocalizedString.HE_IL,
    LocalizedString.HI_IN,
    LocalizedString.HU_HU,
    LocalizedString.ID_ID,
    LocalizedString.IT_IT,
    LocalizedString.JA_JP,
    LocalizedString.KO_KR,
    LocalizedString.MS_MY,
    LocalizedString.NL_NL,
    LocalizedString.NO_NO,
    LocalizedString.PL_PL,
    LocalizedString.PT_BR,
    LocalizedString.PT_PT,
    LocalizedString.RO_RO,
    LocalizedString.RU_RU,
    LocalizedString.SK_SK,
    LocalizedString.SV_SE,
    LocalizedString.TH_TH,
    LocalizedString.TR_TR,
    LocalizedString.UR_PK,
    LocalizedString.VI_VN,  
    LocalizedString.ZH_CN,
    LocalizedString.ZH_TW,
  ];

  export const NATIVE_LOCALE_NAMES: { [locale in Language]: string } = {
    [LocalizedString.AR_SA]: 'العربية',
    [LocalizedString.BG_BG]: 'български',
    [LocalizedString.CS_CZ]: 'čeština',
    [LocalizedString.DA_DK]: 'dansk',
    [LocalizedString.DE_DE]: 'Deutsch',
    [LocalizedString.EL_GR]: 'ελληνικά',
    [LocalizedString.EN_UK]: 'English (UK)',
    [LocalizedString.EN_US]: 'English (US)',
    [LocalizedString.ES_ES]: 'español',
    [LocalizedString.ES_MX]: 'español (MX)',
    [LocalizedString.FA_IR]: 'فارسی',
    [LocalizedString.FI_FI]: 'suomi',
    [LocalizedString.FR_FR]: 'français',
    [LocalizedString.HE_IL]: 'עברית',
    [LocalizedString.HI_IN]: 'हिन्दी',
    [LocalizedString.HU_HU]: 'magyar',
    [LocalizedString.ID_ID]: 'Bahasa Indonesia',
    [LocalizedString.IT_IT]: 'italiano',
    [LocalizedString.JA_JP]: '日本語',
    [LocalizedString.KO_KR]: '한국어',
    [LocalizedString.MS_MY]: 'Bahasa Melayu',
    [LocalizedString.NL_NL]: 'Nederlands',
    [LocalizedString.NO_NO]: 'norsk',
    [LocalizedString.PL_PL]: 'polski',
    [LocalizedString.PT_BR]: 'português (BR)',
    [LocalizedString.PT_PT]: 'português (PT)',
    [LocalizedString.RO_RO]: 'română',
    [LocalizedString.RU_RU]: 'русский',
    [LocalizedString.SK_SK]: 'slovenčina',
    [LocalizedString.SV_SE]: 'svenska',
    [LocalizedString.TH_TH]: 'ไทย',
    [LocalizedString.TR_TR]: 'Türkçe',
    [LocalizedString.UR_PK]: 'اردو',
    [LocalizedString.VI_VN]: 'Tiếng Việt',
    [LocalizedString.ZH_CN]: '简体中文',
    [LocalizedString.ZH_TW]: '繁體中文',
  };
}

export default LocalizedString;