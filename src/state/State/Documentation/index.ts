import Dict from '../../../Dict';
import FileDocumentation from './FileDocumentation';
import FunctionDocumentation from './FunctionDocumentation';

interface Documentation {
  files: Dict<FileDocumentation>;
  functions: Dict<FunctionDocumentation>;
  modules: Dict<any>;
  types: Dict<any>;
}

namespace Documentation {
  export const EMPTY: Documentation = {
    files: {},
    functions: {},
    modules: {},
    types: {},
  };
}

export default Documentation;