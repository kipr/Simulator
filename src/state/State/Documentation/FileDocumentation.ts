interface FileDocumentation {
  id: string;
  name: string;
  functions: string[];
  structures: string[];
  enumerations: string[];
}

namespace FileDocumentation {
  export const compare = (a: FileDocumentation, b: FileDocumentation) => a.name.localeCompare(b.name);
}

export default FileDocumentation;