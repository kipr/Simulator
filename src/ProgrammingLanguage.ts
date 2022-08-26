type ProgrammingLanguage = 'c' | 'python';

namespace ProgrammingLanguage {
  export const fileExtension = (language: ProgrammingLanguage) => {
    switch (language) {
      case 'c':
        return 'c';
      case 'python':
        return 'py';
    }
  };
}

export default ProgrammingLanguage;