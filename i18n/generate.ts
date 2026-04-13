import * as fs from 'fs';
import * as path from 'path';
import * as typescript from 'typescript';
import * as gettextParser from 'gettext-parser';
import LocalizedString from '../src/util/LocalizedString';
import { DEFAULT_PO, PO_PATH } from './po';
import { walkDir } from './util';

const tsConfigPath = path.resolve(__dirname, '..', 'tsconfig.json');

const readResult = typescript.readConfigFile(tsConfigPath, (p) => fs.readFileSync(p, 'utf8'));
if (readResult.error) {
  const msg = typescript.flattenDiagnosticMessageText(readResult.error.messageText, '\n');
  throw new Error(`Failed to read tsconfig: ${msg}`);
}

const parsed = typescript.parseJsonConfigFileContent(
  readResult.config,
  typescript.sys,
  path.dirname(tsConfigPath),
  /*existingOptions*/ undefined,
  tsConfigPath
);

if (parsed.errors?.length) {
  const msg = parsed.errors
    .map(e => typescript.flattenDiagnosticMessageText(e.messageText, '\n'))
    .join('\n');
  throw new Error(`Failed to parse tsconfig:\n${msg}`);
}

const compilerOptions = parsed.options;

// If you still want to drop moduleResolution for your script, do it here (but usually you don't need to)
delete (compilerOptions as any).moduleResolution;

const rootNames: string[] = [];
walkDir(path.resolve(__dirname, '..', 'src'), file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) rootNames.push(file);
});

const program = typescript.createProgram({
  rootNames,
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