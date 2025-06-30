import Scene from '../../../state/State/Scene';
import { JBC_5 } from './jbc5-Odd-Numbers';

import tr from '@i18n';

export const Odd_Numbers: Scene = {
  ...JBC_5,
  name: tr('GCER 2025: Odd Numbers'),
  description: tr('GCER 2025 special event. Drive over the odd numbered circles in order, but make sure to avoid the evens!'),
};
