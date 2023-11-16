namespace Reference {
  export enum Type {
    Local = 'local',
    Remote = 'remote',
  }

  export interface Local<T> {
    type: Type.Local;
    value: T;
  }

  export interface Remote {
    type: Type.Remote;
    id: string;
  }
}

type Reference<T> = (
  Reference.Local<T> |
  Reference.Remote
);

export default Reference;