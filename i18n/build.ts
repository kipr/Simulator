import * as gettextParser from 'gettext-parser';
import * as fs from 'fs';
import * as path from 'path';
import { walkDir } from './util';
import { PO_PATH } from './po';
import { I18n } from '../src/i18n';
import LocalizedString from '../src/util/LocalizedString';


const ret: I18n = {};

walkDir(PO_PATH, file => {
  if (!file.endsWith('.po')) return;

  const po = gettextParser.po.parse(fs.readFileSync(file, 'utf8'));
  const lang = path.basename(file, '.po');
  for (const context in po.translations) {
    if (!ret[context]) ret[context] = {};
    
    const contextTranslations = po.translations[context];
    for (const enUs in contextTranslations) {
      if (enUs.length === 0) continue;
      const translation = contextTranslations[enUs];
      if (translation.msgstr[0].length === 0 && lang !== LocalizedString.EN_US) continue;
      ret[context][enUs] = {
        ...ret[context][enUs] || {},
        [lang]: translation.msgstr[0],
        [LocalizedString.EN_US]: enUs,
      };
    }
  }
});

fs.writeFileSync(path.resolve(__dirname, 'i18n.json'), JSON.stringify(ret, null, 2));