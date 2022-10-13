interface Script {
  name: string;
  language: Script.Language;
  code: string;
}

namespace Script {
  export enum Language {
    EcmaScript = 'ecmascript',
  }

  export const ecmaScript = (name: string, code: string): Script => ({
    name,
    language: Language.EcmaScript,
    code,
  });
}

export default Script;