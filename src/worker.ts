import Protocol from './WorkerProtocol';
import dynRequire from './require';
import Registers from './RegisterState';

const ctx: Worker = self as any;
ctx.onmessage = (e) => {
  const message = e.data;

  switch (message.type) {
    case 'start': {
      const mod = dynRequire(message.code, {
        onRegistersChange: () => {

        },
        registers: new Array<number>(Registers.REG_ALL_COUNT)
      });

      
      
      mod.onRuntimeInitialized = () => {
        mod._main();
      };

      ctx.postMessage({
        type: 'start'
      });

      break;
    }
  } 
}