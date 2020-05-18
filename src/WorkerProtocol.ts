export namespace Protocol {
  export namespace Worker {
    export interface StartRequest {
      type: 'start';
      code: string;
    }

    export interface StopRequest {
      type: 'stop';
      hello: string;
    }

    export interface CompileRequest {
      type: 'compile';
      code: string;
    }

    export type Request = StartRequest | StopRequest | CompileRequest | SetRegisterRequest | ProgramEndedRequest | ProgramOutputRequest | ProgramErrorRequest | SetMotorPositionRequest;

    export interface StartResponse {
      type: 'start';
    }

    export interface StopResponse {
      type: 'stop';
    }

    export interface CompileResponse {
      type: 'compile';
    }

    export interface ProgramEndedRequest {
      type: 'program-ended'
    }

    export interface ProgramEndedResponse {
      type: 'program-ended'
    }

    export type Response = StartResponse | StopResponse | CompileResponse | SetRegisterResponse | ProgramEndedResponse | SetMotorPositionResponse;


    export interface SetRegisterRequest {
      type: 'setregister';
      address: number;
      value: number;
    }

    export interface SetRegisterResponse {
      type: 'setregister';
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

    export interface SetMotorPositionRequest {
      type: 'setmotorposition';
      motor: number;
    }

    export interface SetMotorPositionResponse {
      type: 'setmotorposition';
      motor: number;
    }
  }

  export namespace Host {
    
  }
}

export default Protocol;