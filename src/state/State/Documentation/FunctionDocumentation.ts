interface FunctionDocumentation {
  id: string;
  name: string;
  parameters: FunctionDocumentation.Parameter[];
  return_type: string;
  return_description?: string;
  brief_description?: string;
}

namespace FunctionDocumentation {
  export interface Parameter {
    name: string;
    type: string;
    description: string;
  }
}

export default FunctionDocumentation;