export namespace Protocol {
  export namespace Worker {
    export interface StartRequest {
      type: 'start';
      code: string;
    }

    export type Request = (
      StartRequest |
      SetSharedRegistersRequest |
      ProgramOutputRequest |
      ProgramErrorRequest |
      WorkerReadyRequest |
      StoppedRequest
    );

    export interface StartResponse {
      type: 'start';
    }

    export type Response = StartResponse;

    export interface SetSharedRegistersRequest {
      type: 'setsharedregisters';
      sharedArrayBuffer: SharedArrayBuffer;
    }

    export interface ProgramOutputRequest {
      type: 'programoutput';
      stdoutput: string;
    }
    
    export interface ProgramErrorRequest {
      type: 'programerror';
      stdoutput: string;
      stderror: string;
    }
    
    export interface WorkerReadyRequest {
      type: 'workerready';
    }

    export interface StoppedRequest {
      type: 'stopped'
    }
  }
}

export default Protocol;