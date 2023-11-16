import construct from '../../../util/redux/construct';

namespace DocumentationLocation {
  export enum Type {
    None,
    File,
    Function,
    Module,
    Structure,
    Enumeration
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  export interface Function {
    type: Type.Function;
    id: string;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  export const func = construct<Function>(Type.Function);

  export interface Module {
    type: Type.Module;
    id: string;
  }

  export const module = construct<Module>(Type.Module);

  export interface Structure {
    type: Type.Structure;
    id: string;
  }

  export const structure = construct<Structure>(Type.Structure);

  export interface Enumeration {
    type: Type.Enumeration;
    id: string;
  }

  export const enumeration = construct<Enumeration>(Type.Enumeration);
}

type DocumentationLocation = (
  DocumentationLocation.None |
  DocumentationLocation.File |
  DocumentationLocation.Function |
  DocumentationLocation.Module |
  DocumentationLocation.Structure |
  DocumentationLocation.Enumeration
);

export default DocumentationLocation;