import Challenge from '../../../../state/State/Challenge';
import jbc8 from '../jbc8-Bulldozer-Mania';
import tr from '@i18n';

export default {
  ...jbc8,
  name: tr('GCER 2025: Bulldozer Mania'),
  description: tr('GCER 2025 special event. Bring as many cans behind the starting line as you can. Make sure they stay upright!'),
  sceneId: 'Bulldozer_Mania',
} as Challenge;
