import Dict from '../../../Dict';
import EnumerationDocumentation from './EnumerationDocumentation';
import DocumentationLocation from './DocumentationLocation';
import FileDocumentation from './FileDocumentation';
import FunctionDocumentation from './FunctionDocumentation';
import ModuleDocumentation from './ModuleDocumentation';
import StructureDocumentation from './StructureDocumentation';
import TypeDocumentation from './TypeDocumentation';

interface Documentation {
  files: Dict<FileDocumentation>;
  functions: Dict<FunctionDocumentation>;
  modules: Dict<ModuleDocumentation>;
  structures: Dict<StructureDocumentation>;
  enumerations: Dict<EnumerationDocumentation>;
  types: Dict<TypeDocumentation>;
}

namespace Documentation {
  export const EMPTY: Documentation = {
    files: {},
    functions: {},
    modules: {},
    structures: {},
    enumerations: {},
    types: {},
  };

  export interface SubsetParams {
    files?: string[];
    functions?: string[];
    modules?: string[];
    structures?: string[];
    enumerations?: string[];
    types?: string[];
  }

  export const subset = (doc: Documentation, params: SubsetParams): Documentation => {
    const ret: Documentation = {
      files: {},
      functions: {},
      modules: {},
      structures: {},
      enumerations: {},
      types: {},
    };

    for (const file of params.files || []) ret.files[file] = doc.files[file];
    for (const func of params.functions || []) ret.functions[func] = doc.functions[func];
    for (const module of params.modules || []) ret.modules[module] = doc.modules[module];
    for (const type of params.structures || []) ret.structures[type] = doc.structures[type];
    for (const type of params.enumerations || []) ret.enumerations[type] = doc.enumerations[type];
    for (const type of params.types || []) ret.types[type] = doc.types[type];

    return ret;
  };

  export const lookup = (doc: Documentation, query: string): DocumentationLocation => {
    for (const funcId in doc.functions) {
      const func = doc.functions[funcId];
      if (func.name === query) return DocumentationLocation.func({ id: funcId });
    }

    for (const structId in doc.structures) {
      const struct = doc.structures[structId];
      if (struct.name === query) return DocumentationLocation.structure({ id: structId });
    }

    for (const enumId in doc.enumerations) {
      const enum_ = doc.enumerations[enumId];
      if (enum_.name === query) return DocumentationLocation.enumeration({ id: enumId });
    }

    for (const moduleId in doc.modules) {
      const module = doc.modules[moduleId];
      if (module.name === query) return DocumentationLocation.module({ id: moduleId });
    }
    
    for (const fileId in doc.files) {
      const file = doc.files[fileId];
      if (file.name === query) return DocumentationLocation.file({ id: fileId });
    }

    return undefined;
  };

}

export default Documentation;