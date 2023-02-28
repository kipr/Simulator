interface EnumerationDocumentation {
  id: string;
  name: string;
  values: EnumerationDocumentation.Value[];
  brief_description?: string;
  detailed_description?: string;
}

namespace EnumerationDocumentation {
  export interface Value {
    name: string;
    brief_description?: string;
    detailed_description?: string;
  }

  export const compare = (a: EnumerationDocumentation, b: EnumerationDocumentation) => a.name.localeCompare(b.name);
}

export default EnumerationDocumentation;