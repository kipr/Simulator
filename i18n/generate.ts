import * as fs from 'fs';
import * as path from 'path';
import * as typescript from 'typescript';
import * as gettextParser from 'gettext-parser';
import LocalizedString from '../src/util/LocalizedString';
import { DEFAULT_PO, PO_PATH } from './po';
import { walkDir } from './util';

const tsConfigPath = path.resolve(__dirname, '..', 'tsconfig.json');
const tsConfig = typescript.readConfigFile(tsConfigPath, (path) => fs.readFileSync(path, 'utf8'));

const compilerOptions = tsConfig.config.compilerOptions as typescript.CompilerOptions;

// TypeScript complains about moduleResolution being "node".
// We don't need it, so we can just delete it.
delete compilerOptions.moduleResolution;

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
  enUs: string;
  description?: string;
}

const findTrs = (funcName: string, sourceFile: typescript.SourceFile, node: typescript.Node) => {
  let ret: Tr[] = [];
  
  if (typescript.isCallExpression(node)) {
    const expression = node.expression;
    if (typescript.isIdentifier(expression)) {
      if (expression.text === funcName) {
        const enUs = node.arguments[0];
        if (typescript.isStringLiteral(enUs)) {
          const description = node.arguments[1];
          if (description !== undefined && typescript.isStringLiteral(description)) {
            ret.push({ enUs: enUs.text, description: description.text });
          } else {
            ret.push({ enUs: enUs.text });
          }
        }
      }
    }
  }
  
  const children = node.getChildren(sourceFile);
  for (const child of children) ret = [...ret, ...findTrs(funcName, sourceFile, child)];
  return ret;
};



const trDict: { [locale in LocalizedString.Language]?: gettextParser.GetTextTranslations } = {};

// Load existing PO files


for (const language of LocalizedString.SUPPORTED_LANGUAGES) {
  const poPath = path.resolve(PO_PATH, `${language}.po`);
  if (!fs.existsSync(poPath)) continue;
  if (language === LocalizedString.AR_SA) console.log(fs.readFileSync(poPath, 'utf8'));
  const po = gettextParser.po.parse(fs.readFileSync(poPath, 'utf8'));
  trDict[language] = po;
  if (language === LocalizedString.AR_SA) console.log(`Loaded ${language}.po`, JSON.stringify(po, null, 2));
}

for (const sourceFile of sourceFiles) {
  const trs = findTrs('tr', sourceFile, sourceFile);
  for (const language of LocalizedString.SUPPORTED_LANGUAGES) {
    const po: gettextParser.GetTextTranslations = trDict[language] || DEFAULT_PO;
    trDict[language] = po;
    for (const tr of trs) {
      const { enUs, description } = tr;
    
      const context = description || '';
      if (!po.translations) po.translations = {};
      if (!po.translations[context]) po.translations[context] = {};
      const translation = po.translations[context][enUs];
      if (translation) continue;

      if (context.length > 0) console.log(`Adding ${language} translation for "${enUs}" (context: "${context}")`);

      po.translations[context][enUs] = {
        msgid: enUs,
        msgctxt: context,
        msgstr: [''],
      };

    }
  }
}

// Write the PO files
for (const language of LocalizedString.SUPPORTED_LANGUAGES) {
  const poPath = path.resolve(PO_PATH, `${language}.po`);
  const po = trDict[language];
  if (!po) continue;
  fs.writeFileSync(poPath, gettextParser.po.compile(po), 'utf8');
}