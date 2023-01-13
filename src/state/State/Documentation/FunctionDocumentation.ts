interface FunctionDocumentation {
  id: string;
  name: string;
  parameters: FunctionDocumentation.Parameter[];
  return_type: string;
  return_description?: string;
  brief_description?: string;
  detailed_description?: string;
}

namespace FunctionDocumentation {
  export const compare = (a: FunctionDocumentation, b: FunctionDocumentation) => a.name.localeCompare(b.name);
  
  export interface Parameter {
    name: string;
    type: string;
    description: string;
  }
}

export default FunctionDocumentation;