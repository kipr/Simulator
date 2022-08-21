// This file interacts with many untyped things, unfortunately.
// The following ESLint rules are disabled:

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import Protocol from '../WorkerProtocol';

import registersDevice from './registersDevice';

export interface PythonParams {
  code: string;
  printErr: (stderr: string) => void;
  print: (stdout: string) => void;

  onRegistersChange: (registers: Protocol.Worker.Register[]) => void;
  registers: number[];
}

/**
 * Initializes the Python interpreter.
 */
export default async (params: PythonParams) => {
  
  // We dynamically import the Python JS blob.

  let PythonEmscripten: any;
  try {
    // @ts-ignore
    PythonEmscripten = await import(/* webpackIgnore: true */ '/cpython/python.js');
  } catch (e) {
    params.printErr(e);
    return;
  }

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
        onRegistersChange: params.onRegistersChange,
        registers: params.registers
      }));
      module.FS.mkdev('/registers', a);
      module.FS.mkdir('/kipr');
      module.FS.writeFile('/kipr/_kipr.so', new Uint8Array(libkiprBuffer));

      module.FS.writeFile('/kipr/__init__.py', kiprPyBuffer);
      
      module.FS.writeFile('main.py', `
import sys
sys.path.append('/')
del sys
${params.code}
`);

    }],
    arguments: ['main.py'],
    ...params
  });
};