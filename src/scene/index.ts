export interface Scene {
  id: string;
  name: string;
  author: string;
  description: string;

  objects: Scene.Object[];
}

export namespace Scene {
  export interface Object {
    id: string;
    name: string;

    editable?: boolean;
    hidden?: boolean;
  }

  export namespace Object {
  
    export enum Type {
      Fixed,
      Dynamic,
    }
  }
}
