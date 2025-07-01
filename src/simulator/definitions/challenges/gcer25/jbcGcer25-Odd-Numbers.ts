import Challenge from '../../../../state/State/Challenge';
import jbc5 from '../jbc5-Odd-Numbers';
import tr from '@i18n';

export default {
  ...jbc5,
  name: tr('GCER 2025: Odd Numbers'),
  description: tr('GCER 2025 special event. Drive over the odd numbered circles in order, but make sure to avoid the evens!'),
  sceneId: 'Odd_Numbers',
} as Challenge;
