import Protocol from './WorkerProtocol';
import dynRequire from './require';
import Registers from './RegisterState';

const ctx: Worker = self as any;
ctx.onmessage = (e) => {
  const message:Protocol.Worker.Request = e.data;
  const registers = new Array<number>(Registers.REG_ALL_COUNT);
  switch (message.type) {
    case 'start': {
      const mod = dynRequire(message.code, {
        onRegistersChange: (address, value) => {
          ctx.postMessage({
            type: 'setregister',
            address: address,
            value: value
          });
          console.log("ASDASD");
        },
        registers
      });

      
      
      mod.onRuntimeInitialized = () => {
        mod._main();
        ctx.postMessage({
          type: 'program-ended'
        })
      };

      ctx.postMessage({
        type: 'start'
      });

      break;
    }
    case 'setregister':{
      registers[message.address] = message.value;

      ctx.postMessage({
        type: 'setregister'
      });
      break;
    }
  } 
}