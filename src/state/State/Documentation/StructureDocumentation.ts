interface StructureDocumentation {
  id: string;
  name: string;
  members: StructureDocumentation.Member[];
  brief_description?: string;
  detailed_description?: string;
}

namespace StructureDocumentation {
  export interface Member {
    name: string;
    type: string;
    brief_description?: string;
    detailed_description?: string;
  }

  export const compare = (a: StructureDocumentation, b: StructureDocumentation) => a.name.localeCompare(b.name);
}

export default StructureDocumentation;