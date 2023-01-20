interface ModuleDocumentation {
  id: string;
  name: string;
  functions: string[];
  structures: string[];
  enumerations: string[];
}

namespace ModuleDocumentation {
  export const compare = (a: ModuleDocumentation, b: ModuleDocumentation) => a.name.localeCompare(b.name);
}

export default ModuleDocumentation;