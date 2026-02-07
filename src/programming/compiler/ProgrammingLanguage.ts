type ProgrammingLanguage = 'c' | 'cpp' | 'python' | 'plaintext' | 'graphical';

namespace ProgrammingLanguage {
  export const FILE_EXTENSION: { [key in ProgrammingLanguage]: string } = {
    c: 'c',
    cpp: 'cpp',
    python: 'py',
    plaintext: 'txt',
    graphical: 'graphical'
  };


  export const DEFAULT_CODE: { [key in ProgrammingLanguage]: string } = {
    c: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main()\n{\n  printf("Hello, World!\\n");\n\n  return 0;\n}\n',
    cpp: '#include <iostream>\n#include <kipr/wombat.hpp>\n\nint main()\n{\n  std::cout << "Hello, World!" << std::endl;\n\n  return 0;\n}\n',
    python: 'from kipr import *\n\nprint(\'Hello, World!\')',
    plaintext: '*Your User Data Here*',
    graphical: `<xml xmlns="http://www.w3.org/1999/xhtml">
                <variables></variables>
                <block type="control_run" id="Tr7;}P}KM[{|.$;Wo9_1" x="176" y="129">
                  <next>
                    <block type="control_printf" id="*wt6^HnMX#w},]R6)*w}">
                      <value name="STRING">
                        <shadow type="text" id="2R).HZf7nqV:od^Se=3+">
                          <field name="TEXT">Hello, World!</field>
                        </shadow>
                      </value>
                    </block>
                  </next>
                </block>
              </xml>`
  };

  export const BLANK_CODE: { [key in ProgrammingLanguage]: string } = {
    c: '#include <stdio.h>\n#include <kipr/wombat.h>\n',
    cpp: '#include <iostream>\n#include <kipr/wombat.hpp>\n',
    python: '#!/usr/bin/python3\nimport os, sys\nsys.path.append("/usr/lib")\nfrom kipr import *\n',
    plaintext: '',
    graphical: ''
  };
}


export default ProgrammingLanguage;