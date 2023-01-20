export const toPythonType = (type: string) => {
  switch (type) {
    case 'void': return 'None';
    case 'unsigned char': return 'int';
    case 'signed char': return 'int';
    case 'char': return 'int';
    case 'unsigned short': return 'int';
    case 'signed short': return 'int';
    case 'short': return 'int';
    case 'int': return 'int';
    case 'signed int': return 'int';
    case 'unsigned int': return 'int';
    case 'float': return 'float';
    case 'double': return 'float';
    case 'bool': return 'bool';
    // str
    case 'char *': return 'str';
    case 'char*': return 'str';
    case 'char * const': return 'str';
    case 'char *const': return 'str';
    case 'const char *': return 'str';
    case 'const char*': return 'str';
    case 'const char * const': return 'str';
    case 'const char *const': return 'str';
    // bytes
    case 'unsigned char *': return 'bytes';
    case 'unsigned char*': return 'bytes';
    case 'unsigned char * const': return 'bytes';
    case 'unsigned char *const': return 'bytes';
    case 'const unsigned char *': return 'bytes';
    case 'const unsigned char*': return 'bytes';
    case 'const unsigned char * const': return 'bytes';
    case 'const unsigned char *const': return 'bytes';
    default: return type;
  }
};