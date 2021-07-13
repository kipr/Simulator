export namespace Protocol {
  export namespace Worker {
    export interface Register {
      address: number;
      value: number;
    }
    
    export interface StartRequest {
      type: 'start';
      code: string;
    }

    export type Request = (
      StartRequest |
      SetRegisterRequest |
      ProgramEndedRequest |
      ProgramOutputRequest |
      ProgramErrorRequest |
      WorkerReadyRequest |
      StoppedRequest
    );

    export interface StartResponse {
      type: 'start';
    }

    export interface ProgramEndedRequest {
      type: 'program-ended'
    }

    export interface ProgramEndedResponse {
      type: 'program-ended'
    }

    export type Response = StartResponse | ProgramEndedResponse;


    export interface SetRegisterRequest {
      type: 'setregister';
      registers: Register[];
    }

    export interface SetRegistersRequest {
      type: 'setregisters';
      // Layout: Address is in second byte, value in low byte ((address & 0x0F) << 8 | (value & 0xFF))
      values: number[];
    }

    export interface SetRegistersResponse {
      type: 'setregisters';
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

  export namespace Host {
    export interface GetRegistersRequest {
      type: 'get-registers'
    }

    export interface GetRegistersResponse {
      type: 'get-registers';
      values: number[];
    }
  }
}

export default Protocol;