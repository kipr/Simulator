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

    export type Request = StartRequest | StopRequest | SetRegisterRequest;

    export interface StartResponse {
      type: 'start';
    }

    export interface StopResponse {
      type: 'stop';
    }

    export type Response = StartResponse | StopResponse | SetRegisterResponse;


    export interface SetRegisterRequest {
      type: 'setregister';
      address: number;
      value: number;
    }

    export interface SetRegisterResponse {
      type: 'setregister';
    }



    /*export interface GetRegister {
      type: 'getregister';
      address: string;
      value: number;
    }*/

    

    

  }

  export namespace Host {
    
  }
}

export default Protocol;