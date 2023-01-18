import Dict from '../../../Dict';
import EnumerationDocumentation from './EnumerationDocumentation';
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
}

export default Documentation;