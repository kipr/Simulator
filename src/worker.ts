import Protocol from './WorkerProtocol';
import dynRequire from './require';
import Registers from './RegisterState';

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

const registers = new Array<number>(Registers.REG_ALL_COUNT);

ctx.onmessage = (e: MessageEvent) => {
  
  const message = e.data as Protocol.Worker.Request;
  switch (message.type) {
    case 'start': {
      const mod = dynRequire(message.code, {
        onRegistersChange: (registers) => {
          if (registers.length > 0) {
            ctx.postMessage({
              type: 'setregister',
              registers,
            } as Protocol.Worker.SetRegisterRequest);
          }
        },
        registers,
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

    case 'setregister': {
      for (const register of message.registers) {
        registers[register.address] = register.value;
      }
      break;
    }
  } 
};

// Notify main thread that worker is ready for messages
ctx.postMessage({
  type: 'workerready',
} as Protocol.Worker.WorkerReadyRequest);