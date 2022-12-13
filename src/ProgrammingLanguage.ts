type ProgrammingLanguage = 'c' | 'cpp' | 'python';

namespace ProgrammingLanguage {
  export const fileExtension = (language: ProgrammingLanguage) => {
    switch (language) {
      case 'c':
        return 'c';
      case 'cpp':
        return 'cpp';
      case 'python':
        return 'py';
    }
  };

  export const defaultCode = (language: ProgrammingLanguage) => {
    switch (language) {
      case 'c':
        return '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main()\n{\n  printf("Hello, World!\\n");\n  return 0;\n}\n';
      case 'cpp':
        return '#include <iostream>\n#include <kipr/wombat.hpp>\n\nint main()\n{\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}\n';
      case 'python':
        return 'from kipr import *\n\nprint(\'Hello, World!\')';
    }
  };

}

export default ProgrammingLanguage;