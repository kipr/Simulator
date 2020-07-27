import Protocol from './WorkerProtocol';
import dynRequire from './require';
import Registers from './RegisterState';
import WorkerInstance from './WorkerInstance';

const ctx: Worker = self as any;
const print = (s: string)=>{
  ctx.postMessage({
    type: 'programoutput',
    stdoutput: s
  })
}
const err = (stdoutput: string, stderror: string) => {
  ctx.postMessage({
    type: 'programerror',
    stderror: stderror
  })
}

const registers = new Array<number>(Registers.REG_ALL_COUNT);

ctx.onmessage = (e) => {
  
  const message:Protocol.Worker.Request = e.data;
  switch (message.type) {
    case 'start': {
      const mod = dynRequire(message.code, {
        onRegistersChange: (address, value) => {
          ctx.postMessage({
            type: 'setregister',
            address: address,
            value: value
          });
          //console.log("ASDASD");
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
      err
      );

      mod.onRuntimeInitialized = () => {
        mod._main();
        // TODO: Had to remove this because _main() is no longer synchronous
        //       Need to implement some way of knowing when _main() actually ends
        // ctx.postMessage({
        //   type: 'program-ended'
        // })
      };

      ctx.postMessage({
        type: 'start'
      });

      break;
    }

    case 'compile': {
      const mod = dynRequire(message.code,{},
        print,
        err
      );

      mod.onRuntimeInitialized = () => {
        mod._main();
        ctx.postMessage({
          type: 'program-ended'
        })
      };

      ctx.postMessage({
        type: 'compile'
      });

      break;
    }
    case 'setregister':{
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
}