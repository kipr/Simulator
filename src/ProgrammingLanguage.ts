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
}

export default ProgrammingLanguage;