import Protocol from './WorkerProtocol';
import dynRequire from './require';


const ctx: Worker = self as any;

ctx.onmessage = (e) => {
  const message = e.data;

  switch (message.type) {
    case 'start': {
      const mod = dynRequire(message.code);
      
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