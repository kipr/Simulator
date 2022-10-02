interface Script {
  name: string;
  language: Script.Language;
  code: string;
}

namespace Script {
  export enum Language {
    EcmaScript = 'ecmascript',
  }
}

export default Script;