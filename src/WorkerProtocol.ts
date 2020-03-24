export namespace Protocol {
  export namespace Worker {
    export interface StartRequest {
      type: 'start';
      code: string;
    }

    export interface StopRequest {
      type: 'stop';
    }

    export type Request = StartRequest | StopRequest;

    export interface StartResponse {
      type: 'start';
    }

    export interface StopResponse {
      type: 'stop';
    }

    export type Response = StartResponse | StopResponse;

  }

  export namespace Host {
    
  }
}

export default Protocol;