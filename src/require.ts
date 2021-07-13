import Protocol from './WorkerProtocol';

export interface EmscriptenModule {
  context: ModuleContext,
  print: (s: string) => void,
  printErr: (stderror: string) => void,
  onRuntimeInitialized?: () => void,
  _simMainWrapper?: () => void,
}

export interface ModuleContext {
  registers?: Array<number>,
  onRegistersChange?: (registers: Protocol.Worker.Register[]) => void,
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