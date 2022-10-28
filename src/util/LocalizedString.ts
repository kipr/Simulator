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

  export const FALLBACKS: { [locale: string]: string[] } = {
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

  export const lookup = (localizedString: LocalizedString, locale: string) => {
    let currentLocale = locale;
    let fallbacks = FALLBACKS[locale] || [];
    let fallbackIndex = 0;

    while (!(currentLocale in localizedString)) {
      if (fallbackIndex >= fallbacks.length) return '?';
      currentLocale = fallbacks[fallbackIndex++];
    }

    return localizedString[currentLocale];
  };
}

export default LocalizedString;