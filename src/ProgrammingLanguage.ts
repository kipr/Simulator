type ProgrammingLanguage = 'c' | 'cpp' | 'python';

namespace ProgrammingLanguage {
  export const FILE_EXTENSION: { [key in ProgrammingLanguage]: string } = {
    c: 'c',
    cpp: 'cpp',
    python: 'py'
  };


  export const DEFAULT_CODE: { [key in ProgrammingLanguage]: string } = {
    c: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main()\n{\n  printf("Hello, World!\\n");\n  return 0;\n}\n',
    cpp: '#include <iostream>\n#include <kipr/wombat.hpp>\n\nint main()\n{\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}\n',
    python: 'from kipr import *\n\nprint(\'Hello, World!\')'
  };
}

export default ProgrammingLanguage;