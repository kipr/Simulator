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
        onRegistersChange: (address, value) => {
          ctx.postMessage({
            type: 'setregister',
            address: address,
            value: value
          });
        },
        registers,
        onMotorPositionClear: (motor) => {
          ctx.postMessage({
            type: 'setmotorposition',
            motor: motor
          });
        },
        getMotorPosition: (motor) => {
          ctx.postMessage({
            type: 'setmotorposition',
            motor: motor
          });
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
      registers[message.address] = message.value;

      // ctx.postMessage({
      //   type: 'setregister'
      // });
      break;
    }
    case 'setmotorposition': {

      ctx.postMessage({
        type: 'setmotorposition'
      });
      break;
    }
  } 
};