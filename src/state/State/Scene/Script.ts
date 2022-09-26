interface Script {
  language: Script.Language;
  code: string;
}

namespace Script {
  export enum Language {
    EcmaScript = 'ecmascript',
  }
}

export default Script;