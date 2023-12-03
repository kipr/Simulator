import ProgrammingLanguage from './ProgrammingLanguage';
import SerialU32 from './SerialU32';
/**
 * Defines the protocol for communication between the worker and the main program.
 */
export namespace Protocol {
  export namespace Worker {
    /**
     * Represents a request to start the worker.
     */
    export interface StartRequest {
      type: 'start';
      language: ProgrammingLanguage;
      code: string;
    }

    /**
     * Represents a request sent to the worker.
     */
    export type Request = (
      StartRequest |
      SetSharedRegistersRequest |
      SetCreateSerialRequest |
      SetSharedConsoleRequest |
      ProgramOutputRequest |
      ProgramErrorRequest |
      WorkerReadyRequest |
      StoppedRequest
    );

    /**
     * Represents a response to a start request.
     */
    export interface StartResponse {
      type: 'start';
    }

    /**
     * Represents a request to set the shared registers.
     */
    export interface SetSharedRegistersRequest {
      type: 'set-shared-registers';
      sharedArrayBuffer: SharedArrayBuffer;
    }

    export interface SetCreateSerialRequest {
      type: 'set-create-serial';
      tx: SharedArrayBuffer;
      rx: SharedArrayBuffer;
    }

    export namespace SetCreateSerialRequest {
      export const fromSerialU32 = (serial: SerialU32): SetCreateSerialRequest => ({
        type: 'set-create-serial',
        tx: serial.tx.sharedArrayBuffer,
        rx: serial.rx.sharedArrayBuffer,
      });
    }

    /**
     * Represents a request to set the shared console.
     */
    export interface SetSharedConsoleRequest {
      type: 'set-shared-console';
      sharedArrayBuffer: SharedArrayBuffer;
    }

    /**
     * Represents a request indicating that the program has ended.
     */
    export interface ProgramEndedRequest {
      type: 'program-ended'
    }

    /**
     * Represents a response indicating that the program has ended.
     */
    export interface ProgramEndedResponse {
      type: 'program-ended'
    }

    /**
     * Represents a response sent by the worker.
     */
    export type Response = StartResponse | ProgramEndedResponse;

    /**
     * Represents a request to output program data.
     */
    export interface ProgramOutputRequest {
      type: 'program-output';
      stdoutput: string;
    }
    
    /**
     * Represents a request to output program error data.
     */
    export interface ProgramErrorRequest {
      type: 'program-error';
      stdoutput: string;
      stderror: string;
    }
    
    /**
     * Represents a request indicating that the worker is ready.
     */
    export interface WorkerReadyRequest {
      type: 'worker-ready';
    }

    /**
     * Represents a request indicating that the worker has stopped.
     */
    export interface StoppedRequest {
      type: 'stopped'
    }
  }
}

export default Protocol;