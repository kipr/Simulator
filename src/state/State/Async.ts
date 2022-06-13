namespace Async {
  export enum Type {
    Unloaded,
    Loading,
    Loaded,
    Failed,
  }

  export interface Unloaded {
    type: Type.Unloaded;
  }

  export type UnloadedParams = Omit<Unloaded, 'type'>;

  export const unloaded = (params: UnloadedParams): Unloaded => ({
    type: Type.Unloaded,
    ...params
  });

  export interface Loading {
    type: Type.Loading;
    uri: string;
  }

  export type LoadingParams = Omit<Loading, 'type'>;

  export const loading = (params: LoadingParams): Loading => ({
    type: Type.Loading,
    ...params
  });

  export interface Loaded<T> {
    type: Type.Loaded;
    value: T;
  }

  export type LoadedParams<T> = Omit<Loaded<T>, 'type'>;

  export const loaded = <T>(params: LoadedParams<T>): Loaded<T> => ({
    type: Type.Loaded,
    ...params
  });

  export interface Failed {
    type: Type.Failed;
    error: string;
  }

  export type FailedParams = Omit<Failed, 'type'>;

  export const failed = (params: FailedParams): Failed => ({
    type: Type.Failed,
    ...params
  });
}

type Async<T> = Async.Unloaded | Async.Loading | Async.Loaded<T> | Async.Failed;

export default Async;