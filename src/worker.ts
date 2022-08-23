import Protocol from './WorkerProtocol';
import dynRequire from './require';
import SharedRegisters from './SharedRegisters';

// Proper typing of Worker is tricky due to conflicting DOM and WebWorker types
// See GitHub issue: https://github.com/microsoft/TypeScript/issues/20595
const ctx: Worker = self as unknown as Worker;

const print = (s: string) => {
  ctx.postMessage({
    type: 'programoutput',
    stdoutput: s
  });
};
const printErr = (stderror: string) => {
  ctx.postMessage({
    type: 'programerror',
    stderror: stderror
  });
};

let sharedRegister_: SharedRegisters;

ctx.onmessage = (e: MessageEvent) => {
  
  const message = e.data as Protocol.Worker.Request;
  switch (message.type) {
    case 'start': {
      const mod = dynRequire(message.code, {
        setRegister8b: (address: number, value: number) => sharedRegister_.setRegister8b(address, value),
        setRegister16b: (address: number, value: number) => sharedRegister_.setRegister16b(address, value),
        setRegister32b: (address: number, value: number) => sharedRegister_.setRegister32b(address, value),
        readRegister8b: (address: number) => sharedRegister_.getRegisterValue8b(address),
        readRegister16b: (address: number) => sharedRegister_.getRegisterValue16b(address),
        readRegister32b: (address: number) => sharedRegister_.getRegisterValue32b(address),
        onStop: () => {
          ctx.postMessage({
            type: 'stopped',
          } as Protocol.Worker.StoppedRequest);
        },
      },
      print,
      printErr
      );

      mod.onRuntimeInitialized = () => {
        mod._simMainWrapper();
      };

      ctx.postMessage({
        type: 'start'
      });

      break;
    }

    case 'setsharedregisters': {
      sharedRegister_ = new SharedRegisters(message.sharedArrayBuffer);
      break;
    }
  } 
};

// Notify main thread that worker is ready for messages
ctx.postMessage({
  type: 'workerready',
} as Protocol.Worker.WorkerReadyRequest);