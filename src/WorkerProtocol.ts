import ProgrammingLanguage from './ProgrammingLanguage';

export namespace Protocol {
  export namespace Worker {
    export interface StartRequest {
      type: 'start';
      language: ProgrammingLanguage;
      code: string;
    }

    export type Request = (
      StartRequest |
      SetSharedRegistersRequest |
      SetSharedConsoleRequest |
      ProgramOutputRequest |
      ProgramErrorRequest |
      WorkerReadyRequest |
      StoppedRequest
    );

    export interface StartResponse {
      type: 'start';
    }

    export interface SetSharedRegistersRequest {
      type: 'set-shared-registers';
      sharedArrayBuffer: SharedArrayBuffer;
    }

    export interface SetSharedConsoleRequest {
      type: 'set-shared-console';
      sharedArrayBuffer: SharedArrayBuffer;
    }

    export interface ProgramEndedRequest {
      type: 'program-ended'
    }

    export interface ProgramEndedResponse {
      type: 'program-ended'
    }

    export type Response = StartResponse | ProgramEndedResponse;

    export interface ProgramOutputRequest {
      type: 'program-output';
      stdoutput: string;
    }
    
    export interface ProgramErrorRequest {
      type: 'program-error';
      stdoutput: string;
      stderror: string;
    }
    
    export interface WorkerReadyRequest {
      type: 'worker-ready';
    }

    export interface StoppedRequest {
      type: 'stopped'
    }
  }
}

export default Protocol;