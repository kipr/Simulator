import * as fs from 'fs';
import * as path from 'path';
import * as typescript from 'typescript';

const tsConfigPath = path.resolve(__dirname, '..', 'tsconfig.json');
const tsConfig = typescript.readConfigFile(tsConfigPath, (path) => fs.readFileSync(path, 'utf8'));

const compilerOptions = tsConfig.config.compilerOptions as typescript.CompilerOptions;

// TypeScript complains about moduleResolution being "node".
// We don't need it, so we can just delete it.
delete compilerOptions.moduleResolution;

const walkDir = (dir: string, callback: (file: string) => void) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (stat.isFile()) {
      callback(filePath);
    }
  }
};

const rootNames = [];

walkDir(path.resolve(__dirname, '..', 'src'), file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) rootNames.push(file);
});

const program = typescript.createProgram({
  rootNames: rootNames,
  options: compilerOptions,
});

const sourceFiles = program.getSourceFiles();

interface Tr {
  id: string;
  description?: string;
}

const findTrs = (funcName: string, sourceFile: typescript.SourceFile, node: typescript.Node) => {
  let ret: Tr[] = [];
  
  if (typescript.isCallExpression(node)) {
    const expression = node.expression;
    if (typescript.isIdentifier(expression)) {
      if (expression.text === funcName) {
        const id = node.arguments[0];
        if (typescript.isStringLiteral(id)) {
          const description = node.arguments[1];
          if (description !== undefined && typescript.isStringLiteral(description)) {
            ret.push({ id: id.text, description: description.text });
          } else {
            ret.push({ id: id.text });
          }
        }
      }
    }
  }
  
  const children = node.getChildren(sourceFile);
  for (const child of children) ret = [...ret, ...findTrs(funcName, sourceFile, child)];
  return ret;
};

interface Entry {
  descriptions: string[];
  translations: { [key: string]: string };
}

const i18nJsonPath = path.resolve(__dirname, 'i18n.json');

const existingTrDict = fs.existsSync(i18nJsonPath) ? JSON.parse(fs.readFileSync(i18nJsonPath, 'utf8')) : {} as { [key: string]: Entry };
const trDict: { [key: string]: Entry } = {};

for (const sourceFile of sourceFiles) {
  const trs = findTrs('tr', sourceFile, sourceFile);
  for (const tr of trs) {
    const { id, description } = tr;
    if (id in trDict) {
      if (description !== undefined) {
        trDict[id].descriptions.push(description);
      }
    } else {
      trDict[id] = {
        descriptions: description !== undefined ? [description] : [],
        translations: existingTrDict[id] !== undefined ? existingTrDict[id].translations : {},
      };
    }
  }
}

// Write the new i18n.json file.
fs.writeFileSync(path.resolve(__dirname, 'i18n.json'), JSON.stringify(trDict, null, 2));