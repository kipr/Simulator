// import Worker from "worker-loader!./worker";
import Protocol from './WorkerProtocol';



class WorkerInstance {
  start(code: string) {
    this.worker_.postMessage({
      type: 'stop'
    });
    this.worker_.postMessage({
      type: 'start',
      code
    });
  }

  stop() {
    this.worker_.postMessage({
      type: 'stop'
    });
  }

  private worker_ = new Worker('/js/worker.min.js');
}

export default new WorkerInstance();