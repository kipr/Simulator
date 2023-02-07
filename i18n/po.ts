import * as path from 'path';
import * as gettextParser from 'gettext-parser';

export const PO_PATH = path.resolve(__dirname, 'po');

export const DEFAULT_PO: gettextParser.GetTextTranslations = {
  charset: 'utf-8',
  headers: {},
  translations: {}
};