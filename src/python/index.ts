// This file interacts with many untyped things, unfortunately.
// The following ESLint rules are disabled:

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import registersDevice from './registersDevice';
import SharedRegisters from '../SharedRegisters';

export interface PythonParams {
  code: string;
  printErr: (stderr: string) => void;
  print: (stdout: string) => void;

  registers: SharedRegisters;
}

let python: (params: PythonParams) => Promise<void>;
if (SIMULATOR_HAS_CPYTHON) {
  // This is on a non-standard path specified in the webpack config.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const PythonEmscripten = require('python.js');

  /**
   * Initializes the Python interpreter.
   */
  python = async (params: PythonParams) => {
    const libkipr = await fetch('/libkipr/python/kipr.wasm');
    const libkiprBuffer = await libkipr.arrayBuffer();

    const kiprPy = await fetch('/libkipr/python/binding/python/package/src/kipr/kipr.py');
    const kiprPyBuffer = await kiprPy.text();

    await PythonEmscripten.default({
      locateFile: (path: string, prefix: string) => {
        return `/cpython/${path}`;
      },
      preRun: [function (module: any) {
        const a = module.FS.makedev(64, 0);
        module.FS.registerDevice(a, registersDevice({
          registers: params.registers
        }));
        module.FS.mkdev('/registers', a);
        module.FS.mkdir('/kipr');
        module.FS.writeFile('/kipr/_kipr.so', new Uint8Array(libkiprBuffer));

        module.FS.writeFile('/kipr/__init__.py', kiprPyBuffer);
        
        module.FS.writeFile('main.py', `
import sys
sys.path.append('/')
sys.path.append('/kipr')
del sys
${params.code}
  `);

      }],
      arguments: ['main.py'],
      ...params
    });
  };
} else {
  // eslint-disable-next-line @typescript-eslint/require-await
  python = async (params: PythonParams) => {
    params.printErr('Python is not available.');
  };
}

export default python;