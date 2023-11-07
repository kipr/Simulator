export interface EmscriptenModule {
  context: ModuleContext,
  print: (s: string) => void,
  printErr: (stderror: string) => void,
  onRuntimeInitialized?: () => void,
  _main?: () => void,
}

export interface ModuleContext {
  setRegister8b?: (address: number, value: number) => void,
  setRegister16b?: (address: number, value: number) => void,
  setRegister32b?: (address: number, value: number) => void,
  readRegister8b?: (address: number) => number,
  readRegister16b?: (address: number) => number,
  readRegister32b?: (address: number) => number,
  onStop?: () => void;
}

export default (code: string, context: ModuleContext, print: (s: string) => void, printErr: (stderror: string) => void): EmscriptenModule => {
  const mod: EmscriptenModule = {
    context,
    print,
    printErr,
  };

  // Disable eslint rule - dynamic evaluation of user code is needed here
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function("Module", `"use strict"; ${code}`)(mod);
  return mod;
};