export interface EmscriptenModule {
  context: ModuleContext,
  print: (s: string) => void,
  err: (stdout: string, stderror: string) => void,
  onRuntimeInitialized?: () => void,
  _simMainWrapper?: () => void,
}

export interface ModuleContext {
  registers?: Array<number>,
  onRegistersChange?: (address: number, value: number) => void,
  onMotorPositionClear?: (port: number) => void,
  getMotorPosition?: (port: number) => void,
}

export default (code: string, context: ModuleContext, print: (s: string) => void, err: (stdout: string, stderror: string) => void): EmscriptenModule => {
  const mod: EmscriptenModule = {
    context,
    print,
    err 
  };

  // Disable eslint rule - dynamic evaluation of user code is needed here
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function("Module", `"use strict"; ${code}`)(mod);
  return mod;
};