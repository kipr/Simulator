import construct from '../../../util/construct';

namespace DocumentationLocation {
  export enum Type {
    None,
    File,
    Function,
    Module
  }

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };

  export interface File {
    type: Type.File;
    id: string;
  }

  export const file = construct<File>(Type.File);

  export interface Function {
    type: Type.Function;
    id: string;
  }

  export const func = construct<Function>(Type.Function);

  export interface Module {
    type: Type.Module;
    id: string;
  }

  export const module = construct<Module>(Type.Module);
}

type DocumentationLocation = DocumentationLocation.None | DocumentationLocation.File | DocumentationLocation.Function | DocumentationLocation.Module;

export default DocumentationLocation;