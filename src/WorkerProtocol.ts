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

    export type Request = StartRequest | SetRegisterRequest | ProgramEndedRequest | ProgramOutputRequest | ProgramErrorRequest;

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

    export interface ProgramOutputRequest {
      type: 'programoutput';
      stdoutput: string;
    }
    
    export interface ProgramErrorRequest {
      type: 'programerror';
      stdoutput: string;
      stderror: string;
    }
  }

  export namespace Host {
    
  }
}

export default Protocol;